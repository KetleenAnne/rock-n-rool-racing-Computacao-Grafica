import * as THREE from "three";
import { initRenderer, InfoBox } from "../../libs/util/util.js";
import { setupScene } from "./setup/Scene.js";
import { setupCamera } from "./setup/Camera.js";
import { startLoop } from "./setup/Loop.js";
import { criarPista1, criarPista2, criarPista3 } from "./jogo/Pista.js";
import {
  addControls,
  getPistaSelecionada,
  setInfoBox,
  setLinhaVoltas,
  setPistaChangeCallback,
} from "./jogo/Teclas.js";
import { VeiculoJogador } from "./veiculos/VeiculoJogador.js";
import { VeiculoIA } from "./veiculos/VeiculoIA.js";
import { SistemaDisparos } from "./jogo/SistemaDisparos.js";
import contadorVoltas from "./jogo/ContadorVoltas.js";
import sistemaCheckpoints from "./jogo/SistemaCheckpoints.js";
import { 
  CHECKPOINTS_PISTA1, 
  CHECKPOINTS_PISTA2, 
  CHECKPOINTS_PISTA3 
} from "./jogo/ConfigCheckpoints.js";
import Stats from "../../build/jsm/libs/stats.module.js";
import { CORES_IA } from "./veiculos/coresVeiculos.js";
import { AudioManager } from "./jogo/AudioManager.js";

// ====================================================
// 1. TELA DE CARREGAMENTO (LOADING SCREEN)
// ====================================================
const loadingManager = new THREE.LoadingManager();

// Criar elementos HTML via JS
const telaLoading = document.createElement("div");
telaLoading.style.cssText = `
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: #111; z-index: 10000; display: flex; flex-direction: column;
  align-items: center; justify-content: center; color: white; font-family: sans-serif;
  transition: opacity 0.5s;
`;

const tituloGame = document.createElement("h1");
tituloGame.innerText = "ROCK N' ROLL RACING 3D";
tituloGame.style.marginBottom = "20px";
tituloGame.style.textShadow = "0 0 10px #ff0000";

const textoLoading = document.createElement("div");
textoLoading.innerText = "Carregando Motores... 0%";
textoLoading.style.marginBottom = "10px";
textoLoading.style.fontSize = "18px";

const containerBarra = document.createElement("div");
containerBarra.style.cssText = `
  width: 300px; height: 15px; background: #333; 
  border: 2px solid #555; border-radius: 8px; overflow: hidden;
`;

const barraProgresso = document.createElement("div");
barraProgresso.style.cssText = `
  width: 0%; height: 100%; background: linear-gradient(90deg, #ff0000, #ffaa00);
  transition: width 0.1s;
`;

const btnJogar = document.createElement("button");
btnJogar.innerText = "CLIQUE PARA INICIAR 🏁";
btnJogar.style.cssText = `
  display: none; margin-top: 30px; padding: 15px 40px; font-size: 22px; cursor: pointer;
  background: #28a745; color: white; border: none; border-radius: 5px;
  box-shadow: 0 0 15px #28a745; font-weight: bold; text-transform: uppercase;
`;

// Montar Tela
containerBarra.appendChild(barraProgresso);
telaLoading.appendChild(tituloGame);
telaLoading.appendChild(textoLoading);
telaLoading.appendChild(containerBarra);
telaLoading.appendChild(btnJogar);
document.body.appendChild(telaLoading);

// Eventos do LoadingManager
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const porcentagem = (itemsLoaded / itemsTotal) * 100;
  barraProgresso.style.width = porcentagem + "%";
  textoLoading.innerText = `Carregando Assets... ${Math.round(porcentagem)}%`;
};

loadingManager.onLoad = function () {
  textoLoading.innerText = "Pronto para Correr!";
  containerBarra.style.display = "none";
  btnJogar.style.display = "block";
};

// ====================================================
// 2. SETUP DA CENA E JOGO
// ====================================================
let scene = new THREE.Scene();
let renderer = initRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
let camera = setupCamera();

