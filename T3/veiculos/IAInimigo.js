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

    // Controle de obstáculos
    this.tentativasDesvio = 0;
    this.maxTentativasDesvio = 60;
    this.tempoTravado = 0;
    this.posicaoAnterior = new THREE.Vector3();
    this.velocidadeAnterior = 0;

    // Delay inicial
    this.tempoDecorrido = 0;
    this.delayInicial = 0.5; // Espera 0.5 segundos antes de começar

    console.log(`IA criada com ${this.checkpoints.length} checkpoints`);
  }

  obterCheckpointsPista() {
    let cfg;
    if (this.pista === 1) cfg = CHECKPOINTS_PISTA1;
    else if (this.pista === 2) cfg = CHECKPOINTS_PISTA2;
    else if (this.pista === 3) cfg = CHECKPOINTS_PISTA3;
    else return [new THREE.Vector3(0, 0, 100)];

    return cfg.map((cp) => {
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

    // Delay inicial - IA espera 0.5s antes de começar a se mover
    if (this.tempoDecorrido < this.delayInicial) {
      this.tempoDecorrido += deltaTime;
      return; // Não faz nada durante o delay
    }

    // Detecta se está travado
    this.detectarTravamento(deltaTime);

    // Verifica se está muito à frente do jogador
    const multiplicadorVelocidade = this.verificarDistanciaJogador(todosVeiculos);

    // Sistema de desvio de obstáculos 
    const obstaculoDetectado = this.detectarObstaculos(todosVeiculos);
    
    if (obstaculoDetectado) {
      this.executarDesvio(deltaTime, obstaculoDetectado, multiplicadorVelocidade);
    } else {
      // Movimento normal
      this.tentativasDesvio = 0;
      this.seguirCheckpoint(deltaTime, multiplicadorVelocidade);
    }

    // Disparos
    this.tentarDisparar(deltaTime, todosVeiculos);
  }

  // =====================================================
  // VERIFICA DISTÂNCIA DO JOGADOR E AJUSTA VELOCIDADE
  // =====================================================
  verificarDistanciaJogador(todosVeiculos) {
    const jogador = todosVeiculos.find(v => v && v.tipo === 'jogador');
    if (!jogador) return 1.0;

    const voltasIA = this.veiculo.voltasCompletadas || 0;
    const voltasJogador = jogador.voltasCompletadas || 0;

    if (voltasIA > voltasJogador) {
      return 0.6;
    }

    if (voltasIA === voltasJogador) {
      const checkpointJogador = jogador.checkpointAtual || 0;
      const diferencaCheckpoints = this.checkpointAtual - checkpointJogador;

      if (diferencaCheckpoints >= 5) {
        return 0.55;
      }
      if (diferencaCheckpoints >= 3) {
        return 0.65;
      }
    }

    return 1.0;
  }

  // =====================================================
  // DETECTA SE O CARRO ESTÁ TRAVADO/PRESO
  // =====================================================
  detectarTravamento(deltaTime) {
    const distMovida = this.veiculo.position.distanceTo(this.posicaoAnterior);
    
    if (distMovida < 0.05 * deltaTime && this.veiculo.velocidadeAtual > 0.1) {
      this.tempoTravado += deltaTime;
      
      if (this.tempoTravado > 0.5) {
        this.manobraDestravamento();
        this.tempoTravado = 0;
      }
    } else {
      this.tempoTravado = 0;
    }
    
    this.posicaoAnterior.copy(this.veiculo.position);
  }

  // =====================================================
  // MANOBRA PARA DESTRAVAR O CARRO
  // =====================================================
  manobraDestravamento() {
    const alvo = this.checkpoints[this.checkpointAtual];
    
    this.veiculo.position.copy(alvo);
    this.veiculo.position.y = 0.3;
    
    const proximoIdx = (this.checkpointAtual + 1) % this.checkpoints.length;
    const proximoCP = this.checkpoints[proximoIdx];
    const direcao = new THREE.Vector3()
      .subVectors(proximoCP, alvo)
      .setY(0)
      .normalize();
    
    const angulo = Math.atan2(direcao.x, direcao.z);
    this.veiculo.rotation.y = angulo;
    
    this.veiculo.velocidadeAtual = 0.5;
    
    console.log(`IA resetada no checkpoint ${this.checkpointAtual}`);
  }

  // =====================================================
  // DETECTA OBSTÁCULOS À FRENTE 
  // =====================================================
  detectarObstaculos(todosVeiculos) {
    const frente = this.veiculo.getDirecaoFrente();
    const posicao = this.veiculo.position.clone();

    let obstaculoMaisProximo = null;
    let menorDistancia = Infinity;

    // ===== VERIFICA VEÍCULOS =====
    for (const outro of todosVeiculos) {
      if (!outro || outro === this.veiculo) continue;
      if (outro.corridaFinalizada) continue;

      const distancia = posicao.distanceTo(outro.position);
      
      if (distancia > 15) continue;

      const dirObstaculo = new THREE.Vector3()
        .subVectors(outro.position, posicao)
        .setY(0)
        .normalize();

      const dot = frente.dot(dirObstaculo);

      if (dot > 0.3) {
        const cross = new THREE.Vector3().crossVectors(frente, dirObstaculo);
        const distanciaLateral = Math.abs(cross.y) * distancia;

        if (distanciaLateral < 4) {
          if (distancia < menorDistancia) {
            menorDistancia = distancia;
            obstaculoMaisProximo = {
              tipo: 'veiculo',
              objeto: outro,
              distancia: distancia,
              dot: dot,
              distanciaLateral: distanciaLateral
            };
          }
        }
      }
    }

    // ===== VERIFICA OBJETOS NA PISTA (pneus, cones, barris, etc) =====
    if (window.objetosPista && Array.isArray(window.objetosPista)) {
      for (const objInfo of window.objetosPista) {
        if (!objInfo || !objInfo.mesh) continue;

        const objPosicao = objInfo.mesh.position;
        const distancia = posicao.distanceTo(objPosicao);

        if (distancia > 15) continue;

        const dirObstaculo = new THREE.Vector3()
          .subVectors(objPosicao, posicao)
          .setY(0)
          .normalize();

        const dot = frente.dot(dirObstaculo);

        if (dot > 0.3) {
          const cross = new THREE.Vector3().crossVectors(frente, dirObstaculo);
          const distanciaLateral = Math.abs(cross.y) * distancia;

          if (distanciaLateral < 3.5) { // Objetos têm área de detecção um pouco menor
            if (distancia < menorDistancia) {
              menorDistancia = distancia;
              obstaculoMaisProximo = {
                tipo: 'objeto',
                objeto: objInfo.mesh,
                distancia: distancia,
                dot: dot,
                distanciaLateral: distanciaLateral
              };
            }
          }
        }
      }
    }

    return obstaculoMaisProximo;
  }

  // =====================================================
  // EXECUTA MANOBRA DE DESVIO
  // =====================================================
  executarDesvio(deltaTime, obstaculo, multiplicadorVelocidade = 1.0) {
    this.tentativasDesvio++;

    const frente = this.veiculo.getDirecaoFrente();
    const dirObstaculo = new THREE.Vector3()
      .subVectors(obstaculo.objeto.position, this.veiculo.position)
      .setY(0)
      .normalize();

    // Determina lado do desvio
    const cross = new THREE.Vector3().crossVectors(frente, dirObstaculo);
    const ladoDesvio = cross.y >= 0 ? -1 : 1;

    // Ajusta velocidade baseado na proximidade
    if (obstaculo.distancia < 3) {
      this.veiculo.velocidadeAtual *= 0.7;
    } else if (obstaculo.distancia < 6) {
      this.veiculo.velocidadeAtual *= 0.85;
    } else {
      this.veiculo.velocidadeAtual *= 0.95;
    }

    // Rotação de desvio
    const intensidadeDesvio = THREE.MathUtils.clamp(
      0.08 / obstaculo.distancia, 
      0.01, 
      0.15
    );
    this.veiculo.rotateY(ladoDesvio * intensidadeDesvio);

    // Se travado por muito tempo, pula checkpoint
    if (this.tentativasDesvio > this.maxTentativasDesvio) {
      this.checkpointAtual = (this.checkpointAtual + 1) % this.checkpoints.length;
      this.tentativasDesvio = 0;
      this.veiculo.velocidadeAtual = 0.5;
    }

    // Acelera suavemente
    this.veiculo.velocidadeAtual += 0.5 * deltaTime;
    this.veiculo.velocidadeAtual = Math.min(
      this.veiculo.velocidadeAtual,
      this.veiculo.velocidadeMaxima * 0.7 * multiplicadorVelocidade
    );

    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);
  }

  // =====================================================
  // SEGUIR CHECKPOINT 
  // =====================================================
  seguirCheckpoint(deltaTime, multiplicadorVelocidade = 1.0) {
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
      this.veiculo.velocidadeMaxima * multiplicadorVelocidade
    );

    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);

    if (alvo.distanceTo(pos) < this.distanciaCheckpoint) {
      this.checkpointAtual =
        (this.checkpointAtual + 1) % this.checkpoints.length;
    }
  }

  // =====================================================
  // DISPAROS 
  // =====================================================
  tentarDisparar(deltaTime, todosVeiculos) {
    this.tempoUltimoDisparo += deltaTime;
    if (this.tempoUltimoDisparo < this.intervaloDisparo) return;
    if (!this.veiculo.podeDisparar()) return;

    const alvos = todosVeiculos.filter(
      (v) => v && v !== this.veiculo && !v.corridaFinalizada && v.position
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