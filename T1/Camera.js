import * as THREE from "three";
import { initCamera } from "../../libs/util/util.js";

export function setupCamera() {
  // Centralizar cÃ¢mera na Pista 1 (70x68) - centro em x=69, z=67
  const camera = initCamera(new THREE.Vector3(69, 50, 140));
  camera.lookAt(69, 0, 67);
  return camera;
}