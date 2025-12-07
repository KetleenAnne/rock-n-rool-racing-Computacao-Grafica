import * as THREE from "three";
import { atualizaControlesVeiculo, setVelocidade } from "../jogo/Teclas.js";
import { getMuretas } from "../jogo/Pista.js";
import {
  verificarColisao,
  resolverColisaoDeslizante,
} from "../jogo/Colisao.js";
import contadorVoltas from "../jogo/ContadorVoltas.js";
import sistemaCheckpoints from "../jogo/SistemaCheckpoints.js";
import { atualizarLuz } from "./Luz.js";

const clock = new THREE.Clock();

const offsetCamera = new THREE.Vector3(0, 4, -8);
const lerp_camera = 0.08;
const lateral_camera = 50.0;
let focoCamera = new THREE.Vector3(0, 2.0, 0);
let currentLookAt = new THREE.Vector3();

export function startLoop(renderer, scene, camera, jogador, adversario, sistemaDisparos, stats) {
  currentLookAt.copy(jogador.position).add(focoCamera);

  function render() {
    const deltaTime = clock.getDelta();
    stats.update();

    const state = atualizaControlesVeiculo(deltaTime);

    // --- Referência dinâmica do adversário ---
    const adv = (typeof window !== 'undefined' && window.adversario) ? window.adversario : adversario;

    // --- Atualização de Penalização ---
    jogador.atualizarPenalizacao(deltaTime);

    // --- Rotação ---
    if (state.velocidade !== 0) {
      let directionFactor = state.velocidade > 0 ? 1 : -1;
      jogador.rotateY(state.direção * directionFactor * deltaTime * 60);
    }

    // --- Movimento com penalização aplicada ---
    const velJog = jogador.penalizado ? jogador.velocidadeAtual : state.velocidade;
    jogador.translateZ(velJog * deltaTime);

    // --- Colisão ---
    const muretas = getMuretas();
    const colisao = verificarColisao(jogador.position, muretas, 0.6);

    if (colisao.colidiu) {
      const novaVelocidade = resolverColisaoDeslizante(jogador, colisao, state);
      setVelocidade(novaVelocidade);
    }

    // ========== CHECKPOINTS ==========
    sistemaCheckpoints.verificarPassagem(jogador.position);

    if (window.linhaCheckpoints) {
      const progresso = sistemaCheckpoints.getProgresso();
      window.linhaCheckpoints.innerHTML = `Checkpoints: ${progresso.atual}/${progresso.total}`;

      if (progresso.completo) {
        window.linhaCheckpoints.style.color = "lime";
        window.linhaCheckpoints.innerHTML += " ✓";
      } else {
        window.linhaCheckpoints.style.color = "cyan";
      }
    }

    // --- Contador de Voltas + Recarga ---
    const voltasAntes = contadorVoltas.voltas;
    const resultadoVolta = contadorVoltas.verificarPassagem(jogador.position);
    const voltasDepois = contadorVoltas.voltas;

    if (voltasDepois > voltasAntes) {
      jogador.recarregarDisparos();
      console.log("Volta completa! Munição recarregada!");
    }

    if (resultadoVolta && resultadoVolta.voltaInvalida) {
      console.warn(`⚠️ Passe por todos os checkpoints! Faltam: ${resultadoVolta.checkpointsFaltando}`);
    }

    // Contador de voltas da IA
    if (adv) {
      if (!adv.voltasCompletadas) adv.voltasCompletadas = 0;
      
      const linhaChegadaZ = 100; 
      const distLinha = Math.abs(adv.position.z - linhaChegadaZ);
      
      if (!adv.passouLinha && distLinha < 10 && Math.abs(adv.position.x) < 20) {
        adv.voltasCompletadas++;
        adv.passouLinha = true;
        adv.recarregarDisparos();
        console.log(`IA completou volta ${adv.voltasCompletadas}`);
      } else if (distLinha > 20) {
        adv.passouLinha = false;
      }
    }

    // Verificar fim de jogo (4 voltas)
    if (voltasDepois >= 4 && window.divResultado) {
      window.divResultado.style.display = "block";
      window.divResultado.style.color = "#00FF00";
      window.divResultado.innerHTML = "🏆 VITÓRIA! 🏆<br><small>Você completou 4 voltas!</small>";
    }

    // Se IA completou 4 voltas primeiro
    if (adv && adv.voltasCompletadas >= 4 && window.divResultado) {
      window.divResultado.style.display = "block";
      window.divResultado.style.color = "#FF0000";
      window.divResultado.innerHTML = "💥 DERROTA 💥<br><small>A IA venceu!</small>";
    }

    // --- IA ---
    if (adv && adv.atualizar) {
      adv.atualizar(deltaTime, jogador);
    }

    // --- Colisão IA com muretas ---
    if (adv) {
      const colisaoIA = verificarColisao(adv.position, muretas, 0.6);
      if (colisaoIA.colidiu) {
        adv.velocidadeAtual *= 0.5;
        const normal = colisaoIA.normal.clone().multiplyScalar(0.5);
        if (adv.group) adv.group.position.add(normal);
        if (adv.position && adv.group) adv.position.copy(adv.group.position);
      }
    }

    // --- Colisão entre veículos ---
    if (adv) {
      const distancia = jogador.position.distanceTo(adv.position);
      if (distancia < 2.0) {
        const separacao = new THREE.Vector3()
          .subVectors(jogador.position, adv.position)
          .normalize()
          .multiplyScalar(0.2);

        if (jogador.group) jogador.group.position.add(separacao);
        if (jogador.group) jogador.position.copy(jogador.group.position);

        if (adv.group) adv.group.position.sub(separacao);
        if (adv.group && adv.position) adv.position.copy(adv.group.position);

        jogador.velocidadeAtual *= 0.8;
        adv.velocidadeAtual *= 0.8;
      }
    }

    // --- Sistema de Disparos ---
    if (sistemaDisparos) {
      sistemaDisparos.atualizar(deltaTime, [adv, jogador], muretas);
    }

    // Atualizar UI de disparos
    if (window.linhaDisparos) {
      const icones = "🔴".repeat(jogador.disparosDisponiveis) + 
                    "⚪".repeat(4 - jogador.disparosDisponiveis);
      window.linhaDisparos.innerHTML = `Disparos: ${icones} (${jogador.disparosDisponiveis}/4)`;
    }

    // --- Luz ---
    atualizarLuz(jogador);

    // --- Câmera ---
    let lateralDrift = state.direção * lateral_camera;
    let targetCameraPos = offsetCamera.clone();

    targetCameraPos.x += lateralDrift;
    targetCameraPos.applyQuaternion(jogador.quaternion);
    targetCameraPos.add(jogador.position);

    let targetLookAt = jogador.position.clone().add(focoCamera);

    camera.position.lerp(targetCameraPos, lerp_camera);
    currentLookAt.lerp(targetLookAt, lerp_camera);
    camera.lookAt(currentLookAt);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}
