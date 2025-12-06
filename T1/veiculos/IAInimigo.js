// veiculos/IAInimigo.js
import * as THREE from "three";

export class IAInimigo {
  constructor(veiculo, pista) {
    this.veiculo = veiculo;
    this.pista = pista;
    
    // Waypoints da pista (você vai definir baseado na pista)
    this.waypoints = this.gerarWaypoints();
    this.waypointAtual = 0;
    
    // Parâmetros de movimento
    this.velocidadeCruzeiro = 35.0;
    this.distanciaMinima = 3.0; // Distância para considerar waypoint alcançado
    
    // Controle de disparo
    this.tempoUltimoDisparo = 0;
    this.intervaloDisparo = 2.0; // 2 segundos entre disparos
  }

  gerarWaypoints() {
    // PISTA 1 (OVAL) - Waypoints ao longo do circuito
    if (this.pista === 1) {
      return [
        new THREE.Vector3(0, 0, 50),    // Linha de largada
        new THREE.Vector3(40, 0, 40),   // Curva direita superior
        new THREE.Vector3(45, 0, 0),    // Lateral direita
        new THREE.Vector3(40, 0, -40),  // Curva direita inferior
        new THREE.Vector3(0, 0, -50),   // Topo
        new THREE.Vector3(-40, 0, -40), // Curva esquerda inferior
        new THREE.Vector3(-45, 0, 0),   // Lateral esquerda
        new THREE.Vector3(-40, 0, 40),  // Curva esquerda superior
      ];
    }
    
    // PISTA 2 (L) - Adapte conforme necessário
    return [
      new THREE.Vector3(15, 0, 35),
      new THREE.Vector3(15, 0, 0),
      new THREE.Vector3(15, 0, -40),
      new THREE.Vector3(40, 0, -40),
      new THREE.Vector3(40, 0, 0),
      new THREE.Vector3(40, 0, 35),
    ];
  }

  atualizar(deltaTime, jogador) {
    // Se está penalizado, não faz nada
    if (this.veiculo.penalizado) {
      this.veiculo.velocidadeAtual *= 0.95; // Desacelera
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
    const anguloVirada = 0.03 * deltaTime * 60;
    
    if (cross.y > 0.1) {
      this.veiculo.rotateY(anguloVirada); // Vira esquerda
    } else if (cross.y < -0.1) {
      this.veiculo.rotateY(-anguloVirada); // Vira direita
    }
    
    // Acelerar/desacelerar
    if (dot > 0.8) {
      // Alinhado com waypoint - acelera
      if (this.veiculo.velocidadeAtual < this.velocidadeCruzeiro) {
        this.veiculo.velocidadeAtual += 0.5 * deltaTime * 60;
      }
    } else {
      // Desalinhado - desacelera um pouco
      this.veiculo.velocidadeAtual *= 0.98;
    }
    
    // Mover veículo
    this.veiculo.translateZ(this.veiculo.velocidadeAtual * deltaTime);
    
    // Verificar se alcançou waypoint
    const distancia = posicao.distanceTo(alvo);
    if (distancia < this.distanciaMinima) {
      // Avança para próximo waypoint
      this.waypointAtual = (this.waypointAtual + 1) % this.waypoints.length;
    }
  }

  tentarDisparar(deltaTime, jogador) {
    this.tempoUltimoDisparo += deltaTime;
    
    // Cooldown de disparo
    if (this.tempoUltimoDisparo < this.intervaloDisparo) {
      return;
    }
    
    // Verifica se pode disparar
    if (!this.veiculo.podeDisparar()) {
      return;
    }
    
    // Verifica se jogador está À FRENTE
    if (this.jogadorEstaAFrente(jogador)) {
      // DISPARAR!
      window.sistemaDisparos.criarDisparo(this.veiculo);
      this.tempoUltimoDisparo = 0;
      console.log("IA disparou!");
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
    
    // Produto escalar
    const dot = direcaoIA.dot(direcaoJogador);
    
    // Se dot > 0.5, jogador está na frente (ângulo < 60°)
    // E verifica distância (não dispara se muito longe)
    const distancia = this.veiculo.position.distanceTo(jogador.position);
    
    return dot > 0.5 && distancia < 50;
  }
}