// veiculos/IAInimigo.js
import * as THREE from "three";
import sistemaCheckpoints from "../jogo/SistemaCheckpoints.js";
import { 
  CHECKPOINTS_PISTA1, 
  CHECKPOINTS_PISTA2, 
  CHECKPOINTS_PISTA3 
} from "../jogo/ConfigCheckpoints.js";

export class IAInimigo {
  constructor(veiculo, pista) {
    this.veiculo = veiculo;
    this.pista = pista;

    // Pega os checkpoints do sistema
    this.checkpoints = this.obterCheckpointsPista();
    this.checkpointAtual = 0;

    // Parâmetros IA
    this.distanciaCheckpoint = 0.5;

    // Disparo
    this.tempoUltimoDisparo = 0;
    this.intervaloDisparo = 2.5;

    console.log(`IA criada com ${this.checkpoints.length} checkpoints`);
  }

  obterCheckpointsPista() {
    let checkpointsConfig;

    if (this.pista === 1) {
      checkpointsConfig = CHECKPOINTS_PISTA1;
    } else if (this.pista === 2) {
      checkpointsConfig = CHECKPOINTS_PISTA2;
    } else if (this.pista === 3) {
      checkpointsConfig = CHECKPOINTS_PISTA3;
    } else {
      return [new THREE.Vector3(0, 0, 100)];
    }

    // Converte checkpoints em waypoints
    return checkpointsConfig.map(cp => {
      const centroX = (cp.poste1.x + cp.poste2.x) / 2;
      const centroZ = (cp.poste1.z + cp.poste2.z) / 2;
      return new THREE.Vector3(centroX, 0, centroZ);
    });
  }

  criarStateIA(direcao, acelerar) {
    return {
      direção: direcao,       // mesma lógica de direção do jogador
      velocidade: acelerar ? 1 : 0 // acelera como se segurasse W
    };
  }

  atualizar(deltaTime, jogador) {
    // Atualiza penalização
    this.veiculo.atualizarPenalizacao(deltaTime);

    if (this.veiculo.penalizado) {
      this.veiculo.velocidadeAtual *= 0.95;
      return;
    }

    this.seguirCheckpoint(deltaTime);
    this.tentarDisparar(deltaTime, jogador);
  }

  seguirCheckpoint(deltaTime) {
    const alvo = this.checkpoints[this.checkpointAtual];
    const pos = this.veiculo.position.clone();

    const dirAlvo = alvo.clone().sub(pos).setY(0).normalize();
    const dirFrente = this.veiculo.getDirecaoFrente();

    const cross = new THREE.Vector3().crossVectors(dirFrente, dirAlvo);

    // Escolhe direção da IA
    let steering = 0;
    if (cross.y > 0.05) steering = 1;
    else if (cross.y < -0.05) steering = -1;

    // Cria state igual ao jogador
    const state = this.criarStateIA(steering, true);

    // -------- Aceleração igual ao jogador --------
    if (state.velocidade !== 0) {
      const directionFactor = state.velocidade > 0 ? 1 : -1;
      this.veiculo.rotateY(state.direção * directionFactor * deltaTime * 60);
    }

    // Aceleração gradual igual do jogador
    const acel = 4.0; // mesma aceleração do jogador
    this.veiculo.velocidadeAtual += acel * deltaTime * state.velocidade;

    // Limita velocidade
    if (this.veiculo.velocidadeAtual > this.veiculo.velocidadeMaxima) {
      this.veiculo.velocidadeAtual = this.veiculo.velocidadeMaxima;
    } else if (this.veiculo.velocidadeAtual < -8.0) {
      this.veiculo.velocidadeAtual = -8.0;
    }

    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);
    // --------------------------------------------

    // Próximo checkpoint
    const distancia = alvo.distanceTo(pos);
    if (distancia < this.distanciaCheckpoint) {
      this.checkpointAtual = (this.checkpointAtual + 1) % this.checkpoints.length;
    }
  }

  tentarDisparar(deltaTime, jogador) {
    this.tempoUltimoDisparo += deltaTime;
    if (this.tempoUltimoDisparo < this.intervaloDisparo) return;
    if (!this.veiculo.podeDisparar()) return;

    const direcaoJogador = new THREE.Vector3()
      .subVectors(jogador.position, this.veiculo.position)
      .setY(0)
      .normalize();

    const direcaoIA = this.veiculo.getDirecaoFrente();
    const dot = direcaoIA.dot(direcaoJogador);
    const distancia = this.veiculo.position.distanceTo(jogador.position);

    if (dot > 0.6 && distancia > 10 && distancia < 60) {
      if (window.sistemaDisparos) {
        window.sistemaDisparos.criarDisparo(this.veiculo);
        this.tempoUltimoDisparo = 0;
      }
    }
  }
}
