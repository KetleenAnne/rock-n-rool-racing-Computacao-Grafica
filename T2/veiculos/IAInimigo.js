// veiculos/IAInimigo.js
import * as THREE from "three";
import sistemaCheckpoints from "../jogo/SistemaCheckpoints.js";
import {
  CHECKPOINTS_PISTA1,
  CHECKPOINTS_PISTA2,
  CHECKPOINTS_PISTA3,
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

  // Calcula o centro geográfico entre os dois checkpoints
  // e cria um vetor THREE.Vector3 para cada um
  obterCheckpointsPista() {
    let checkpointsConfig;

    if (this.pista === 1) checkpointsConfig = CHECKPOINTS_PISTA1;
    else if (this.pista === 2) checkpointsConfig = CHECKPOINTS_PISTA2;
    else if (this.pista === 3) checkpointsConfig = CHECKPOINTS_PISTA3;
    else return [new THREE.Vector3(0, 0, 100)];

    return checkpointsConfig.map((cp) => {
      const centroX = (cp.poste1.x + cp.poste2.x) / 2;
      const centroZ = (cp.poste1.z + cp.poste2.z) / 2;
      return new THREE.Vector3(centroX, 0, centroZ);
    });
  }

  atualizar(deltaTime, todosVeiculos) {
    // Atualiza penalização
    this.veiculo.atualizarPenalizacao(deltaTime);

    if (this.veiculo.penalizado) {
      this.veiculo.velocidadeAtual *= 0.95;
      return;
    }

    this.seguirCheckpoint(deltaTime);
    this.tentarDisparar(deltaTime, jogador);
  }

  // Waypoint Following -> segue coordenadas
  // usa o vetor alvo, calculado antes por obterCheckpointsPista()
  // para guiar o veículo inimigo pela pista
  seguirCheckpoint(deltaTime) {
    const alvo = this.checkpoints[this.checkpointAtual];
    const pos = this.veiculo.position.clone();

    const dirAlvo = alvo.clone().sub(pos).setY(0).normalize();
    const dirFrente = this.veiculo.getDirecaoFrente();

    // --------------- SUAVIZA CURVAS ---------------
    // Calcula o ângulo entre frente do veículo e alvo
    // usa produto escalar (dot product) para o angulo que deve girar
    const dot = THREE.MathUtils.clamp(dirFrente.dot(dirAlvo), -1, 1);
    const angulo = Math.acos(dot);

    // Determina se deve virar esquerda (-1) ou direita (1)
    const cross = new THREE.Vector3().crossVectors(dirFrente, dirAlvo);
    const sentido = cross.y >= 0 ? 1 : -1;

    // Rotação proporcional ao ângulo, suavizando curvas
    // limita o ângulo máximo por frame para evitar rotações bruscas
    const maxAnguloPorFrame = 0.06 * deltaTime * 30;
    const rotacao = Math.min(angulo, maxAnguloPorFrame) * sentido;
    this.veiculo.rotateY(rotacao);
    // ----------------------------------------------

    // --------- ACELERAÇÃO---------
    const aceleracao = 1.8;
    this.veiculo.velocidadeAtual += aceleracao * deltaTime;

    // Limites de velocidade
    this.veiculo.velocidadeAtual = Math.min(
      this.veiculo.velocidadeAtual,
      this.veiculo.velocidadeMaxima
    );
    this.veiculo.velocidadeAtual = Math.max(this.veiculo.velocidadeAtual, -8.0);

    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);
    // -----------------------------------------------

    // Próximo checkpoint
    const distancia = alvo.distanceTo(pos);
    if (distancia < this.distanciaCheckpoint) {
      this.checkpointAtual =
        (this.checkpointAtual + 1) % this.checkpoints.length;
    }
  }

  tentarDisparar(deltaTime, todosVeiculos) {
    this.tempoUltimoDisparo += deltaTime;
    if (this.tempoUltimoDisparo < this.intervaloDisparo) return;
    if (!this.veiculo.podeDisparar()) return;

    // Filtrar apenas veículos válidos (não undefined, não this, não finalizados)
    const alvos = todosVeiculos.filter(
      (v) => v && v !== this.veiculo && !v.corridaFinalizada && v.position
    );

    if (alvos.length === 0) return;

    // Encontrar o alvo mais próximo dentro do cone de visão
    let melhorAlvo = null;
    let melhorScore = -1;

    const direcaoIA = this.veiculo.getDirecaoFrente();

    for (const alvo of alvos) {
      const direcaoAlvo = new THREE.Vector3()
        .subVectors(alvo.position, this.veiculo.position)
        .setY(0)
        .normalize();

      // Usa produto escalar para um cone de visão de disparo
      const dot = direcaoIA.dot(direcaoAlvo);
      const distancia = this.veiculo.position.distanceTo(alvo.position);

      // Verifica se o alvo está dentro do cone de visão (60°) e alcance (10-60)
      if (dot > 0.6 && distancia > 10 && distancia < 60) {
        // Score: quanto maior o dot (mais alinhado) e menor a distância, melhor
        // Prioriza alvos bem na mira e próximos
        const score = dot / (distancia * 0.1);

        if (score > melhorScore) {
          melhorScore = score;
          melhorAlvo = alvo;
        }
      }
    }

    // Disparar no melhor alvo encontrado
    if (melhorAlvo && window.sistemaDisparos) {
      window.sistemaDisparos.criarDisparo(this.veiculo);
      this.tempoUltimoDisparo = 0;

      // Log opcional para debug - mostra quem atirou em quem
      const tipoAlvo = melhorAlvo.tipo || "desconhecido";
      console.log(`🤖 IA disparou em ${tipoAlvo}`);
    }
  }
}
