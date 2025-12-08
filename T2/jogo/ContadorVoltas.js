import * as THREE from "three";
import sistemaCheckpoints from "./SistemaCheckpoints.js";

class ContadorVoltas {
  constructor() {
    this.voltas = 0;
    this.naLinha = false;
    this.primeiraPassagem = true;
    this.linhaBox = null;
    this.limiteVoltas = 4; // ALTERE AQUI para mudar o número de voltas
    this.corridaFinalizada = false;
  }

  // Define a área da linha de chegada baseado na pista
  setLinhaChegada(x, z, largura = 10, profundidade = 10) {
    this.linhaBox = new THREE.Box3(
      new THREE.Vector3(x - largura / 2, -1, z - profundidade / 2),
      new THREE.Vector3(x + largura / 2, 5, z + profundidade / 2)
    );
  }

  // Define o limite de voltas
  setLimiteVoltas(limite) {
    this.limiteVoltas = limite;
  }

  // Verifica se o veículo passou pela linha
  verificarPassagem(posicaoVeiculo) {
    if (!this.linhaBox || this.corridaFinalizada) return false;

    const pontoVeiculo = new THREE.Vector3(
      posicaoVeiculo.x,
      posicaoVeiculo.y,
      posicaoVeiculo.z
    );

    const dentroAgora = this.linhaBox.containsPoint(pontoVeiculo);

    // Se estava fora e agora está dentro
    if (dentroAgora && !this.naLinha) {
      this.naLinha = true;

      // Ignora a primeira passagem (posição inicial)
      if (this.primeiraPassagem) {
        this.primeiraPassagem = false;
        console.log("Posição inicial - não conta como volta");
        return false;
      }

      // ========== VERIFICAR CHECKPOINTS ==========
      const progressoCP = sistemaCheckpoints.getProgresso();
      
      if (!progressoCP.completo) {
        console.log(`❌ Volta inválida! Faltam ${progressoCP.total - progressoCP.atual} checkpoints!`);
        return { 
          voltaInvalida: true, 
          checkpointsFaltando: progressoCP.total - progressoCP.atual 
        };
      }
      // ==========================================

      // Conta a volta
      this.voltas++;
      console.log(`Volta ${this.voltas}/${this.limiteVoltas} completada!`);
      
      

      // Verifica se finalizou a corrida
      if (this.voltas >= this.limiteVoltas) {
        this.corridaFinalizada = true;
        console.log("🏁 CORRIDA FINALIZADA! 🏁");
        return { completouVolta: true, finalizouCorrida: true };
      }
      
      // Resetar checkpoints para próxima volta
      sistemaCheckpoints.reset();

      return { completouVolta: true, finalizouCorrida: false };
    }

    // Se estava dentro e agora está fora
    if (!dentroAgora && this.naLinha) {
      this.naLinha = false;
    }

    return false;
  }

  getVoltas() {
    return this.voltas;
  }

  getLimiteVoltas() {
    return this.limiteVoltas;
  }

  isUltimaVolta() {
    return this.voltas === this.limiteVoltas - 1 && !this.corridaFinalizada;
  }

  isCorridaFinalizada() {
    return this.corridaFinalizada;
  }

  reset() {
    this.voltas = 0;
    this.naLinha = false;
    this.primeiraPassagem = true;
    this.corridaFinalizada = false;
    sistemaCheckpoints.reset(); // Resetar checkpoints também
  }
}

// Instância única do contador
const contadorVoltas = new ContadorVoltas();

export default contadorVoltas;