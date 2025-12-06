import * as THREE from "three";
import { atualizaControlesVeiculo, setVelocidade } from "../jogo/Teclas.js";
import { getMuretas } from "../jogo/Pista.js";
import { SistemaDisparos } from "../jogo/SistemaDisparos.js";
import {
  verificarColisao,
  resolverColisaoDeslizante,
} from "../jogo/Colisao.js";
import contadorVoltas from "../jogo/ContadorVoltas.js";
import { atualizarLuz } from "./Luz.js";

const clock = new THREE.Clock();

// --- Câmera em Terceira Pessoa ---
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

    // Pega velocidade e direção do 'Teclas.js'
    const state = atualizaControlesVeiculo(deltaTime);

    // --- Atualiza Posição do Veículo ---
    if (state.velocidade !== 0) {
      let directionFactor = state.velocidade > 0 ? 1 : -1;
      jogador.rotateY(state.direção * directionFactor * deltaTime * 60);
    }
    jogador.translateZ(state.velocidade * deltaTime);

    // --- Colisão ---
    const muretas = getMuretas();
    const colisao = verificarColisao(jogador.position, muretas, 0.4);

    if (colisao.colidiu) {
      const novaVelocidade = resolverColisaoDeslizante(jogador, colisao, state);
      setVelocidade(novaVelocidade);
    }

    // --- IA: Colisão ---
    if (adversario) {
      const colisaoIA = verificarColisao(adversario.position, muretas, 0.8);
      
      if (colisaoIA.colidiu) {
        adversario.velocidadeAtual *= 0.5;
        
        const normal = colisaoIA.normal.clone().multiplyScalar(0.5);
        adversario.group.position.add(normal);
        adversario.position.copy(adversario.group.position);
      }
    }

    // --- Colisão entre veículos ---
    const distanciaEntreVeiculos = jogador.position.distanceTo(adversario.position);

    if (distanciaEntreVeiculos < 2.0) {
      const separacao = new THREE.Vector3()
        .subVectors(jogador.position, adversario.position)
        .normalize()
        .multiplyScalar(0.2);
      
      jogador.group.position.add(separacao);
      jogador.position.copy(jogador.group.position);
      
      adversario.group.position.sub(separacao);
      adversario.position.copy(adversario.group.position);
      
      jogador.velocidadeAtual *= 0.8;
      adversario.velocidadeAtual *= 0.8;
    }

    // --- Contador de Voltas COM RECARGA ---
    const voltasAntes = contadorVoltas.voltas;
    contadorVoltas.verificarPassagem(jogador.position);
    const voltasDepois = contadorVoltas.voltas;

    if (voltasDepois > voltasAntes) {
      jogador.recarregarDisparos();
      console.log("Volta completa! Munição recarregada!");
    }

    // --- Atualiza IA ---
    if (adversario && adversario.atualizar) {
       adversario.atualizar(deltaTime, jogador);
    }

    // --- Atualiza Sistema de Disparos ---
    if (sistemaDisparos) {
      const muretas = getMuretas();
      sistemaDisparos.atualizar(deltaTime, [jogador, adversario], muretas);
    }

    // --- Atualiza a Luz ---
    atualizarLuz(jogador);

    // --- Lógica da Câmera ---
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