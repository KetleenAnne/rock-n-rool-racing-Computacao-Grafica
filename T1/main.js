import * as THREE from "three";
import { initRenderer, InfoBox } from "../../libs/util/util.js";
import { setupScene } from "./setup/Scene.js";
import { setupCamera } from "./setup/Camera.js";
import { startLoop } from "./setup/Loop.js";
import { criarPista1, criarPista2 } from "./jogo/Pista.js";
import { addControls, getPistaSelecionada, setInfoBox, setLinhaVoltas, setPistaChangeCallback } from "./jogo/Teclas.js";
import { Veiculo } from "./jogo/Veiculo.js";
import contadorVoltas from "./jogo/ContadorVoltas.js";

let scene = new THREE.Scene();
let renderer = initRenderer();
let camera = setupCamera();

// Adicionar CSS para animação de piscar
const style = document.createElement('style');
style.textContent = `
  @keyframes piscar {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
`;
document.head.appendChild(style);

addMenu();
setupScene(scene); // cena - Scene.js

const veiculo = new Veiculo(scene);

// Carregar pista 1 inicialmente
let posInicial = criarPista1(scene);
veiculo.reset(posInicial.x, 0, posInicial.z, posInicial.rot);

// Configurar linha de chegada para Pista 1
contadorVoltas.setLinhaChegada(0, 50, 10, 10);

// Função para trocar de pista
function trocarPista(numeroPista) {
  console.log(`Trocando para pista ${numeroPista}`);
  
  // Resetar contador de voltas
  contadorVoltas.reset();
  
  // Remover pista atual e criar nova
  if (numeroPista === 1) {
    posInicial = criarPista1(scene);
    // Configurar linha de chegada para Pista 1
    contadorVoltas.setLinhaChegada(0, 50, 10, 10);
  } else if (numeroPista === 2) {
    posInicial = criarPista2(scene);
    // Configurar linha de chegada para Pista 2
    contadorVoltas.setLinhaChegada(15, 35, 10, 10);
  }
  
  // Resetar posição do veículo
  veiculo.reset(posInicial.x, 0, posInicial.z, posInicial.rot);
}

// Configurar callback de mudança de pista
setPistaChangeCallback(trocarPista);

addControls(camera, renderer); // controles - Teclas.js
startLoop(renderer, scene, camera, veiculo); // loop de animação - Loop.js

var pistaSelecionada = getPistaSelecionada();

function addMenu() {
  var infoBox = new InfoBox();

  infoBox.add("Rock'n Roll Racing 3D - T1");
  infoBox.addParagraph();
  infoBox.add("Teclas de movimento:");
  infoBox.add("* W/S ou Seta para cima/baixo: mover para frente/para trás");
  infoBox.add("* A/D ou Seta para esquerda/direita: virar para esquerda/direita");
  infoBox.addParagraph();
  infoBox.add("Trocar de pista:");
  infoBox.add("* 1: Pista 1 (Oval)");
  infoBox.add("* 2: Pista 2 (Formato L)");
  infoBox.addParagraph();
  infoBox.show();

  // Linha de velocidade
  const linhaVelocidade = document.createElement("div");
  linhaVelocidade.innerHTML = "Velocidade: 0.0 km/h";
  linhaVelocidade.style.color = "red";
  infoBox.infoBox.appendChild(linhaVelocidade);
  setInfoBox(linhaVelocidade);

  // Linha de voltas
  const linhaVoltas = document.createElement("div");
  linhaVoltas.innerHTML = "Voltas: 0/4";
  linhaVoltas.style.color = "yellow";
  linhaVoltas.style.fontWeight = "bold";
  infoBox.infoBox.appendChild(linhaVoltas);
  setLinhaVoltas(linhaVoltas);

  infoBox.infoBox.style.top = "10px";
  infoBox.infoBox.style.left = "auto";
  infoBox.infoBox.style.right = "10px";
  infoBox.infoBox.style.bottom = "auto";
  infoBox.infoBox.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}