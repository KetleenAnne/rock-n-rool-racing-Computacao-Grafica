let pistaAtualNum = 1;
var pistaSelecionada = null;
var velocidadeExibida;

export function getPistaSelecionada() {
  return pistaSelecionada;
}

export function getPistaAtual() {
  return pistaAtualNum;
}

export function setInfoBox(linhaVelocidade) {
  return (velocidadeExibida = linhaVelocidade);
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

// configurações de velocidade do veiculo
const statusVeiculo = {
  velocidade: 0,
  direção: 0,

  // constantes
  velocidadeMax: 50.0,
  velocidadeMaxRe: -20.0,
  aceleracao: 0.5,
  aceleracaoRe: 0.3,
  forcaFrenagem: 0.8, //ao apertar a tecla de ré
  anguloVirada: 0.04, // angulo de virada por frame
  atrito: 0.95, //desaceleração ao deixar de apertar teclas
};

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

export function addControls(camera, renderer) {
  configuracaoTeclado();
}

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
    // desacelera naturalmente, quando nenhuma tecla pressionada
    statusVeiculo.velocidade *= statusVeiculo.atrito;
  }

  // ------- Limites de Velocidade -------

  // limita velocidade aceleração
  statusVeiculo.velocidade = Math.min(
    statusVeiculo.velocidade,
    statusVeiculo.velocidadeMax
  );
  // limita velocidade de ré
  statusVeiculo.velocidade = Math.max(
    statusVeiculo.velocidade,
    statusVeiculo.velocidadeMaxRe
  );

  // ------- Correção de Parada do veículo -------

  // se a velocidade estiver muito baixa, para o carro
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
  return statusVeiculo;
}
