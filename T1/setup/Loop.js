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

// --- Câmera em Terceira Pessoa ---
// Posição da câmera em relação ao carro (pra cima e pra trás)
const offsetCamera = new THREE.Vector3(0, 4, -8);
const lerp_camera = 0.08;
const lateral_camera = 50.0;
let focoCamera = new THREE.Vector3(0, 2.0, 0);
// Guarda o foco atual (pro LERP)
let currentLookAt = new THREE.Vector3();

export function startLoop(renderer, scene, camera, veiculo, stats) {
  currentLookAt.copy(veiculo.position).add(focoCamera);

  function render() {
    const deltaTime = clock.getDelta();

    stats.update(); // Atualiza o contador de FPS

    // Pega velocidade e direção do 'Teclas.js'
    const state = atualizaControlesVeiculo(deltaTime);

    // --- Atualiza Posição do Veículo ---
    if (state.velocidade !== 0) {
      let directionFactor = state.velocidade > 0 ? 1 : -1; // Inverte o controle na ré
      veiculo.rotateY(state.direção * directionFactor * deltaTime * 60);
    }
    // Move o veículo: Distância = Velocidade * Tempo
    veiculo.translateZ(state.velocidade * deltaTime);

    // --- Colisão ---
    const muretas = getMuretas();
    // Raio do carro pra colisão = 0.6
    const colisao = verificarColisao(veiculo.position, muretas, 0.6);

    if (colisao.colidiu) {
      // Se bateu, chama a função de "deslizar" e frear
      const novaVelocidade = resolverColisaoDeslizante(veiculo, colisao, state);
      setVelocidade(novaVelocidade); // Atualiza a velocidade (freia)
    }

    // ========== VERIFICAR CHECKPOINTS ==========
    sistemaCheckpoints.verificarPassagem(veiculo.position);
    
    // Atualizar display de checkpoints
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
    // ==========================================

    // --- Contador de Voltas ---
    const resultadoVolta = contadorVoltas.verificarPassagem(veiculo.position);
    
    // Mostrar mensagem se tentou fazer volta sem checkpoints
    if (resultadoVolta && resultadoVolta.voltaInvalida) {
      console.warn(`⚠️ Passe por todos os checkpoints! Faltam: ${resultadoVolta.checkpointsFaltando}`);
    }

    // --- Atualiza a Luz ---
    atualizarLuz(veiculo); // Atualiza a luz para seguir o veículo

    // --- Lógica da Câmera ---
    let lateralDrift = state.direção * lateral_camera;
    let targetCameraPos = offsetCamera.clone();

    targetCameraPos.x += lateralDrift;
    // Converte a posição local atrás do carro pra posição no mundo
    targetCameraPos.applyQuaternion(veiculo.quaternion);
    targetCameraPos.add(veiculo.position);

    // Onde a câmera deve OLHAR
    let targetLookAt = veiculo.position.clone().add(focoCamera);

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