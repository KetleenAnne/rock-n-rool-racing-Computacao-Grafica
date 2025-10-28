import * as THREE from "three";
import { atualizaControlesVeiculo } from "../jogo/Teclas.js";

const offsetCamera = new THREE.Vector3(0, 10, -20);
const lerp_camera = 0.08;
const lateral_camera = 50.0;

let focoCamera = new THREE.Vector3(0, 2.0, 0);

let currentLookAt = new THREE.Vector3();

export function startLoop(renderer, scene, camera, veiculo) {
  // Inicializa o ponto de foco para evitar que a câmera comece no (0,0,0)
  currentLookAt.copy(veiculo.position).add(focoCamera);
  function render() {
    // --- 1. Calcular Estado do Veículo ---
    const state = atualizaControlesVeiculo();
    // --- 2. Aplicar Movimento ao Veículo (Seu código original) ---
    if (state.velocidade !== 0) {
      let directionFactor = state.velocidade > 0 ? 1 : -1;
      veiculo.rotateY(state.direção * directionFactor);
    }
    veiculo.translateZ(state.velocidade * 0.05);
    // --- 3. Atualizar Posição da Câmera ---
    // a. Calcular Drift Lateral da Câmera
    let lateralDrift = state.direção * lateral_camera;
    // b. Calcular Posição Alvo (Onde a câmera quer estar)
    let targetCameraPos = offsetCamera.clone();
    // Adiciona o drift lateral (X) ao offset base
    targetCameraPos.x += lateralDrift;
    // Converte a Posição Alvo (local) para Coordenadas de Mundo
    targetCameraPos.applyQuaternion(veiculo.quaternion);
    targetCameraPos.add(veiculo.position);
    // c. Calcular Ponto de Foco Alvo (Para onde a câmera quer olhar)
    let targetLookAt = veiculo.position.clone().add(focoCamera);
    // d. Aplicar Suavização (LERP)
    // Em vez de `copy()`, movemos a câmera *em direção* ao alvo suavemente
    camera.position.lerp(targetCameraPos, lerp_camera);
    // Também suavizamos o ponto para onde a câmera está olhando
    currentLookAt.lerp(targetLookAt, lerp_camera);
    // e. Apontar a câmera
    camera.lookAt(currentLookAt);
    // --- 4. Renderizar a Cena ---
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render(); // Inicia o loop
}
