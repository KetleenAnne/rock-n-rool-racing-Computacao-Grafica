import * as THREE from "three";
import { initRenderer } from "../../libs/util/util.js";
import { setupScene } from "./setup/Scene.js";
import { setupCamera } from "./setup/Camera.js";
import { startLoop } from "./setup/Loop.js";
import { addControls } from "./jogo/Teclas.js";
<<<<<<< HEAD

let scene = new THREE.Scene();

let renderer = initRenderer();
let camera = setupCamera();

setupScene(scene);
addControls(camera, renderer);
startLoop(renderer, scene, camera);
=======
import { criarPista1 } from "./jogo/Pista.js";

console.log("Iniciando aplicaÃ§Ã£o...");

let scene = new THREE.Scene();
let renderer = initRenderer();
let camera = setupCamera();

console.log("Scene, Renderer e Camera criados");

setupScene(scene);
console.log("Scene configurada");

// Criar veÃ­culo temporÃ¡rio
const geometriaVeiculo = new THREE.BoxGeometry(1, 0.5, 1.5);
const materialVeiculo = new THREE.MeshStandardMaterial({ color: 0xff6600 });
const veiculo = new THREE.Mesh(geometriaVeiculo, materialVeiculo);
scene.add(veiculo);
console.log("VeÃ­culo criado");

// Carregar pista 1 inicialmente
try {
  const posInicial = criarPista1(scene);
  veiculo.position.set(posInicial.x, posInicial.y, posInicial.z);
  console.log("Pista 1 carregada, veÃ­culo posicionado");
} catch (error) {
  console.error("Erro ao carregar pista:", error);
}

addControls(camera, renderer, scene, veiculo);
console.log("Controles adicionados");

startLoop(renderer, scene, camera);
console.log("Loop iniciado");
>>>>>>> branch-samuel
