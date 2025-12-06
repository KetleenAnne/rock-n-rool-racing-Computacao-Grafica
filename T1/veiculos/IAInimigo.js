// veiculos/IAInimigo.js
import * as THREE from "three";

export class IAInimigo {
  constructor(veiculo, pista) {
    this.veiculo = veiculo;
    this.pista = pista;
    
    // Waypoints da pista
    this.waypoints = this.gerarWaypoints();
    this.waypointAtual = 0;
    
    // Parâmetros de movimento
    this.velocidadeCruzeiro = 40.0;
    this.distanciaMinima = 8.0; // Distância para considerar waypoint alcançado
    this.aceleracao = 0.8;
    this.desaceleracao = 0.97;
    
    // Controle de disparo
    this.tempoUltimoDisparo = 0;
    this.intervaloDisparo = 2.5; // 2.5 segundos entre disparos
    
    console.log(`IA criada para pista ${pista} com ${this.waypoints.length} waypoints`);
  }

  gerarWaypoints() {
    // PISTA 1 (OVAL) - Começa indo PARA FRENTE (Z negativo)
    if (this.pista === 1) {
      return [
        new THREE.Vector3(0, 0, 30),     // Próximo waypoint à frente
        new THREE.Vector3(0, 0, 0),      // Centro
        new THREE.Vector3(0, 0, -30),    // Indo para o fundo
        new THREE.Vector3(30, 0, -40),   // Curva direita inferior
        new THREE.Vector3(43, 0, -20),   // Lateral direita
        new THREE.Vector3(43, 0, 0),     // Lateral direita meio
        new THREE.Vector3(43, 0, 20),    // Lateral direita superior
        new THREE.Vector3(30, 0, 40),    // Curva direita superior
        new THREE.Vector3(0, 0, 48),     // Topo (linha de chegada)
        new THREE.Vector3(-30, 0, 40),   // Curva esquerda superior
        new THREE.Vector3(-43, 0, 20),   // Lateral esquerda
        new THREE.Vector3(-43, 0, 0),    // Lateral esquerda meio
        new THREE.Vector3(-43, 0, -20),  // Lateral esquerda inferior
        new THREE.Vector3(-30, 0, -40),  // Curva esquerda inferior
        new THREE.Vector3(0, 0, -48),    // Fundo
      ];
    }
    
    // PISTA 2 (L) - Formato L
    return [
      new THREE.Vector3(15, 0, 28),    // À frente da largada
      new THREE.Vector3(15, 0, 10),    
      new THREE.Vector3(15, 0, -10),   
      new THREE.Vector3(15, 0, -30),   
      new THREE.Vector3(20, 0, -38),   // Entrada da curva
      new THREE.Vector3(28, 0, -40),   
      new THREE.Vector3(38, 0, -40),   
      new THREE.Vector3(40, 0, -30),   
      new THREE.Vector3(40, 0, -10),   
      new THREE.Vector3(40, 0, 10),    
      new THREE.Vector3(40, 0, 28),    
      new THREE.Vector3(35, 0, 33),    // Volta para largada
      new THREE.Vector3(25, 0, 33),    
      new THREE.Vector3(18, 0, 33),    
    ];
  }

  atualizar(deltaTime, jogador) {
    // Se está penalizado, não acelera e desacelera gradualmente
    if (this.veiculo.penalizado) {
      this.veiculo.velocidadeAtual *= 0.95;
      return;
    }
    
    // 1. SEGUIR WAYPOINT
    this.seguirWaypoint(deltaTime);
    
    // 2. TENTAR DISPARAR NO JOGADOR
    this.tentarDisparar(deltaTime, jogador);
  }

  seguirWaypoint(deltaTime) {
    const alvo = this.waypoints[this.waypointAtual];
    const posicao = this.veiculo.position.clone();
    
    // Vetor do veículo até o waypoint
    const direcaoAlvo = new THREE.Vector3()
      .subVectors(alvo, posicao)
      .setY(0)
      .normalize();
    
    // Direção atual do veículo
    const direcaoVeiculo = this.veiculo.getDirecaoFrente();
    
    // Calcular ângulo de virada (produto vetorial)
    const cross = new THREE.Vector3()
      .crossVectors(direcaoVeiculo, direcaoAlvo);
    
    const dot = direcaoVeiculo.dot(direcaoAlvo);
    
    // Virar em direção ao waypoint
    const anguloVirada = 0.04 * deltaTime * 60;
    
    if (cross.y > 0.1) {
      this.veiculo.rotateY(anguloVirada); // Vira esquerda
    } else if (cross.y < -0.1) {
      this.veiculo.rotateY(-anguloVirada); // Vira direita
    }
    
    // Acelerar/desacelerar baseado no alinhamento
    if (dot > 0.7) {
      // Bem alinhado com waypoint - acelera
      if (this.veiculo.velocidadeAtual < this.velocidadeCruzeiro) {
        this.veiculo.velocidadeAtual += this.aceleracao * deltaTime * 60;
      }
    } else if (dot > 0.3) {
      // Parcialmente alinhado - mantém velocidade
      if (this.veiculo.velocidadeAtual < this.velocidadeCruzeiro * 0.7) {
        this.veiculo.velocidadeAtual += this.aceleracao * 0.5 * deltaTime * 60;
      }
    } else {
      // Muito desalinhado - desacelera
      this.veiculo.velocidadeAtual *= this.desaceleracao;
    }
    
    // Garantir velocidade mínima (evita parar completamente)
    if (this.veiculo.velocidadeAtual < 5.0 && !this.veiculo.penalizado) {
      this.veiculo.velocidadeAtual = 5.0;
    }
    
    // Mover veículo
    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);
    
    // Verificar se alcançou waypoint
    const distancia = posicao.distanceTo(alvo);
    if (distancia < this.distanciaMinima) {
      // Avança para próximo waypoint
      this.waypointAtual = (this.waypointAtual + 1) % this.waypoints.length;
      console.log(`IA alcançou waypoint, próximo: ${this.waypointAtual}`);
    }
  }

  tentarDisparar(deltaTime, jogador) {
    // Atualizar cooldown
    this.tempoUltimoDisparo += deltaTime;
    
    // Cooldown de disparo não passou
    if (this.tempoUltimoDisparo < this.intervaloDisparo) {
      return;
    }
    
    // Verifica se pode disparar
    if (!this.veiculo.podeDisparar()) {
      return;
    }
    
    // Verifica se jogador está À FRENTE e em alcance
    if (this.jogadorEstaAFrente(jogador)) {
      // Verifica se tem sistema de disparos
      if (window.sistemaDisparos) {
        window.sistemaDisparos.criarDisparo(this.veiculo);
        this.tempoUltimoDisparo = 0;
        console.log("IA disparou!");
      }
    }
  }

  jogadorEstaAFrente(jogador) {
    // Vetor do veículo IA até o jogador
    const direcaoJogador = new THREE.Vector3()
      .subVectors(jogador.position, this.veiculo.position)
      .setY(0)
      .normalize();
    
    // Direção que a IA está olhando
    const direcaoIA = this.veiculo.getDirecaoFrente();
    
    // Produto escalar (dot product)
    const dot = direcaoIA.dot(direcaoJogador);
    
    // Distância até o jogador
    const distancia = this.veiculo.position.distanceTo(jogador.position);
    
    // Jogador está na frente se:
    // - dot > 0.6 (ângulo menor que ~53°)
    // - distância entre 10 e 60 unidades
    return dot > 0.6 && distancia > 10 && distancia < 60;
  }
}