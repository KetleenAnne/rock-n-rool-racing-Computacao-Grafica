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

const clock = new THREE.Clock(); //exemplo do arquivo exampleFirstPerson.js

// --- Câmera em Terceira Pessoa ---
// Posição da câmera em relação ao carro (pra cima e pra trás)
const offsetCamera = new THREE.Vector3(0, 4, -8);
const lerp_camera = 0.08;
const lateral_camera = 50.0;
let focoCamera = new THREE.Vector3(0, 2.0, 0);
// Guarda o foco atual (pro LERP)
let currentLookAt = new THREE.Vector3();

export function startLoop(renderer, scene, camera, jogador, adversario, sistemaDisparos, stats) { 
  currentLookAt.copy(jogador.position).add(focoCamera);

  // O renderer precisa de sombras ativadas
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Deixa a sombra mais suave

  function render() {
    const deltaTime = clock.getDelta();

    stats.update(); // Atualiza o contador de FPS

    // Pega velocidade e direção do 'Teclas.js'
    const state = atualizaControlesVeiculo(deltaTime);

    // --- Atualiza Posição do Veículo ---
    if (state.velocidade !== 0) {
      let directionFactor = state.velocidade > 0 ? 1 : -1; // Inverte o controle na ré
      jogador.rotateY(state.direção * directionFactor * deltaTime * 60);
    }
    // Move o veículo: Distância = Velocidade * Tempo
    jogador.translateZ(state.velocidade * deltaTime);

    // --- Colisão ---
    const muretas = getMuretas();
    // Raio do carro pra colisão = 0.8
    const colisao = verificarColisao(jogador.position, muretas, 0.8);

    if (colisao.colidiu) {
      // Se bateu, chama a função de "deslizar" e frear
      const novaVelocidade = resolverColisaoDeslizante(jogador, colisao, state);
      setVelocidade(novaVelocidade); // Atualiza a velocidade (freia)
    }

    // --- IA: Colisão ---
    if (adversario) {
      const colisaoIA = verificarColisao(adversario.position, muretas, 0.8);
      
      if (colisaoIA.colidiu) {
        // IA bate e desacelera
        adversario.velocidadeAtual *= 0.5;
        
        // Empurra IA para fora da parede
        const normal = colisaoIA.normal.clone().multiplyScalar(0.5);
        adversario.group.position.add(normal);
        adversario.position.copy(adversario.group.position);
      }
    }

    // --- Colisão entre veículos ---
    const distanciaEntreVeiculos = jogador.position.distanceTo(adversario.position);

    if (distanciaEntreVeiculos < 2.0) { // Raio de colisão
      // Vetor de separação
      const separacao = new THREE.Vector3()
        .subVectors(jogador.position, adversario.position)
        .normalize()
        .multiplyScalar(0.2);
      
      // Empurra ambos para lados opostos
      jogador.group.position.add(separacao);
      jogador.position.copy(jogador.group.position);
      
      adversario.group.position.sub(separacao);
      adversario.position.copy(adversario.group.position);
      
      // Reduz velocidade de ambos
      jogador.velocidadeAtual *= 0.8;
      adversario.velocidadeAtual *= 0.8;
    }

    // --- Contador de Voltas ---
    contadorVoltas.verificarPassagem(jogador.position);

    // JOGADOR: Contador de Voltas
    const voltasAntes = contadorVoltas.voltas; // Salva voltas antes
    contadorVoltas.verificarPassagem(jogador.position);
    const voltasDepois = contadorVoltas.voltas; // Voltas depois

    // Se completou uma volta, recarrega munição
    if (voltasDepois > voltasAntes) {
      jogador.recarregarDisparos();
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
    atualizarLuz(jogador); // Atualiza a luz para seguir o veículo

    // --- Lógica da Câmera ---
    let lateralDrift = state.direção * lateral_camera;
    let targetCameraPos = offsetCamera.clone();

    targetCameraPos.x += lateralDrift;
    // Converte a posição local atrás do carro pra posição no mundo
    targetCameraPos.applyQuaternion(jogador.quaternion);
    targetCameraPos.add(jogador.position);

    // Onde a câmera deve OLHAR
    let targetLookAt = jogador.position.clone().add(focoCamera);

    // Suaviza o movimento da CÂMERA
    camera.position.lerp(targetCameraPos, lerp_camera);

    // Suaviza o movimento do FOCO
    currentLookAt.lerp(targetLookAt, lerp_camera);
    camera.lookAt(currentLookAt); // Aponta a câmera

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}
