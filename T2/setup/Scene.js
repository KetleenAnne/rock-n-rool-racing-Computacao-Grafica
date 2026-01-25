import * as THREE from "three";
import { criarLuzes } from "./Luz.js";

let axesHelper = null;

export function setupScene(scene) {
  criarLuzes(scene);

  //carregar o ceu
  const loader = new THREE.TextureLoader();
  const caminhoCeu = "assets/texturas/sky/ceu2.jpg";

  const textureEquirec = loader.load(caminhoCeu);
  // diz ao Three.js que a imagem é uma esfera 360 graus
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  textureEquirec.colorSpace = THREE.SRGBColorSpace;

  //define como fundo
  scene.background = textureEquirec;

  //  valor negativo para inclinar o fundo "para trás"
  // faz com que a imagem pareça mais baixa na tela
  scene.backgroundRotation.x = THREE.MathUtils.degToRad(-25);
}
