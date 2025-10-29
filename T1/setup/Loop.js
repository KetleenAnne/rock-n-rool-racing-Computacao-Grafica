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
    //estado atual veiculo
    const state = atualizaControlesVeiculo();
    // aplica mudanças no veiculo
    if (state.velocidade !== 0) {
      let directionFactor = state.velocidade > 0 ? 1 : -1;
      veiculo.rotateY(state.direção * directionFactor);
    }
    veiculo.translateZ(state.velocidade * 0.05);
    // rotação lateral da câmera baseado no estado do veículo
    let lateralDrift = state.direção * lateral_camera;
    let targetCameraPos = offsetCamera.clone();

    //rotação da câmera baseada na rotação do veículo
    targetCameraPos.x += lateralDrift;

    // converte a posição relativa da câmera para posição do mundo
    targetCameraPos.applyQuaternion(veiculo.quaternion);
    targetCameraPos.add(veiculo.position);
    // foco da camera
    let targetLookAt = veiculo.position.clone().add(focoCamera);

    camera.position.lerp(targetCameraPos, lerp_camera);
    // ponto de foco da câmera
    currentLookAt.lerp(targetLookAt, lerp_camera);
    camera.lookAt(currentLookAt);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
}
