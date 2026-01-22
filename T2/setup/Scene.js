import * as THREE from "three";
import {
  initDefaultBasicLight,
  createGroundPlaneXZ,
} from "../../libs/util/util.js";
import { setDefaultMaterial } from "../../libs/util/util.js";
import { criarLuzes } from "./Luz.js";

let axesHelper = null;

export function setupScene(scene) {
  // let corCeu = "skyblue";
  // initDefaultBasicLight(scene);
  criarLuzes(scene); //  novo sistema de luz

  //carregar o ceu
  const loader = new THREE.TextureLoader();
  const caminhoCeu = "assets/texturas/sky/ceu2.jpg";

  const textureEquirec = loader.load(caminhoCeu);
  // diz ao Three.js que a imagem é uma esfera 360 graus
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  textureEquirec.colorSpace = THREE.SRGBColorSpace;

  //define como fundo
  scene.background = textureEquirec;
}
