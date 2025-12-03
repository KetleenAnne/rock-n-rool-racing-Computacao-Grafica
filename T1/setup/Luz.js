import * as THREE from "three";

// A luz principal -> projetar sombra em TODOS os elementos
const SHADOW_MAP_SIZE = 4096; // Tamanho do mapa de sombra
const SHADOW_CAM_SIZE = 80; // Alcance da câmera de sombra
const LIGHT_ANGLE_Y = -110 * (Math.PI / 180); // Ângulo para sombra não alongada
const LIGHT_HEIGHT = 30; // Altura da luz
const LIGHT_INTENSITY = 2.5; // Intensidade
const LIGHT_COLOR = 0xffffff; //"rgb(255, 255, 255)";
const AMBIENT_LIGHT_INTENSITY = 0.1; // Intensidade da luz ambiente
const AMBIENT_LIGHT_COLOR = 0xfcc3cb; //"rgb(252, 227, 203)"; // Cor quente

let luzPrincipal = null;
let luzSecundaria = null; // Luz ambiente ou direcional oposta

export function criarLuzes(scene) {
  //  DIRECIONAL PRINCIPAL (Com Sombra)
  luzPrincipal = new THREE.DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY);

  // Configurações de sombra
  luzPrincipal.castShadow = true;
  luzPrincipal.shadow.mapSize.width = SHADOW_MAP_SIZE;
  luzPrincipal.shadow.mapSize.height = SHADOW_MAP_SIZE;

  // A câmera da sombra (shadow camera) - ortográfica
  luzPrincipal.shadow.camera.near = 0.1;
  luzPrincipal.shadow.camera.far = 150; // Alcance da sombra
  luzPrincipal.shadow.camera.left = -SHADOW_CAM_SIZE;
  luzPrincipal.shadow.camera.right = SHADOW_CAM_SIZE;
  luzPrincipal.shadow.camera.top = SHADOW_CAM_SIZE;
  luzPrincipal.shadow.camera.bottom = -SHADOW_CAM_SIZE;

  // Posição inicial (atualizada no loop)
  luzPrincipal.position.set(10, LIGHT_HEIGHT, 10);
  luzPrincipal.target.position.set(0, 0, 0);

  scene.add(luzPrincipal);
  scene.add(luzPrincipal.target);

  // para visualizar a câmera de sombra
  // const shadowHelper = new THREE.CameraHelper(luzPrincipal.shadow.camera);
  // scene.add(shadowHelper);

  // LUZ SECUNDÁRIA ( meno intensidade)
  // A luz ambiente não projeta sombras
  luzSecundaria = new THREE.AmbientLight(
    AMBIENT_LIGHT_COLOR,
    AMBIENT_LIGHT_INTENSITY
  );
  scene.add(luzSecundaria);

  console.log("Sistema de iluminação.");
}

// Atualiza a posição e direção da luz principal para seguir o veículo
export function atualizarLuz(veiculo) {
  if (!luzPrincipal) return;

  // Translação (Posição)
  // A luz acompanha a posição X e Z do carro.
  // A altura (Y) permanece constante.
  luzPrincipal.position.x = veiculo.position.x + Math.sin(LIGHT_ANGLE_Y) * 20;
  luzPrincipal.position.z = veiculo.position.z + Math.cos(LIGHT_ANGLE_Y) * 20;
  luzPrincipal.position.y = LIGHT_HEIGHT; // Altura fixa

  // Rotação/Direção da Sombra
  luzPrincipal.target.position.set(veiculo.position.x, 0, veiculo.position.z);
  luzPrincipal.target.updateMatrixWorld();
}
