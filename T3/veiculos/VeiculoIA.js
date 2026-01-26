// veiculos/VeiculoIA.js
import { VeiculoBase } from "./VeiculoBase.js";
import { IAInimigo } from "./IAInimigo.js";

export class VeiculoIA extends VeiculoBase {
  /**
   * @param {THREE.Scene} scene
   * @param {number} pista
   * @param {Object} cores - objeto de cores do veículo
   */
  constructor(scene, pista, cores) {
    // azul padrão caso nenhuma cor seja passada
    const coresIA = cores || {
      baseInferior: 0x1C1C1C, // Cinza escuro
      baseSuperior: 0x00008B, // Azul escuro
      cabine: 0x4169E1,       // Azul royal
      propulsor: 0x00008B
    };

    super(scene, coresIA, "ia");

    // Instância da IA
    this.ia = new IAInimigo(this, pista);

    // Estados da corrida
    this.voltasCompletadas = 0;
    this.corridaFinalizada = false;
    this.passouLinha = false;
    this.primeiraPassagemIA = true;

    console.log("🤖 Veículo da IA criado", coresIA);
  }

  /**
   * Atualização chamada pelo loop principal
   * @param {number} deltaTime
   * @param {Array} todosVeiculos
   */
  atualizar(deltaTime, todosVeiculos) {
    // Atualiza penalização (tiros)
    this.atualizarPenalizacao(deltaTime);

    // IA controla o veículo
    if (this.ia && !this.corridaFinalizada) {
      this.ia.atualizar(deltaTime, todosVeiculos);
    }
  }

  /**
   * Reseta COMPLETAMENTE a IA ao trocar de pista
   * (não muda a cor)
   */
  resetIA(novaPista) {
    // Reset do veículo
    this.velocidadeAtual = 0;
    this.penalizado = false;
    this.tempoPenalizacao = 0;

    // Reset da corrida
    this.voltasCompletadas = 0;
    this.corridaFinalizada = false;
    this.passouLinha = false;
    this.primeiraPassagemIA = true;

    // Reset da IA
    this.ia.pista = novaPista;
    this.ia.checkpoints = this.ia.obterCheckpointsPista();
    this.ia.checkpointAtual = 0;
    this.ia.tempoUltimoDisparo = 0;

    console.log(`🔄 IA resetada para pista ${novaPista}`);
  }
}