// --- SOM (Conectado ao Loading Manager) ---
const audioManager = new AudioManager(camera, loadingManager);
window.audioManager = audioManager; 

// CARREGAMENTO DOS SONS (Verifique os nomes dos arquivos!)
audioManager.carregar("shot", "./assets/disparo_sounds/Shot.wav", false, 0.5);
audioManager.carregar("hit", "./assets/disparo_sounds/Hit.wav", false, 0.8);
audioManager.carregar("start1", "../0_assets_T3/start01.mp3", false, 0.5);
audioManager.carregar("start2", "../0_assets_T3/start02.mp3", false, 0.5);
audioManager.carregar("lastLap", "../0_assets_T3/lastLap.mp3", false, 0.6);
audioManager.carregar("track1", "../0_assets_T3/01 Bad to the Bone.mp3", true, 0.4);
audioManager.carregar("track2", "../0_assets_T3/02 Paranoid.mp3", true, 0.4);
audioManager.carregar("track3", "../0_assets_T3/04 Peter Gunn.mp3", true, 0.4);

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// CSS piscar
const style = document.createElement("style");
style.textContent = `
  @keyframes piscar {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
`;
document.head.appendChild(style);

// Menu e Cena
addMenu();
setupScene(scene);
sistemaCheckpoints.scene = scene;

// Veículos
const jogador = new VeiculoJogador(scene);
let adversario1 = new VeiculoIA(scene, 1, CORES_IA[0]);
let adversario2 = new VeiculoIA(scene, 1, CORES_IA[1]);
let adversario3 = new VeiculoIA(scene, 1, CORES_IA[2]);
let todosVeiculos = [jogador, adversario1, adversario2, adversario3];

// Sistema de Disparos
const sistemaDisparos = new SistemaDisparos(scene);
window.sistemaDisparos = sistemaDisparos;

// Globais
window.jogador = jogador;
window.adversario1 = adversario1;
window.adversario2 = adversario2;
window.adversario3 = adversario3;
window.todosVeiculos = todosVeiculos;
window.jogoFinalizado = false;

// --- Configuração da Pista 1 ---
let posInicial = criarPista1(scene);

jogador.reset(posInicial.x, 0, posInicial.z - 5, posInicial.rot);
adversario1.reset(posInicial.x + 3, 0, posInicial.z + 3, posInicial.rot);
adversario2.reset(posInicial.x - 3, 0, posInicial.z + 3, posInicial.rot);
adversario3.reset(posInicial.x - 4, 0, posInicial.z - 5, posInicial.rot);

contadorVoltas.setLinhaChegada(0, 100, 20, 20);
contadorVoltas.reset();
sistemaCheckpoints.setCheckpoints(CHECKPOINTS_PISTA1);

// Função de troca de pista
function trocarPista(numeroPista) {
  console.log(`Trocando para pista ${numeroPista}`);
  
  contadorVoltas.reset();
  sistemaDisparos.limparTodos();
  window.jogoFinalizado = false;
  window.lastLapPlayed = false;

  if (window.divResultado) {
    window.divResultado.style.display = "none";
    window.divResultado.innerHTML = "";
  }

  // Tocar Intro
  audioManager.tocarInicioCorrida();

  if (numeroPista === 1) {
    posInicial = criarPista1(scene);
    contadorVoltas.setLinhaChegada(0, 100, 20, 20);
    sistemaCheckpoints.setCheckpoints(CHECKPOINTS_PISTA1);
    audioManager.tocarMusica("track1");
  } 
  else if (numeroPista === 2) {
    posInicial = criarPista2(scene);
    contadorVoltas.setLinhaChegada(30, 70, 20, 20);
    sistemaCheckpoints.setCheckpoints(CHECKPOINTS_PISTA2);
    audioManager.tocarMusica("track2");
  } 
  else if (numeroPista === 3) {
    posInicial = criarPista3(scene);
    contadorVoltas.setLinhaChegada(0, 60, 20, 20);
    sistemaCheckpoints.setCheckpoints(CHECKPOINTS_PISTA3);
    audioManager.tocarMusica("track3");
  }

  jogador.reset(posInicial.x, 0, posInicial.z - 5, posInicial.rot);
  adversario1.resetIA(numeroPista);
  adversario2.resetIA(numeroPista);
  adversario3.resetIA(numeroPista);

  adversario1.reset(posInicial.x + 3, 0, posInicial.z + 3, posInicial.rot);
  adversario2.reset(posInicial.x - 3, 0, posInicial.z + 3, posInicial.rot);
  adversario3.reset(posInicial.x - 4, 0, posInicial.z - 5, posInicial.rot);

  todosVeiculos = [jogador, adversario1, adversario2, adversario3];
  window.todosVeiculos = todosVeiculos;
}

