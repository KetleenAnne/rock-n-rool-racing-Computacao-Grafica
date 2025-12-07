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
    
    // Parâmetros
    this.velocidadeCruzeiro = 10.0;
    this.distanciaCheckpoint = 0.5;
    this.aceleracao = 0.7;
    
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
      // Fallback
      return [new THREE.Vector3(0, 0, 100)];
    }
    
    // Converter checkpoints (meio entre os postes) em waypoints
    return checkpointsConfig.map(cp => {
      const centroX = (cp.poste1.x + cp.poste2.x) / 2;
      const centroZ = (cp.poste1.z + cp.poste2.z) / 2;
      return new THREE.Vector3(centroX, 0, centroZ);
    });
  }

  atualizar(deltaTime, jogador) {
    if (this.veiculo.penalizado) {
      this.veiculo.velocidadeAtual *= 0.95;
      return;
    }
    
    this.seguirCheckpoint(deltaTime);
    this.tentarDisparar(deltaTime, jogador);
  }

  seguirCheckpoint(deltaTime) {
    const alvo = this.checkpoints[this.checkpointAtual];
    const posicao = this.veiculo.position.clone();
    
    const direcaoAlvo = new THREE.Vector3()
      .subVectors(alvo, posicao)
      .setY(0);
    
    const distancia = direcaoAlvo.length();
    direcaoAlvo.normalize();
    
    const direcaoVeiculo = this.veiculo.getDirecaoFrente();
    const cross = new THREE.Vector3().crossVectors(direcaoVeiculo, direcaoAlvo);
    const dot = direcaoVeiculo.dot(direcaoAlvo);
    
    // Virar
    const anguloVirada = 0.06 * deltaTime * 60;
    if (cross.y > 0.05) {
      this.veiculo.rotateY(anguloVirada);
    } else if (cross.y < -0.05) {
      this.veiculo.rotateY(-anguloVirada);
    }
    
    // Acelerar
    if (dot > 0.85) {
      if (this.veiculo.velocidadeAtual < this.velocidadeCruzeiro) {
        this.veiculo.velocidadeAtual += this.aceleracao * deltaTime * 60;
      }
    } else {
      this.veiculo.velocidadeAtual *= 0.96;
    }
    
    // Velocidade mínima
    if (this.veiculo.velocidadeAtual < 8.0) {
      this.veiculo.velocidadeAtual = 8.0;
    }
    
    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);
    
    // Próximo checkpoint
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