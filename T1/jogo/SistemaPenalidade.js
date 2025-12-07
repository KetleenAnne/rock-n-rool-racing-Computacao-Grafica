// jogo/SistemaPenalidade.js
import * as THREE from "three";

export class SistemaPenalidade {
  constructor() {
    this.veiculos = new Set(); // Todos os veículos que podem ser penalizados
    this.penalizacoes = new Map(); // Veículo -> dados
  }

  registrarVeiculo(veiculo) {
    this.veiculos.add(veiculo);
  }

  aplicarPenalidade(veiculo) {
    if (this.penalizacoes.has(veiculo)) return;

    const velocidadeAtual = veiculo.velocidadeAtual || 0;
    const velocidadeReduzida = velocidadeAtual * 0.3;

    this.penalizacoes.set(veiculo, {
      tempoRestante: 3.0,
      velocidadeOriginal: velocidadeAtual,
      velocidadeReduzida: velocidadeReduzida
    });

    console.log(`⚠️ ${veiculo.tipo.toUpperCase()} ATINGIDO! Velocidade ${velocidadeAtual.toFixed(1)} → ${velocidadeReduzida.toFixed(1)} (30%)`);
  }

  atualizar(deltaTime) {
    for (let veiculo of this.veiculos) {
      const dados = this.penalizacoes.get(veiculo);
      if (!dados) continue;

      // Suaviza a redução
      veiculo.velocidadeAtual = THREE.MathUtils.lerp(
        veiculo.velocidadeAtual,
        dados.velocidadeReduzida,
        0.08
      );

      // Fim da penalização
      dados.tempoRestante -= deltaTime;
      if (dados.tempoRestante <= 0) {
        this.penalizacoes.delete(veiculo);
        console.log(`✅ ${veiculo.tipo.toUpperCase()} recuperado!`);
      }
    }
  }

  limpar() {
    this.penalizacoes.clear();
  }
}

// Singleton
const sistemaPenalidade = new SistemaPenalidade();
export default sistemaPenalidade;
