// veiculos/IAInimigo.js
import * as THREE from "three";
import {
  CHECKPOINTS_PISTA1,
  CHECKPOINTS_PISTA2,
  CHECKPOINTS_PISTA3,
} from "../jogo/ConfigCheckpoints.js";

export class IAInimigo {
  constructor(veiculo, pista) {
    this.veiculo = veiculo;
    this.pista = pista;

    this.checkpoints = this.obterCheckpointsPista();
    this.checkpointAtual = 0;
    this.distanciaCheckpoint = 0.5;

    this.tempoUltimoDisparo = 0;
    this.intervaloDisparo = 2.5;

    console.log(`IA criada com ${this.checkpoints.length} checkpoints`);
  }

  obterCheckpointsPista() {
    let cfg;
    if (this.pista === 1) cfg = CHECKPOINTS_PISTA1;
    else if (this.pista === 2) cfg = CHECKPOINTS_PISTA2;
    else if (this.pista === 3) cfg = CHECKPOINTS_PISTA3;
    else return [new THREE.Vector3(0, 0, 100)];

    return cfg.map(cp => {
      const x = (cp.poste1.x + cp.poste2.x) / 2;
      const z = (cp.poste1.z + cp.poste2.z) / 2;
      return new THREE.Vector3(x, 0, z);
    });
  }

  atualizar(deltaTime, todosVeiculos) {
    this.veiculo.atualizarPenalizacao(deltaTime);
    if (this.veiculo.penalizado) {
      this.veiculo.velocidadeAtual *= 0.95;
      return;
    }

    // =====================================================
    // IF #1 — EVITA IAs GRUDAREM (SOLUÇÃO SIMPLES E ESTÁVEL)
    // =====================================================
    if (this.iaMuitoPertoDeOutra(todosVeiculos)) {
      this.veiculo.velocidadeAtual = 0;
      return; // NÃO ANDA NESSE FRAME
    }

    // Movimento normal
    this.seguirCheckpoint(deltaTime);

    // Disparos
    this.tentarDisparar(deltaTime, todosVeiculos);
  }

  // =====================================================
  // DETECTA IA MUITO PRÓXIMA
  // =====================================================
  iaMuitoPertoDeOutra(todosVeiculos) {
    const DISTANCIA_MINIMA = 2.2;

    for (const outro of todosVeiculos) {
      if (!outro || outro === this.veiculo) continue;
      if (outro.tipo !== "ia") continue;

      const d = this.veiculo.position.distanceTo(outro.position);
      if (d < DISTANCIA_MINIMA) {
        return true;
      }
    }
    return false;
  }

  // =====================================================
  // SEGUIR CHECKPOINT
  // =====================================================
  seguirCheckpoint(deltaTime) {
    const alvo = this.checkpoints[this.checkpointAtual];
    const pos = this.veiculo.position.clone();

    const dirAlvo = alvo.clone().sub(pos).setY(0).normalize();
    const dirFrente = this.veiculo.getDirecaoFrente();

    const dot = THREE.MathUtils.clamp(dirFrente.dot(dirAlvo), -1, 1);
    const angulo = Math.acos(dot);

    const cross = new THREE.Vector3().crossVectors(dirFrente, dirAlvo);
    const sentido = cross.y >= 0 ? 1 : -1;

    const maxAngulo = 0.06 * deltaTime * 30;
    const rotacao = Math.min(angulo, maxAngulo) * sentido;
    this.veiculo.rotateY(rotacao);

    this.veiculo.velocidadeAtual += 1.8 * deltaTime;
    this.veiculo.velocidadeAtual = Math.min(
      this.veiculo.velocidadeAtual,
      this.veiculo.velocidadeMaxima
    );

    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);

    if (alvo.distanceTo(pos) < this.distanciaCheckpoint) {
      this.checkpointAtual =
        (this.checkpointAtual + 1) % this.checkpoints.length;
    }
  }

  // =====================================================
  // DISPAROS (INALTERADO)
  // =====================================================
  tentarDisparar(deltaTime, todosVeiculos) {
    this.tempoUltimoDisparo += deltaTime;
    if (this.tempoUltimoDisparo < this.intervaloDisparo) return;
    if (!this.veiculo.podeDisparar()) return;

    const alvos = todosVeiculos.filter(v =>
      v && v !== this.veiculo && !v.corridaFinalizada && v.position
    );

    let melhor = null;
    let score = -1;
    const frente = this.veiculo.getDirecaoFrente();

    for (const alvo of alvos) {
      const dir = new THREE.Vector3()
        .subVectors(alvo.position, this.veiculo.position)
        .setY(0)
        .normalize();

      const dot = frente.dot(dir);
      const dist = this.veiculo.position.distanceTo(alvo.position);

      if (dot > 0.6 && dist > 10 && dist < 60) {
        const s = dot / (dist * 0.1);
        if (s > score) {
          score = s;
          melhor = alvo;
        }
      }
    }

    if (melhor && window.sistemaDisparos) {
      window.sistemaDisparos.criarDisparo(this.veiculo);
      this.tempoUltimoDisparo = 0;
    }
  }
}
