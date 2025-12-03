import * as THREE from "three";
import {
  initDefaultBasicLight,
  createGroundPlaneXZ,
} from "../../libs/util/util.js";
import { setDefaultMaterial } from "../../libs/util/util.js";
import { criarLuzes } from "./Luz.js";

let axesHelper = null;

export function setupScene(scene) {
  let corCeu = "skyblue";
  // initDefaultBasicLight(scene);
  criarLuzes(scene); //  novo sistema de luz

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
