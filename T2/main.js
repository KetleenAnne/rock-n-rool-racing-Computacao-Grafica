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
//import { Veiculo } from "./jogo/Veiculo.js";
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

// Setup básico: cena, renderizador e câmera
let scene = new THREE.Scene();
let renderer = initRenderer();

renderer.shadowMap.enabled = true; // Habilita processamento de sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombra mais suave
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

// Inicializar o sistema de checkpoints com a cena
sistemaCheckpoints.scene = scene;

//const veiculo = new Veiculo(scene);
const jogador = new VeiculoJogador(scene);
let adversario = new VeiculoIA(scene, 1);

const sistemaDisparos = new SistemaDisparos(scene);
window.sistemaDisparos = sistemaDisparos;

window.jogador = jogador;
window.adversario = adversario;

// --- Lógica das Pistas ---

// Carrega a Pista 1 por padrão
let posInicial = criarPista1(scene);
//veiculo.reset(posInicial.x, 0, posInicial.z, posInicial.rot); // Bota o carro no lugar
jogador.reset(posInicial.x, 0, posInicial.z -5, posInicial.rot);
adversario.reset(posInicial.x , 0, posInicial.z, posInicial.rot);

// Avisa o contador onde fica a linha de chegada da Pista 1
contadorVoltas.setLinhaChegada(0, 100, 20, 20);
contadorVoltas.reset(); // Reseta o contador ao iniciar

// Configurar checkpoints da Pista 1
sistemaCheckpoints.setCheckpoints(CHECKPOINTS_PISTA1);

// Função que o 'Teclas.js' vai chamar pra trocar de pista
function trocarPista(numeroPista) {
  console.log(`Trocando para pista ${numeroPista}`);

  contadorVoltas.reset(); // ZERA as voltas
  sistemaDisparos.limparTodos();
  if (adversario && adversario.group) {
    scene.remove(adversario.group);
  }

  // ========== RESETAR MENSAGEM DE VITÓRIA/DERROTA ==========
  if (window.divResultado) {
    window.divResultado.style.display = "none";
    window.divResultado.innerHTML = "";
  } 

  if (numeroPista === 1) {
    posInicial = criarPista1(scene);
    contadorVoltas.setLinhaChegada(0, 100, 20, 20); // Define linha de chegada
    adversario = new VeiculoIA(scene, 1);
    adversario.voltasCompletadas = 0; // Resetar contador de voltas da IA
    sistemaCheckpoints.setCheckpoints(CHECKPOINTS_PISTA1); // Define checkpoints
  } else if (numeroPista === 2) {
    posInicial = criarPista2(scene);
    contadorVoltas.setLinhaChegada(30, 70, 20, 20); // Define linha de chegada
    adversario = new VeiculoIA(scene, 2);
    adversario.voltasCompletadas = 0; // Resetar contador de voltas da IA
    sistemaCheckpoints.setCheckpoints(CHECKPOINTS_PISTA2); // Define checkpoints
  } else if (numeroPista === 3) {
    posInicial = criarPista3(scene);
    contadorVoltas.setLinhaChegada(0, 100, 20, 20); // Define linha de chegada
    adversario = new VeiculoIA(scene, 3);
    adversario.voltasCompletadas = 0; // Resetar contador de voltas da IA
    sistemaCheckpoints.setCheckpoints(CHECKPOINTS_PISTA3); // Define checkpoints
  }

  // Reseta o carro na posição da nova pista
  //veiculo.reset(posInicial.x, 0, posInicial.z, posInicial.rot);
  jogador.reset(posInicial.x, 0, posInicial.z - 5, posInicial.rot);
  adversario.reset(posInicial.x, 0, posInicial.z, posInicial.rot);
  window.adversario = adversario;
}

// "Linka" o arquivo de Teclas com a nossa função 'trocarPista'
setPistaChangeCallback(trocarPista);

// Inicia os controles e o loop principal do jogo
addControls(camera, renderer);
//startLoop(renderer, scene, camera, jogador, adversario, sistemaDisparos, stats);
startLoop(renderer, scene, camera, jogador, adversario, sistemaDisparos, stats);


var pistaSelecionada = getPistaSelecionada();

// Função pra criar a InfoBox (menu lateral)
function addMenu() {
  var infoBox = new InfoBox();

  // Textos do menu
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
  infoBox.add("* 3: Pista 3 (Formato 8)");
  infoBox.addParagraph();
  infoBox.show();

  // Linha de velocidade
  const linhaVelocidade = document.createElement("div");
  linhaVelocidade.innerHTML = "Velocidade: 0.0 km/h";
  linhaVelocidade.style.color = "red";
  infoBox.infoBox.appendChild(linhaVelocidade);
  setInfoBox(linhaVelocidade); // Manda pro 'Teclas.js' atualizar

  // Linha de voltas
  const linhaVoltas = document.createElement("div");
  linhaVoltas.innerHTML = "Voltas: 0/4";
  linhaVoltas.style.color = "yellow";
  linhaVoltas.style.fontWeight = "bold";
  infoBox.infoBox.appendChild(linhaVoltas);
  setLinhaVoltas(linhaVoltas); // Manda pro 'Teclas.js' atualizar

  // Linha de checkpoints
  const linhaCheckpoints = document.createElement("div");
  linhaCheckpoints.innerHTML = "Checkpoints: 0/4";
  linhaCheckpoints.style.color = "cyan";
  linhaCheckpoints.style.fontWeight = "bold";
  infoBox.infoBox.appendChild(linhaCheckpoints);
  window.linhaCheckpoints = linhaCheckpoints; // Exportar globalmente

  // Posiciona a caixa no canto
  infoBox.infoBox.style.top = "10px";
  infoBox.infoBox.style.left = "auto";
  infoBox.infoBox.style.right = "10px";
  infoBox.infoBox.style.bottom = "auto";
  infoBox.infoBox.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  // Linha de disparos
  const linhaDisparos = document.createElement("div");
  linhaDisparos.innerHTML = "Disparos: 🔴🔴🔴🔴 (4/4)";
  linhaDisparos.style.color = "#FF6B6B";
  linhaDisparos.style.fontWeight = "bold";
  infoBox.infoBox.appendChild(linhaDisparos);
  window.linhaDisparos = linhaDisparos;
}

  // Criar div de resultado
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