import * as THREE from "three";
import { initCamera } from "../../libs/util/util.js";

export function setupCamera() {
  // Centralizar camera na Pista 1 (70x68) - centro em x=69, z=67
  const camera = initCamera(new THREE.Vector3(69, 50, 140));
  return camera;
}
