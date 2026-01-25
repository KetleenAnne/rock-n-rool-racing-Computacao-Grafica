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
  estaCaindo
} from "../jogo/Jump.js";

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
    const elapsedTime = clock.getElapsedTime();
    stats.update();

    const state = atualizaControlesVeiculo(deltaTime);

    // --- Referência dinâmica do adversário ---
    const adv = (typeof window !== 'undefined' && window.adversario) ? window.adversario : adversario;

    // ========== ATUALIZAÇÃO DE PENALIZAÇÃO - JOGADOR ==========
    jogador.atualizarPenalizacao(deltaTime);
    if (adv) adv.atualizarPenalizacao(deltaTime);

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
        // Passa a velocidade atual para calcular a distância do salto
        const velocidadeParaJump = jogador.penalizado ? jogador.velocidadeAtual : state.velocidade;
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
        // Durante penalização: usa velocidadeAtual 
        velocidadeMovimento = jogador.velocidadeAtual;
      } else {
        // Fora de penalização: usa velocidade normal das teclas
        velocidadeMovimento = state.velocidade;
        jogador.velocidadeAtual = state.velocidade; // Sincroniza
      }
      
      jogador.translateZ(velocidadeMovimento * deltaTime);
    }

    // ========== MOVIMENTO DA IA COM PENALIZAÇÃO E JUMP ==========
    if (adv && !adv.corridaFinalizada) {
      // Física do jump para IA
      atualizarFisicaJump(adv, deltaTime);
      
      // ========== VERIFICAR ZONA DE QUEDA - IA ==========
      if (!estaNoAr(adv) && !estaCaindo(adv)) {
        if (verificarZonaQueda(adv.position)) {
          iniciarQuedaLivre(adv);
        }
      }
      
      // ========== ATUALIZAR QUEDA LIVRE - IA ==========
      atualizarQuedaLivre(adv, deltaTime);
      
      // Verificar jump para IA
      if (!estaCaindo(adv)) {
        const jumpResultIA = verificarColisaoJump(adv.position);
        if (jumpResultIA.ativado && !estaNoAr(adv)) {
          aplicarEfeitoJump(adv, adv.velocidadeAtual);
        }
      }

      // Movimento normal (só se não estiver no ar e não estiver caindo)
      if (!estaNoAr(adv) && !estaCaindo(adv)) {
        let velocidadeAIMov;

        if (adv.penalizado) {
          // IA penalizada – usa velocidadeAtual já reduzida a 30%
          velocidadeAIMov = adv.velocidadeAtual;
        } else {
          // Sem penalização – usa velocidadeAtual normal (aceleração da IA)
          velocidadeAIMov = adv.velocidadeAtual;
        }

        adv.translateZ(velocidadeAIMov * deltaTime);
      }
    }

    // ========== COLISÃO COM MURETAS (desabilitada durante o salto e queda) ==========
    const muretas = getMuretas();
    
    if (!estaNoAr(jogador) && !estaCaindo(jogador)) {
      const colisao = verificarColisao(jogador.position, muretas, 1.2);

      if (colisao.colidiu) {
        const novaVelocidade = resolverColisaoDeslizante(jogador, colisao, state);
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

    // --- Contador de Voltas + Recarga ---
    const voltasAntes = contadorVoltas.voltas;
    const resultadoVolta = contadorVoltas.verificarPassagem(jogador.position);
    const voltasDepois = contadorVoltas.voltas;

    if (voltasDepois > voltasAntes) {
      jogador.recarregarDisparos();
      console.log("🔄 Volta completa! Munição recarregada!");
    }

    if (resultadoVolta && resultadoVolta.voltaInvalida) {
      console.warn(`⚠️ Passe por todos os checkpoints! Faltam: ${resultadoVolta.checkpointsFaltando}`);
    }

    // ========== CONTADOR DE VOLTAS DA IA  ==========
    if (adv && !contadorVoltas.isCorridaFinalizada()) {
      if (!adv.voltasCompletadas) adv.voltasCompletadas = 0;
      if (adv.primeiraPassagemIA === undefined) adv.primeiraPassagemIA = true;
      
      // OBTER LINHA DE CHEGADA CORRETA PARA CADA PISTA
      const linhaChegada = contadorVoltas.linhaBox;
      
      if (linhaChegada) {
        const pontoIA = new THREE.Vector3(adv.position.x, adv.position.y, adv.position.z);
        const dentroLinha = linhaChegada.containsPoint(pontoIA);
        
        if (dentroLinha && !adv.passouLinha) {
          adv.passouLinha = true;
          
          // Ignora a primeira passagem (posição inicial)
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
    }

    // Verificar fim de jogo (4 voltas) - JOGADOR
    if (voltasDepois >= 4 && window.divResultado && !window.jogoFinalizado) {
      window.jogoFinalizado = true;
      window.divResultado.style.display = "block";
      window.divResultado.style.color = "#00FF00";
      window.divResultado.innerHTML = "🏆 VITÓRIA! 🏆<br><small>Você completou 4 voltas!</small>";
      // Parar IA
      if (adv) {
        adv.corridaFinalizada = true;
        adv.velocidadeAtual = 0;
      }
    }

    // Se IA completou 4 voltas primeiro - DERROTA
    if (adv && adv.voltasCompletadas >= 4 && window.divResultado && !window.jogoFinalizado) {
      window.jogoFinalizado = true;
      contadorVoltas.corridaFinalizada = true; // Parar contador do jogador
      window.divResultado.style.display = "block";
      window.divResultado.style.color = "#FF0000";
      window.divResultado.innerHTML = "💥 DERROTA 💥<br><small>A IA venceu!</small>";
      // Parar IA na linha de chegada
      if (adv) {
        adv.corridaFinalizada = true;
        adv.velocidadeAtual = 0;
      }
    }

    // ========== IA - ATUALIZAÇÃO ==========
    if (adv && adv.atualizar && !adv.corridaFinalizada) {
      adv.atualizar(deltaTime, jogador);
    }

    // --- Colisão IA com muretas (desabilitada durante o salto e queda) ---
    if (adv && !estaNoAr(adv) && !estaCaindo(adv)) {
      const colisaoIA = verificarColisao(adv.position, muretas, 1.2);
      if (colisaoIA.colidiu) {
        adv.velocidadeAtual *= 0.5;
        const normal = colisaoIA.normal.clone().multiplyScalar(0.5);
        if (adv.group) adv.group.position.add(normal);
        if (adv.position && adv.group) adv.position.copy(adv.group.position);
      }
    }

    // --- Colisão entre veículos (desabilitada se qualquer um estiver no ar ou caindo) ---
    if (adv && !estaNoAr(jogador) && !estaNoAr(adv) && !estaCaindo(jogador) && !estaCaindo(adv)) {
      const distancia = jogador.position.distanceTo(adv.position);
      if (distancia < 2.4) {
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

    // ========== UI DE DISPAROS ==========
    if (window.linhaDisparos) {
      const icones = "🔴".repeat(jogador.disparosDisponiveis) + 
                    "⚪".repeat(4 - jogador.disparosDisponiveis);
      window.linhaDisparos.innerHTML = `Disparos: ${icones} (${jogador.disparosDisponiveis}/4)`;
    }

    // ========== UI DE PENALIZAÇÃO (OPCIONAL) ==========
    if (window.linhaPenalizacao) {
      if (jogador.penalizado) {
        window.linhaPenalizacao.style.display = "block";
        window.linhaPenalizacao.style.color = "#FF3333";
        window.linhaPenalizacao.innerHTML = `⚠️ ATINGIDO! Velocidade: ${(jogador.velocidadeAtual).toFixed(1)} (${jogador.tempoPenalizacao.toFixed(1)}s)`;
      } else {
        window.linhaPenalizacao.style.display = "none";
      }
    }

    // --- Luz ---
    atualizarLuz(jogador);

    //-- Agua --
    atualizarAguas(elapsedTime);

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