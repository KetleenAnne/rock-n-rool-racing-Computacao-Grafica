import * as THREE from "three";

// A luz principal deve projetar sombra em TODOS os elementos
const SHADOW_MAP_SIZE = 2048; // Tamanho do mapa de sombra (qualidade e desempenho)
const SHADOW_CAM_SIZE = 50; // Alcance da câmera de sombra
const LIGHT_ANGLE_Y = -70 * (Math.PI / 180); // Ângulo para sombra não alongada

let luzPrincipal = null;
let luzSecundaria = null; // Luz ambiente ou direcional oposta

export function criarLuzes(scene) {
  //  DIRECIONAL PRINCIPAL (Com Sombra)
  luzPrincipal = new THREE.DirectionalLight(0xffffff, 0.8);

  // Configurações de sombra
  luzPrincipal.castShadow = true;
  luzPrincipal.shadow.mapSize.width = SHADOW_MAP_SIZE;
  luzPrincipal.shadow.mapSize.height = SHADOW_MAP_SIZE;

  // A câmera da sombra (shadow camera) - ortográfica
  luzPrincipal.shadow.camera.near = 1;
  luzPrincipal.shadow.camera.far = 100; // Deve ter alcance suficiente
  luzPrincipal.shadow.camera.left = -SHADOW_CAM_SIZE;
  luzPrincipal.shadow.camera.right = SHADOW_CAM_SIZE;
  luzPrincipal.shadow.camera.top = SHADOW_CAM_SIZE;
  luzPrincipal.shadow.camera.bottom = -SHADOW_CAM_SIZE;

  // Posição inicial (vai ser atualizada no loop)
  luzPrincipal.position.set(10, 20, 10);

  scene.add(luzPrincipal);

  // para visualizar a câmera de sombra
  // const shadowHelper = new THREE.CameraHelper(luzPrincipal.shadow.camera);
  // scene.add(shadowHelper);

  // LUZ SECUNDÁRIA (Ambiente de menor intensidade)
  // A luz ambiente não projeta sombras
  luzSecundaria = new THREE.AmbientLight(0xffffff, 0.5); // 0.5 é a intensidade
  scene.add(luzSecundaria);

  console.log("Sistema de iluminação do T2 criado.");
}

// Atualiza a posição e direção da luz principal para seguir o veículo
export function atualizarLuz(veiculo) {
  if (!luzPrincipal) return;

  // A luz deve transladar (acompanhar a posição) junto ao carro,
  // mas NÃO deve rotacionar com o carro.

  // Translação (Posição)
  // A luz acompanha a posição X e Z do carro.
  // A altura (Y) permanece constante.
  luzPrincipal.position.x = veiculo.position.x + Math.sin(LIGHT_ANGLE_Y) * 10;
  luzPrincipal.position.z = veiculo.position.z + Math.cos(LIGHT_ANGLE_Y) * 10;
  luzPrincipal.position.y = 20; // Altura fixa

  // Rotação/Direção da Sombra
  // A luz principal deve apontar para o carro (ou para um ponto fixo no chão)
  // para que a sombra do carro e da pista apontem sempre para a mesma direção.
  luzPrincipal.target.position.set(veiculo.position.x, 0, veiculo.position.z);
  luzPrincipal.target.updateMatrixWorld();
}
