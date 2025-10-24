import * as THREE from "three";
import { initCamera } from "../../libs/util/util.js";

export function setupCamera() {
  const camera = initCamera(new THREE.Vector3(0, 15, 50));
  return camera;
}
