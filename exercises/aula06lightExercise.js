import * as THREE from "three";
import GUI from "../libs/util/dat.gui.module.js";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import {
  initRenderer,
  setDefaultMaterial,
  initDefaultBasicLight,
  onWindowResize,
  createLightSphere,
} from "../libs/util/util.js";
import { loadLightPostScene } from "../libs/util/utilScenes.js";

let scene, renderer, camera, orbit;
let ambientLight, directionalLight, spotLight;
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // View function in util/utils
renderer.setClearColor("rgb(30, 30, 42)");
camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.lookAt(0, 0, 0);
camera.position.set(5, 5, 5);
camera.up.set(0, 1, 0);
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(3);
axesHelper.visible = false;
scene.add(axesHelper);

// 1. Luz Ambiente
ambientLight = new THREE.AmbientLight("white", 0.2); // Intensidade baixa
scene.add(ambientLight);

// 2. Luz Direcional
directionalLight = new THREE.DirectionalLight("white", 0.5); // Intensidade média
directionalLight.position.set(3, 2, 3);
directionalLight.castShadow = false; // Não gera sombra
scene.add(directionalLight);

// 3. Spotlight (a luz do poste)
spotLight = new THREE.SpotLight("white", 2.0); // Intensidade mais alta
spotLight.position.set(0, 4.8, 0); // Posição exata da lâmpada no poste
spotLight.target.position.set(0, 0, 0); // Mirando no chão (centro)
spotLight.angle = THREE.MathUtils.degToRad(35); // Ângulo do cone de luz
spotLight.penumbra = 0.3; // Suavização das bordas
spotLight.decay = 2; // Queda da luz com a distância

// Configuração de Sombra (Apenas para o Spotlight)
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048; // Resolução da sombra
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 0.1;
spotLight.shadow.camera.far = 100;

scene.add(spotLight);
scene.add(spotLight.target); // Adiciona o alvo à cena (necessário para o GUI)

// Load default scene
loadLightPostScene(scene);

// Ativa o recebimento de sombras no chão e poste (que vieram da cena carregada)
scene.traverse(function (object) {
  if (object.name === "ground" || object.name === "pole") {
    object.receiveShadow = true;
  }
  if (object.name === "pole") {
    object.castShadow = true;
  }
});

//---------------------------------------------------------
// Adição dos Objetos (Conforme cena (b))
//---------------------------------------------------------

// Material base para os objetos
const baseMaterial = new THREE.MeshPhongMaterial({ shininess: 100 });

// Geometrias
const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const tallBoxGeo = new THREE.BoxGeometry(0.5, 1.0, 0.5);
const cylGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.0, 32);

// Objeto 1: Caixa Vermelha
const redBox = new THREE.Mesh(boxGeo, baseMaterial.clone());
redBox.material.color.set("red");
redBox.position.set(1.5, 0.25, 1.0);
redBox.castShadow = true;
redBox.receiveShadow = true;
scene.add(redBox);

// Objeto 2: Caixa Verde (Alta)
const greenBox = new THREE.Mesh(tallBoxGeo, baseMaterial.clone());
greenBox.material.color.set("green");
greenBox.position.set(1.0, 0.5, -1.0);
greenBox.castShadow = true;
greenBox.receiveShadow = true;
scene.add(greenBox);

// Objeto 3: Cilindro Amarelo
const yellowCyl = new THREE.Mesh(cylGeo, baseMaterial.clone());
yellowCyl.material.color.set("yellow");
yellowCyl.position.set(0.5, 0.5, 1.5);
yellowCyl.castShadow = true;
yellowCyl.receiveShadow = true;
scene.add(yellowCyl);

// Objeto 4: Cilindro Roxo
const purpleCyl = new THREE.Mesh(cylGeo, baseMaterial.clone());
purpleCyl.material.color.set("purple");
purpleCyl.position.set(-1.0, 0.5, -0.5);
purpleCyl.castShadow = true;
purpleCyl.receiveShadow = true;
scene.add(purpleCyl);

// REMOVA ESTA LINHA APÓS CONFIGURAR AS LUZES DESTE EXERCÍCIO
// initDefaultBasicLight(scene); // LINHA REMOVIDA

//---------------------------------------------------------
// Load external objects
buildInterface();
render();

function buildInterface() {
  // GUI interface
  let gui = new GUI();

  // Pasta para ligar/desligar luzes
  const lightFolder = gui.addFolder("Luzes");
  lightFolder.add(ambientLight, "visible").name("Ambiente");
  lightFolder.add(directionalLight, "visible").name("Direcional");
  lightFolder.add(spotLight, "visible").name("Spotlight");
  lightFolder.open();

  // Pasta para controlar a Posição do Spotlight
  const spotPosFolder = gui.addFolder("Posição Spot");
  spotPosFolder.add(spotLight.position, "x", -10, 10);
  spotPosFolder.add(spotLight.position, "y", 0, 10);
  spotPosFolder.add(spotLight.position, "z", -10, 10);
  spotPosFolder.open();

  // Pasta para controlar o Alvo (Target) do Spotlight
  const spotTargetFolder = gui.addFolder("Alvo Spot");
  spotTargetFolder.add(spotLight.target.position, "x", -10, 10);
  spotTargetFolder.add(spotLight.target.position, "y", -10, 10);
  spotTargetFolder.add(spotLight.target.position, "z", -10, 10);
  spotTargetFolder.open();
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

// let dirPosition = new THREE.Vector3(2, 2, 4)
// const dirLight = new THREE.DirectionalLight('white', 0.2);
// dirLight.position.copy(dirPosition);
//  //mainLight.castShadow = true;
// scene.add(dirLight);

// // Load default scene
// loadLightPostScene(scene)

// // REMOVA ESTA LINHA APÓS CONFIGURAR AS LUZES DESTE EXERCÍCIO
// initDefaultBasicLight(scene);

// //---------------------------------------------------------
// // Load external objects
// buildInterface();
// render();

// function buildInterface()
// {
//   // GUI interface
//   let gui = new GUI();
// }

// function render()
// {
//   requestAnimationFrame(render);
//   renderer.render(scene, camera)
// }
