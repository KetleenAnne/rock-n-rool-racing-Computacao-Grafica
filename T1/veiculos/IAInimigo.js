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

    // Checkpoints
    this.checkpoints = this.obterCheckpointsPista();
    this.checkpointAtual = 0;

    this.distanciaCheckpoint = 0.5;

    // Disparo
    this.tempoUltimoDisparo = 0;
    this.intervaloDisparo = 2.5;

    console.log(`IA criada com ${this.checkpoints.length} checkpoints`);
  }

  obterCheckpointsPista() {
    let checkpointsConfig;

    if (this.pista === 1) checkpointsConfig = CHECKPOINTS_PISTA1;
    else if (this.pista === 2) checkpointsConfig = CHECKPOINTS_PISTA2;
    else if (this.pista === 3) checkpointsConfig = CHECKPOINTS_PISTA3;
    else return [new THREE.Vector3(0, 0, 100)];

    return checkpointsConfig.map(cp => {
      const centroX = (cp.poste1.x + cp.poste2.x) / 2;
      const centroZ = (cp.poste1.z + cp.poste2.z) / 2;
      return new THREE.Vector3(centroX, 0, centroZ);
    });
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

    // --------------- SUAVIZA CURVAS ---------------
    // Calcula o ângulo entre frente do veículo e alvo
    const dot = THREE.MathUtils.clamp(dirFrente.dot(dirAlvo), -1, 1);
    const angulo = Math.acos(dot);

    // Determina se deve virar esquerda (-1) ou direita (1)
    const cross = new THREE.Vector3().crossVectors(dirFrente, dirAlvo);
    const sentido = cross.y >= 0 ? 1 : -1;

    // Rotação proporcional ao ângulo, suavizando curvas
    const maxAnguloPorFrame = 0.06 * deltaTime * 30; 
    const rotacao = Math.min(angulo, maxAnguloPorFrame) * sentido;
    this.veiculo.rotateY(rotacao);
    // ----------------------------------------------

    // --------- ACELERAÇÃO---------
    const aceleracao = 3.0; 
    this.veiculo.velocidadeAtual += aceleracao * deltaTime;

    // Limites de velocidade
    this.veiculo.velocidadeAtual = Math.min(this.veiculo.velocidadeAtual, this.veiculo.velocidadeMaxima);
    this.veiculo.velocidadeAtual = Math.max(this.veiculo.velocidadeAtual, -8.0);

    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);
    // -----------------------------------------------

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
