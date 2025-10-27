import * as THREE from "three";
import {
  initDefaultBasicLight,
  createGroundPlaneXZ,
} from "../../libs/util/util.js";
import { setDefaultMaterial } from "../../libs/util/util.js";

<<<<<<< HEAD
export function setupScene(scene) {
  let corChao = "gray";
  let corCeu = "skyblue";
  initDefaultBasicLight(scene);

  const mainPlane = createGroundPlaneXZ(40, 40); //largura x profundidade do plano iniciaç
  mainPlane.material = setDefaultMaterial(corChao);
  scene.add(mainPlane);
  scene.background = new THREE.Color(corCeu);

  defineAxes(scene);
}

function defineAxes(scene) {
  // Show axes do plano
  let axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);
}
=======
let axesHelper = null;

export function setupScene(scene) {
  let corCeu = "skyblue";
  initDefaultBasicLight(scene);

  // Adicionar luz ambiente extra
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Luz direcional
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  scene.background = new THREE.Color(corCeu);

  // Eixos helper para orientaÃ§Ã£o (Debug) - Inicialmente Pista 1
  defineAxes(scene, 1);
}

export function defineAxes(scene, pista = 1) {
  // Remover eixos anteriores se existirem
  if (axesHelper) {
    scene.remove(axesHelper);
  }
  
  // Show axes do plano
  axesHelper = new THREE.AxesHelper(80);
  
  if (pista === 1) {
    // Centro da Pista 1
    axesHelper.position.set(69, 0, 67);
  } else if (pista === 2) {
    // Centro da Pista 2
    axesHelper.position.set(40, 0, 69);
  }
  
  scene.add(axesHelper);
}
>>>>>>> branch-samuel
