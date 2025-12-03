import * as THREE from "three";
import {
  initDefaultBasicLight,
  createGroundPlaneXZ,
} from "../../libs/util/util.js";
import { setDefaultMaterial } from "../../libs/util/util.js";
import { criarLuzes } from "./Luz.js"; // <-- NOVO

let axesHelper = null;

export function setupScene(scene) {
  let corCeu = "skyblue";

  // initDefaultBasicLight(scene); // <-- REMOVIDO para usar o sistema T2

  criarLuzes(scene); // <-- ADICIONA o novo sistema de luz

  // Luzes antigas REMOVIDAS/COMENTADAS
  // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  // scene.add(ambientLight);
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  // directionalLight.position.set(10, 20, 10);
  // scene.add(directionalLight);

  scene.background = new THREE.Color(corCeu);

  // Eixos helper para orientação (Debug) - Inicialmente Pista 1
  //defineAxes(scene, 1);
}

// export function defineAxes(scene, pista = 1) {
//   // Remover eixos anteriores se existirem
//   if (axesHelper) {
//     scene.remove(axesHelper);
//   }

//   // Show axes do plano
//   axesHelper = new THREE.AxesHelper(80);

//   if (pista === 1) {
//     // Centro da Pista 1
//     axesHelper.position.set(69, 0, 67);
//   } else if (pista === 2) {
//     // Centro da Pista 2
//     axesHelper.position.set(40, 0, 69);
//   }

//   scene.add(axesHelper);
// }
