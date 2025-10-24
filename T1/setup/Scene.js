import * as THREE from "three";
import {
  initDefaultBasicLight,
  createGroundPlaneXZ,
  onWindowResize,
} from "../../libs/util/util.js";
import { setDefaultMaterial } from "../../libs/util/util.js";

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