setPistaChangeCallback(trocarPista);
addControls(camera, renderer);
startLoop(renderer, scene, camera, jogador, todosVeiculos, sistemaDisparos, stats);

var pistaSelecionada = getPistaSelecionada();

// ====================================================
// 3. INTERAÇÃO DO USUÁRIO (START)
// ====================================================
btnJogar.addEventListener("click", () => {
  // 1. Ocultar Loading
  telaLoading.style.opacity = "0";
  setTimeout(() => { telaLoading.style.display = "none"; }, 500);

  // 2. Desbloquear Áudio
  audioManager.desbloquear();

  // 3. Tocar Start e Música
  audioManager.tocarInicioCorrida();
  
  setTimeout(() => {
    audioManager.tocarMusica("track1");
  }, 100);
});

// Helpers UI
function addMenu() {
  var infoBox = new InfoBox();
  infoBox.add("Rock'n Roll Racing 3D");
  infoBox.addParagraph();
  infoBox.add("Teclas:");
  infoBox.add("* W/S: Mover");
  infoBox.add("* A/D: Virar");
  infoBox.add("* ESPAÇO: Atirar");
  infoBox.addParagraph();
  infoBox.add("Pistas: 1, 2, 3");
  infoBox.show();

  const linhaVelocidade = document.createElement("div");
  linhaVelocidade.innerHTML = "Velocidade: 0.0 km/h";
  linhaVelocidade.style.color = "red";
  infoBox.infoBox.appendChild(linhaVelocidade);
  setInfoBox(linhaVelocidade);

  const linhaVoltas = document.createElement("div");
  linhaVoltas.innerHTML = "Voltas: 0/4";
  linhaVoltas.style.color = "yellow";
  linhaVoltas.style.fontWeight = "bold";
  infoBox.infoBox.appendChild(linhaVoltas);
  setLinhaVoltas(linhaVoltas);

  const linhaCheckpoints = document.createElement("div");
  linhaCheckpoints.innerHTML = "Checkpoints: 0/4";
  linhaCheckpoints.style.color = "cyan";
  linhaCheckpoints.style.fontWeight = "bold";
  infoBox.infoBox.appendChild(linhaCheckpoints);
  window.linhaCheckpoints = linhaCheckpoints;

  infoBox.infoBox.style.top = "10px";
  infoBox.infoBox.style.right = "10px";
  infoBox.infoBox.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  const linhaDisparos = document.createElement("div");
  linhaDisparos.innerHTML = "Disparos: 🔴🔴🔴🔴 (4/4)";
  linhaDisparos.style.color = "#FF6B6B";
  linhaDisparos.style.fontWeight = "bold";
  infoBox.infoBox.appendChild(linhaDisparos);
  window.linhaDisparos = linhaDisparos;
}

const divResultado = document.createElement("div");
divResultado.id = "resultado-final";
divResultado.style.cssText = `
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 60px; font-weight: bold;
  text-align: center; display: none;
  z-index: 9999;
  background: rgba(0,0,0,0.9);
  padding: 40px 80px;
  border-radius: 20px;
  border: 5px solid white;
  text-shadow: 3px 3px 8px black;
`;
document.body.appendChild(divResultado);
window.divResultado = divResultado;