import contadorVoltas from "./ContadorVoltas.js";

let pistaAtualNum = 1; // Começa na pista 1
var pistaSelecionada = null;
var velocidadeExibida;
var voltasExibida;

// Callback para mudança de pista
let onPistaChangeCallback = null;

export function setPistaChangeCallback(callback) {
  onPistaChangeCallback = callback;
}

export function getPistaSelecionada() {
  return pistaSelecionada;
}

export function getPistaAtual() {
  return pistaAtualNum;
}

export function setInfoBox(linhaVelocidade) {
  return (velocidadeExibida = linhaVelocidade);
}

export function setLinhaVoltas(linhaVoltas) {
  return (voltasExibida = linhaVoltas);
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
  aceleracao: 25.0,
  aceleracaoRe: 20.0,
  forcaFrenagem: 30.0, //ao apertar a tecla de ré
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
      case "1":
        // Trocar para Pista 1
        if (pistaAtualNum !== 1 && onPistaChangeCallback) {
          pistaAtualNum = 1;
          // Resetar velocidade ao trocar de pista
          statusVeiculo.velocidade = 0;
          statusVeiculo.direção = 0;
          onPistaChangeCallback(1);
          console.log("Trocando para Pista 1");
        }
        break;
      case "2":
        // Trocar para Pista 2
        if (pistaAtualNum !== 2 && onPistaChangeCallback) {
          pistaAtualNum = 2;
          // Resetar velocidade ao trocar de pista
          statusVeiculo.velocidade = 0;
          statusVeiculo.direção = 0;
          onPistaChangeCallback(2);
          console.log("Trocando para Pista 2");
        }
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

export function atualizaControlesVeiculo(deltaTime) {
  // ------- Aceleração e Frenagem do veículo -------
  if (keyStates.ArrowUp || keyStates.KeyW) {
    // Acelera para frente
    if (statusVeiculo.velocidade < statusVeiculo.velocidadeMax) {
      statusVeiculo.velocidade += statusVeiculo.aceleracao * deltaTime;
    }
  } else if (keyStates.ArrowDown || keyStates.KeyS) {
    //freia se estiver em movimento para frente
    if (statusVeiculo.velocidade > 0) {
      statusVeiculo.velocidade -= statusVeiculo.forcaFrenagem * deltaTime;
    }
    //ré
    else {
      statusVeiculo.velocidade -= statusVeiculo.aceleracaoRe * deltaTime;
    }
  } else {
    // desacelera naturalmente, quando nenhuma tecla pressionada
    const atritoComoForca = statusVeiculo.aceleracao * 0.7;

    if (statusVeiculo.velocidade > 0.1) {
      statusVeiculo.velocidade -= atritoComoForca * deltaTime;
    } else if (statusVeiculo.velocidade < -0.1) {
      statusVeiculo.velocidade += atritoComoForca * deltaTime;
    } else {
      statusVeiculo.velocidade = 0;
    }
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
  // if (Math.abs(statusVeiculo.velocidade) < 0.1) {
  //   statusVeiculo.velocidade = 0;
  // }

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

  // Atualiza a exibição de voltas na infoBox
  if (voltasExibida) {
    const voltasAtuais = contadorVoltas.getVoltas();
    const limiteVoltas = contadorVoltas.getLimiteVoltas();
    const isUltimaVolta = contadorVoltas.isUltimaVolta();
    const corridaFinalizada = contadorVoltas.isCorridaFinalizada();

    let textoVoltas = `Voltas: ${voltasAtuais}/${limiteVoltas}`;

    if (corridaFinalizada) {
      voltasExibida.innerHTML = "🏁 CORRIDA FINALIZADA! 🏁";
      voltasExibida.style.color = "lime";
      voltasExibida.style.fontWeight = "bold";
      voltasExibida.style.fontSize = "18px";
      voltasExibida.style.textShadow = "2px 2px 4px black";
      voltasExibida.style.animation = "none";
    } else if (isUltimaVolta) {
      voltasExibida.innerHTML = textoVoltas + " ➤ VOLTA FINAL!";
      voltasExibida.style.color = "red";
      voltasExibida.style.fontWeight = "bold";
      voltasExibida.style.fontSize = "18px";
      voltasExibida.style.textShadow =
        "0 0 10px rgba(255, 0, 0, 0.8), 2px 2px 4px black";
      voltasExibida.style.animation = "piscar 0.8s ease-in-out infinite";
    } else {
      voltasExibida.innerHTML = textoVoltas;
      voltasExibida.style.color = "yellow";
      voltasExibida.style.fontWeight = "bold";
      voltasExibida.style.fontSize = "14px";
      voltasExibida.style.textShadow = "1px 1px 2px black";
      voltasExibida.style.animation = "none";
    }
  }

  return statusVeiculo;
}

export function setVelocidade(novaVelocidade) {
  // Limita a velocidade para garantir que não inverta
  if (statusVeiculo.velocidade > 0 && novaVelocidade < 0) {
    statusVeiculo.velocidade = 0;
  } else if (statusVeiculo.velocidade < 0 && novaVelocidade > 0) {
    statusVeiculo.velocidade = 0;
  } else {
    statusVeiculo.velocidade = novaVelocidade;
  }
}
