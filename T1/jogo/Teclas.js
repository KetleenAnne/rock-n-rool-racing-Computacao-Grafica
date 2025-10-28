import { OrbitControls } from "../../build/jsm/controls/OrbitControls.js";
import { onWindowResize, InfoBox } from "../../libs/util/util.js";
import { criarPista1, criarPista2 } from "./Pista.js";

let pistaAtualNum = 1;
var pistaSelecionada = null;

export function getPistaSelecionada() {
  return pistaSelecionada;
}

export function getPistaAtual() {
  return pistaAtualNum;
}

const keyStates = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false,
};

var infoBox;
var velocidadeExibida;

function configuracaoTeclado() {
  // Eventos para "keyPressed" e "keyReleased"
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        keyStates.ArrowUp = true;
        break;
      case "ArrowDown":
        keyStates.ArrowDown = true;
        break;
      case "ArrowLeft":
        keyStates.ArrowLeft = true;
        break;
      case "ArrowRight":
        keyStates.ArrowRight = true;
        break;
      case "w":
      case "W":
        keyStates.KeyW = true;
        break;
      case "s":
      case "S":
        keyStates.KeyS = true;
        break;
      case "a":
      case "A":
        keyStates.KeyA = true;
        break;
      case "d":
      case "D":
        keyStates.KeyD = true;
        break;
    }
  });

  document.addEventListener("keyup", (event) => {
    switch (event.key) {
      case "ArrowUp":
        keyStates.ArrowUp = false;
        break;
      case "ArrowDown":
        keyStates.ArrowDown = false;
        break;
      case "ArrowLeft":
        keyStates.ArrowLeft = false;
        break;
      case "ArrowRight":
        keyStates.ArrowRight = false;
        break;
      case "w":
      case "W":
        keyStates.KeyW = false;
        break;
      case "s":
      case "S":
        keyStates.KeyS = false;
        break;
      case "a":
      case "A":
        keyStates.KeyA = false;
        break;
      case "d":
      case "D":
        keyStates.KeyD = false;
        break;
    }
  });
}

export function addControls(camera, renderer, scene, veiculo) {
  const orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

  // Centralizar controles na Pista 1 (70x68)
  orbit.target.set(69, 0, 67);
  orbit.update();

  window.addEventListener(
    "resize",
    () => onWindowResize(camera, renderer),
    false
  );

  //  Caixa de informações na tela
  infoBox = new InfoBox();
  infoBox.add("Rock'n Roll Racing 3D - T1");
  infoBox.addParagraph();
  infoBox.add("Use o mouse para interagir:");
  infoBox.add("* Botão esquerdo: rotaciona");
  infoBox.add("* Botão direito: movimenta (pan)");
  infoBox.add("* Scroll: zoom in/out");
  infoBox.addParagraph();
  infoBox.add("Teclas de movimento:");
  infoBox.add("* W/S ou Seta para cima/baixo: mover para frente/para trás");
  infoBox.add(
    "* A/D ou Seta para esquerda/direita: virar para esquerda/direita"
  );
  infoBox.addParagraph();
  velocidadeExibida = infoBox.add("Velocidade: 0.0 km/h");
  infoBox.show();
  //cor das letras info box
  infoBox.infoBox.style.color = "black";
  infoBox.infoBox.style.fontWeight = "bold";
  infoBox.infoBox.style.backgroundColor = "white";
  configuracaoTeclado();

  return orbit;
}

function resetarVeiculo(veiculo, posicao) {
  if (veiculo && veiculo.position) {
    veiculo.position.set(posicao.x, posicao.y, posicao.z);
    veiculo.rotation.y = 0; // Resetar rotação
  }
}

// configurações de velocidade do veiculo
const statusVeiculo = {
  velocidade: 0,
  direção: 0,

  // constantes
  velocidadeMax: 80.0,
  velocidadeMaxRe: -20.0,
  aceleracao: 0.5,
  aceleracaoRe: 0.3,
  forcaFrenagem: 0.8,
  anguloVirada: 0.04,
  atrito: 0.98,
};

export function atualizaControlesVeiculo() {
  // ------- Aceleração e Frenagem do veículo -------
  if (keyStates.ArrowUp || keyStates.KeyW) {
    // Acelera para frente
    if (statusVeiculo.velocidade < statusVeiculo.velocidadeMax) {
      statusVeiculo.velocidade += statusVeiculo.aceleracao;
    }
  } else if (keyStates.ArrowDown || keyStates.KeyS) {
    //freia se estiver em movimento para frente
    if (statusVeiculo.velocidade > 0) {
      statusVeiculo.velocidade -= statusVeiculo.forcaFrenagem;
    }
    //ré
    else {
      statusVeiculo.velocidade -= statusVeiculo.aceleracaoRe;
    }
  } else {
    // desacelera naturalmente, nenhuma tecla pressionada
    statusVeiculo.velocidade *= statusVeiculo.atrito;
  }

  // ------- Limites de Velocidade -------
  // limita para frente
  statusVeiculo.velocidade = Math.min(
    statusVeiculo.velocidade,
    statusVeiculo.velocidadeMax
  );
  // limita para ré
  statusVeiculo.velocidade = Math.max(
    statusVeiculo.velocidade,
    statusVeiculo.velocidadeMaxRe
  );

  // ------- Correção de Parada do veículo -------
  //velocidade muito baixa, para o carro
  if (Math.abs(statusVeiculo.velocidade) < 0.1) {
    statusVeiculo.velocidade = 0;
  }

  // ------- Direção do veículo -------
  if (statusVeiculo.velocidade !== 0) {
    if (keyStates.ArrowLeft || keyStates.KeyA) {
      statusVeiculo.direção = statusVeiculo.anguloVirada;
    } else if (keyStates.ArrowRight || keyStates.KeyD) {
      statusVeiculo.direção = -statusVeiculo.anguloVirada;
    } else {
      statusVeiculo.direção = 0;
    }
  } else {
    statusVeiculo.direção = 0;
  }

  // Atualiza a exibição da velocidade na infoBox
  if (velocidadeExibida) {
    velocidadeExibida.innerHTML =
      "Velocidade: " + (statusVeiculo.velocidade * 3.6).toFixed(1) + " km/h";
  }
}
