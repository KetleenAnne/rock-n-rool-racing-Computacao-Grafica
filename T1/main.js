import * as THREE from "three";
import { initRenderer, InfoBox } from "../../libs/util/util.js";
import { setupScene } from "./setup/Scene.js";
import { setupCamera } from "./setup/Camera.js";
import { startLoop } from "./setup/Loop.js";
import { criarPista1 } from "./jogo/Pista.js";
import { addControls, getPistaSelecionada, setInfoBox } from "./jogo/Teclas.js";

let scene = new THREE.Scene();
let renderer = initRenderer();
let camera = setupCamera();

addMenu();
setupScene(scene); // cena - Scene.js

//veiculo auxiliar
const geometriaVeiculo = new THREE.BoxGeometry(1, 0.5, 1.5);
const materialVeiculo = new THREE.MeshStandardMaterial({ color: 0xff6600 });
const veiculo = new THREE.Mesh(geometriaVeiculo, materialVeiculo);
scene.add(veiculo);

// Carregar pista 1 inicialmente
const posInicial = criarPista1(scene);
veiculo.position.set(posInicial.x, posInicial.y, posInicial.z);
veiculo.rotation.y = -posInicial.rot;

addControls(camera, renderer); // controles - Teclas.js
startLoop(renderer, scene, camera, veiculo); // loop de animação - Loop.js

var pistaSelecionada = getPistaSelecionada();

//selecionar pista

//exemplo com bloco

function addMenu() {
  var infoBox = new InfoBox();

  infoBox.add("Rock'n Roll Racing 3D - T1");
  infoBox.addParagraph();
  infoBox.add("Teclas de movimento:");
  infoBox.add("* W/S ou Seta para cima/baixo: mover para frente/para trás");
  infoBox.add(
    "* A/D ou Seta para esquerda/direita: virar para esquerda/direita"
  );
  infoBox.addParagraph();
  // infoBox.add("Velocidade: 0.0 km/h");
  infoBox.show();

  const linhaVelocidade = document.createElement("div");
  linhaVelocidade.innerHTML = "Velocidade: 0.0 km/h";
  infoBox.infoBox.appendChild(linhaVelocidade);
  //const linhaVelocidade = infoBox.infoBox.lastElementChild;
  //cor das letras info box

  linhaVelocidade.style.color = "red";
  //definir linhaVelocidade em Teclas.js
  console.log(setInfoBox(linhaVelocidade));
  setInfoBox(linhaVelocidade);

  infoBox.infoBox.style.top = "10px"; // "Subir"
  infoBox.infoBox.style.left = "auto";
  infoBox.infoBox.style.right = "10px";
  infoBox.infoBox.style.bottom = "auto";
  infoBox.infoBox.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}
