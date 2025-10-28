import * as THREE from "three";
import { initRenderer } from "../../libs/util/util.js";
import { setupScene } from "./setup/Scene.js";
import { setupCamera } from "./setup/Camera.js";
import { startLoop } from "./setup/Loop.js";
import { criarPista1 } from "./jogo/Pista.js";
import { addControls, getPistaSelecionada } from "./jogo/Teclas.js";

let scene = new THREE.Scene();
let renderer = initRenderer();
let camera = setupCamera();

setupScene(scene); // cena - Scene.js

const geometriaVeiculo = new THREE.BoxGeometry(1, 0.5, 1.5);
const materialVeiculo = new THREE.MeshStandardMaterial({ color: 0xff6600 });
const veiculo = new THREE.Mesh(geometriaVeiculo, materialVeiculo);
scene.add(veiculo);

// Carregar pista 1 inicialmente
const posInicial = criarPista1(scene);
veiculo.position.set(posInicial.x, posInicial.y, posInicial.z);

addControls(camera, renderer, scene, veicul); // controles - Teclas.js
startLoop(renderer, scene, camera); // loop de animação - Loop.js

var pistaSelecionada = getPistaSelecionada();

//selecionar pista

//exemplo com bloco
