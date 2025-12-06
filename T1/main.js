import * as THREE from "three";
import { initRenderer, InfoBox } from "../../libs/util/util.js";
import { setupScene } from "./setup/Scene.js";
import { setupCamera } from "./setup/Camera.js";
import { startLoop } from "./setup/Loop.js";
import { criarPista1, criarPista2 } from "./jogo/Pista.js";
import {
  addControls,
  getPistaSelecionada,
  setInfoBox,
  setLinhaVoltas,
  setPistaChangeCallback,
} from "./jogo/Teclas.js";
//import { Veiculo } from "./jogo/Veiculo.js";
import contadorVoltas from "./jogo/ContadorVoltas.js";
import Stats from "../../build/jsm/libs/stats.module.js";
import { VeiculoJogador } from "./veiculos/VeiculoJogador.js";
import { VeiculoIA } from "./veiculos/VeiculoIA.js";
import { SistemaDisparos } from "./jogo/SistemaDisparos.js";

let scene = new THREE.Scene();
let renderer = initRenderer();

renderer.shadowMap.enabled = true; // Habilita processamento de sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; //sombra mais suave
let camera = setupCamera();

const stats = new Stats();
document.body.appendChild(stats.dom);

// CSS pra animação de piscar da "Última Volta"
// Tivemos que injetar o CSS aqui pra funcionar
const style = document.createElement("style");
style.textContent = `
  @keyframes piscar {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
`;
document.head.appendChild(style);

// Cria o menu (InfoBox) e a cena (luz, fundo)
addMenu();
setupScene(scene);

//const veiculo = new Veiculo(scene);
const jogador = new VeiculoJogador(scene);
let adversario = new VeiculoIA(scene, 1);

const sistemaDisparos = new SistemaDisparos(scene);
window.sistemaDisparos = sistemaDisparos; // IA precisa acessar

// --- Lógica das Pistas ---

// Carrega a Pista 1 por padrão
let posInicial = criarPista1(scene);
jogador.reset(posInicial.x - 2, 0, posInicial.z, posInicial.rot);
adversario.reset(posInicial.x + 2, 0, posInicial.z, posInicial.rot);

// Avisa o contador onde fica a linha de chegada da Pista 1
contadorVoltas.setLinhaChegada(0, 50, 10, 10);

let pistaAtual = 1; // Adicione no início do arquivo

function trocarPista(numeroPista) {
  console.log(`Trocando para pista ${numeroPista}`);
  contadorVoltas.reset();
  pistaAtual = numeroPista;
  sistemaDisparos.limparTodos();

  // Remover IA antiga e criar nova
  if (adversario && adversario.group) {
    scene.remove(adversario.group);
  }

  if (numeroPista === 1) {
    posInicial = criarPista1(scene);
    contadorVoltas.setLinhaChegada(0, 50, 10, 10);
    adversario = new VeiculoIA(scene, 1);
  } else if (numeroPista === 2) {
    posInicial = criarPista2(scene);
    contadorVoltas.setLinhaChegada(15, 35, 10, 10);
    adversario = new VeiculoIA(scene, 2);
  }

  jogador.reset(posInicial.x, 0.2, posInicial.z, posInicial.rot);
  adversario.reset(posInicial.x - 5, 0.5, posInicial.z, posInicial.rot);
}

// "Linka" o arquivo de Teclas com a nossa função 'trocarPista'
setPistaChangeCallback(trocarPista);

addControls(camera, renderer);
startLoop(renderer, scene, camera, jogador, adversario, sistemaDisparos, stats);

// ========== DISPARO DO JOGADOR ==========
window.addEventListener("keydown", (e) => {
  if (e.key === " " && !e.repeat) { // Espaço sem repetição
    e.preventDefault();
    if (sistemaDisparos && jogador.podeDisparar()) {
      sistemaDisparos.criarDisparo(jogador);
    }
  }
});

var pistaSelecionada = getPistaSelecionada();

// Função pra criar a InfoBox (menu lateral)
function addMenu() {
  var infoBox = new InfoBox();

  infoBox.add("Rock'n Roll Racing 3D - T2");
  infoBox.addParagraph();
  infoBox.add("Teclas de movimento:");
  infoBox.add("* W/S ou Seta para cima/baixo: mover para frente/para trás");
  infoBox.add(
    "* A/D ou Seta para esquerda/direita: virar para esquerda/direita"
  );
  infoBox.addParagraph();
  infoBox.add("Trocar de pista:");
  infoBox.add("* 1: Pista 1 (Oval)");
  infoBox.add("* 2: Pista 2 (Formato L)");
  infoBox.addParagraph();
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

  infoBox.infoBox.style.top = "10px";
  infoBox.infoBox.style.left = "auto";
  infoBox.infoBox.style.right = "10px";
  infoBox.infoBox.style.bottom = "auto";
  infoBox.infoBox.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
}
