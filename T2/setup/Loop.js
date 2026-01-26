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
import { atualizarAguas } from "../jogo/Agua.js";
import {
  verificarColisaoJump,
  aplicarEfeitoJump,
  atualizarFisicaJump,
  estaNoAr,
  verificarZonaQueda,
  iniciarQuedaLivre,
  atualizarQuedaLivre,
  estaCaindo,
} from "../jogo/Jump.js";

const clock = new THREE.Clock();

const offsetCamera = new THREE.Vector3(0, 4, -8);
const lerp_camera = 0.08;
const lateral_camera = 50.0;
let focoCamera = new THREE.Vector3(0, 2.0, 0);
let currentLookAt = new THREE.Vector3();

export function startLoop(
  renderer,
  scene,
  camera,
  jogador,
  todosVeiculos,
  sistemaDisparos,
  stats
) {
  currentLookAt.copy(jogador.position).add(focoCamera);

  function render() {
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    stats.update();

    const state = atualizaControlesVeiculo(deltaTime);

    // Filtrar adversários
    const adversarios = todosVeiculos.filter((v) => v !== jogador);

    // ========== ATUALIZAÇÃO DE PENALIZAÇÃO - TODOS OS VEÍCULOS ==========
    todosVeiculos.forEach((veiculo) => {
      if (veiculo) veiculo.atualizarPenalizacao(deltaTime);
    });

    // ========== FÍSICA DE JUMP - JOGADOR ==========
    atualizarFisicaJump(jogador, deltaTime);

    // ========== VERIFICAR ZONA DE QUEDA - JOGADOR ==========
    if (!estaNoAr(jogador) && !estaCaindo(jogador)) {
      if (verificarZonaQueda(jogador.position)) {
        iniciarQuedaLivre(jogador);
      }
    }

    // ========== ATUALIZAR QUEDA LIVRE - JOGADOR ==========
    atualizarQuedaLivre(jogador, deltaTime);

    // Verificar se passou por um jump (só ativa se NÃO estiver no ar e NÃO estiver caindo)
    if (!estaCaindo(jogador)) {
      const jumpResult = verificarColisaoJump(jogador.position);
      if (jumpResult.ativado && !estaNoAr(jogador)) {
        const velocidadeParaJump = jogador.penalizado
          ? jogador.velocidadeAtual
          : state.velocidade;
        aplicarEfeitoJump(jogador, velocidadeParaJump);
      }
    }

    // ========== ROTAÇÃO (só se não estiver no ar e não estiver caindo) ==========
    if (!estaNoAr(jogador) && !estaCaindo(jogador) && state.velocidade !== 0) {
      let directionFactor = state.velocidade > 0 ? 1 : -1;
      jogador.rotateY(state.direção * directionFactor * deltaTime * 60);
    }

    // ========== MOVIMENTO COM PENALIZAÇÃO (só se não estiver no ar e não estiver caindo) ==========
    if (!estaNoAr(jogador) && !estaCaindo(jogador)) {
      let velocidadeMovimento;

      if (jogador.penalizado) {
        velocidadeMovimento = jogador.velocidadeAtual;
      } else {
        velocidadeMovimento = state.velocidade;
        jogador.velocidadeAtual = state.velocidade;
      }

      jogador.translateZ(velocidadeMovimento * deltaTime);
    }

    // ========== DISPARO DO JOGADOR ==========
    if (state.disparar && jogador.podeDisparar()) {
      if (window.sistemaDisparos) {
        window.sistemaDisparos.criarDisparo(jogador);
        console.log("Jogador disparou!");
      }
    }

    // ========== MOVIMENTO DOS ADVERSÁRIOS COM JUMP ==========
    adversarios.forEach((adv) => {
      if (!adv || adv.corridaFinalizada) return;

      // Física do jump para adversários
      atualizarFisicaJump(adv, deltaTime);

      // ========== VERIFICAR ZONA DE QUEDA - ADVERSÁRIOS ==========
      if (!estaNoAr(adv) && !estaCaindo(adv)) {
        if (verificarZonaQueda(adv.position)) {
          iniciarQuedaLivre(adv);
        }
      }

      // ========== ATUALIZAR QUEDA LIVRE - ADVERSÁRIOS ==========
      atualizarQuedaLivre(adv, deltaTime);

      // Verificar jump para adversários
      if (!estaCaindo(adv)) {
        const jumpResultIA = verificarColisaoJump(adv.position);
        if (jumpResultIA.ativado && !estaNoAr(adv)) {
          aplicarEfeitoJump(adv, adv.velocidadeAtual);
        }
      }

      // Atualizar IA (passando TODOS os veículos)
      if (adv.atualizar) {
        adv.atualizar(deltaTime, todosVeiculos);
      }

      // Movimento normal (só se não estiver no ar e não estiver caindo)
      if (!estaNoAr(adv) && !estaCaindo(adv)) {
        let velocidadeAIMov = adv.velocidadeAtual;
        adv.translateZ(velocidadeAIMov * deltaTime);
      }
    });

    // ========== COLISÃO COM MURETAS (desabilitada durante o salto e queda) ==========
    const muretas = getMuretas();

    if (!estaNoAr(jogador) && !estaCaindo(jogador)) {
      const colisao = verificarColisao(jogador.position, muretas, 1.2);

      if (colisao.colidiu) {
        const novaVelocidade = resolverColisaoDeslizante(
          jogador,
          colisao,
          state
        );
        setVelocidade(novaVelocidade);
      }
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

    // ========== CONTADOR DE VOLTAS + RECARGA - JOGADOR ==========
    const voltasAntes = contadorVoltas.voltas;
    const resultadoVolta = contadorVoltas.verificarPassagem(jogador.position);
    const voltasDepois = contadorVoltas.voltas;

    if (voltasDepois > voltasAntes) {
      jogador.recarregarDisparos();
      console.log("🔄 Volta completa! Munição recarregada!");
    }

    if (resultadoVolta && resultadoVolta.voltaInvalida) {
      console.warn(
        `⚠️ Passe por todos os checkpoints! Faltam: ${resultadoVolta.checkpointsFaltando}`
      );
    }

    // ========== CONTADOR DE VOLTAS - ADVERSÁRIOS ==========
    adversarios.forEach((adv) => {
      if (!adv || contadorVoltas.isCorridaFinalizada()) return;

      if (!adv.voltasCompletadas) adv.voltasCompletadas = 0;
      if (adv.primeiraPassagemIA === undefined) adv.primeiraPassagemIA = true;

      const linhaChegada = contadorVoltas.linhaBox;

      if (linhaChegada) {
        const pontoIA = new THREE.Vector3(
          adv.position.x,
          adv.position.y,
          adv.position.z
        );
        const dentroLinha = linhaChegada.containsPoint(pontoIA);

        if (dentroLinha && !adv.passouLinha) {
          adv.passouLinha = true;

          if (adv.primeiraPassagemIA) {
            adv.primeiraPassagemIA = false;
            console.log("🤖 IA - Posição inicial - não conta como volta");
          } else {
            adv.voltasCompletadas++;
            adv.recarregarDisparos();
            console.log(`🤖 IA completou volta ${adv.voltasCompletadas}`);
          }
        } else if (!dentroLinha && adv.passouLinha) {
          adv.passouLinha = false;
        }
      }
    });

    // ========== FIM DE JOGO - VITÓRIA DO JOGADOR ==========
    if (voltasDepois >= 4 && window.divResultado && !window.jogoFinalizado) {
      window.jogoFinalizado = true;
      window.divResultado.style.display = "block";
      window.divResultado.style.color = "#00FF00";
      window.divResultado.innerHTML =
        "🏆 VITÓRIA! 🏆<br><small>Você completou 4 voltas!</small>";

      // Parar TODOS os adversários
      adversarios.forEach((adv) => {
        if (adv) {
          adv.corridaFinalizada = true;
          adv.velocidadeAtual = 0;
        }
      });
    }

    // ========== FIM DE JOGO - DERROTA (IA VENCEU) ==========
    const iaVencedora = adversarios.find(
      (adv) => adv && adv.voltasCompletadas >= 4
    );
    if (iaVencedora && window.divResultado && !window.jogoFinalizado) {
      window.jogoFinalizado = true;
      contadorVoltas.corridaFinalizada = true;
      window.divResultado.style.display = "block";
      window.divResultado.style.color = "#FF0000";
      window.divResultado.innerHTML =
        "💥 DERROTA 💥<br><small>Uma IA venceu!</small>";

      // Parar TODOS os adversários
      adversarios.forEach((adv) => {
        if (adv) {
          adv.corridaFinalizada = true;
          adv.velocidadeAtual = 0;
        }
      });
    }

    // ========== COLISÃO ADVERSÁRIOS COM MURETAS (desabilitada durante salto e queda) ==========
    adversarios.forEach((adv) => {
      if (!adv || estaNoAr(adv) || estaCaindo(adv)) return;

      const colisaoIA = verificarColisao(adv.position, muretas, 1.2);
      if (colisaoIA.colidiu) {
        adv.velocidadeAtual *= 0.5;
        // CORREÇÃO: Força normal.y = 0 para a IA não voar nem afundar
        const normal = colisaoIA.normal.clone();
        normal.y = 0;
        normal.normalize().multiplyScalar(0.5);

        if (adv.group) adv.group.position.add(normal);
        if (adv.position && adv.group) adv.position.copy(adv.group.position);
      }
    });

    // ========== COLISÃO ENTRE TODOS OS VEÍCULOS (desabilitada se qualquer um estiver no ar ou caindo) ==========
    for (let i = 0; i < todosVeiculos.length; i++) {
      for (let j = i + 1; j < todosVeiculos.length; j++) {
        const v1 = todosVeiculos[i];
        const v2 = todosVeiculos[j];

        if (!v1 || !v2 || v1.corridaFinalizada || v2.corridaFinalizada)
          continue;

        // Pula colisão se qualquer um estiver no ar ou caindo
        if (estaNoAr(v1) || estaNoAr(v2) || estaCaindo(v1) || estaCaindo(v2))
          continue;

        const distancia = v1.position.distanceTo(v2.position);
        if (distancia < 2.4) {
          const separacao = new THREE.Vector3()
            .subVectors(v1.position, v2.position)
            .normalize()
            .multiplyScalar(0.2);

          if (v1.group) v1.group.position.add(separacao);
          if (v1.group) v1.position.copy(v1.group.position);

          if (v2.group) v2.group.position.sub(separacao);
          if (v2.group && v2.position) v2.position.copy(v2.group.position);

          v1.velocidadeAtual *= 0.8;
          v2.velocidadeAtual *= 0.8;
        }
      }
    }

    // ========== SISTEMA DE DISPAROS ==========
    if (sistemaDisparos) {
      sistemaDisparos.atualizar(deltaTime, todosVeiculos, muretas);
    }

    // ========== UI DE DISPAROS ==========
    if (window.linhaDisparos) {
      const icones =
        "🔴".repeat(jogador.disparosDisponiveis) +
        "⚪".repeat(4 - jogador.disparosDisponiveis);
      window.linhaDisparos.innerHTML = `Disparos: ${icones} (${jogador.disparosDisponiveis}/4)`;
    }

    // ========== UI DE PENALIZAÇÃO ==========
    if (window.linhaPenalizacao) {
      if (jogador.penalizado) {
        window.linhaPenalizacao.style.display = "block";
        window.linhaPenalizacao.style.color = "#FF3333";
        window.linhaPenalizacao.innerHTML = `⚠️ ATINGIDO! Velocidade: ${jogador.velocidadeAtual.toFixed(
          1
        )} (${jogador.tempoPenalizacao.toFixed(1)}s)`;
      } else {
        window.linhaPenalizacao.style.display = "none";
      }
    }

    // ========== LUZ ==========
    atualizarLuz(jogador);

    // ========== ÁGUA ==========
    atualizarAguas(elapsedTime, jogador);

    // ========== CÂMERA ==========
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
