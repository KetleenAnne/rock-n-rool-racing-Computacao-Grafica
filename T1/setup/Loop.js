import * as THREE from "three";
import { atualizaControlesVeiculo, setVelocidade } from "../jogo/Teclas.js";
import { getMuretas } from "../jogo/Pista.js";
import {
  verificarColisao,
  resolverColisaoDeslizante,
} from "../jogo/Colisao.js";
import contadorVoltas from "../jogo/ContadorVoltas.js";

const clock = new THREE.Clock(); //exemples/exampleFirstPerson.js

const offsetCamera = new THREE.Vector3(0, 4, -8);
const lerp_camera = 0.08;
const lateral_camera = 50.0;

let focoCamera = new THREE.Vector3(0, 2.0, 0);

let currentLookAt = new THREE.Vector3();

export function startLoop(renderer, scene, camera, veiculo) {
  // Inicializa o ponto de foco para evitar que a câmera comece no (0,0,0)
  currentLookAt.copy(veiculo.position).add(focoCamera);

  function render() {
    //exemples/exampleFirstPerson.js
    const deltaTime = clock.getDelta(); // Estado atual veículo
    const state = atualizaControlesVeiculo(deltaTime); // Aplica mudanças no veículo

    if (state.velocidade !== 0) {
      let directionFactor = state.velocidade > 0 ? 1 : -1;
      // Aplicando deltaTime na rotação
      veiculo.rotateY(state.direção * directionFactor * deltaTime * 60);
    }
    // O movimento é apenas velocidade * tempo
    veiculo.translateZ(state.velocidade * deltaTime); // Verificar colisão depois de mover

    const muretas = getMuretas();
    const colisao = verificarColisao(veiculo.position, muretas, 0.8); // voltar essa linha para 1.2 no teste de colisão

    if (colisao.colidiu) {
      const novaVelocidade = resolverColisaoDeslizante(veiculo, colisao, state);
      setVelocidade(novaVelocidade);
    }
    // Verificar passagem pela linha de chegada
    const completouVolta = contadorVoltas.verificarPassagem(veiculo.position);
    if (completouVolta) {
      console.log(`Total de voltas: ${contadorVoltas.getVoltas()}`);
    }

    // Rotação lateral da câmera baseado no estado do veículo
    let lateralDrift = state.direção * lateral_camera;
    let targetCameraPos = offsetCamera.clone();

    // Rotação da câmera baseada na rotação do veículo
    targetCameraPos.x += lateralDrift;

    // Converte a posição relativa da câmera para posição do mundo
    targetCameraPos.applyQuaternion(veiculo.quaternion);
    targetCameraPos.add(veiculo.position);

    // Foco da camera
    let targetLookAt = veiculo.position.clone().add(focoCamera);

    camera.position.lerp(targetCameraPos, lerp_camera);

    // Ponto de foco da câmera
    currentLookAt.lerp(targetLookAt, lerp_camera);
    camera.lookAt(currentLookAt);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}
