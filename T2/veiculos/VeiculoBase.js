// veiculos/VeiculoBase.js
import * as THREE from "three";
import { criarModeloHavac } from "./modelos/Havac.js";

export class VeiculoBase {
  constructor(scene, cores, tipo = "base") {
    this.scene = scene;
    this.group = new THREE.Group();
    this.helice = null;
    this.tipo = tipo; // "jogador" ou "ia"
    
    // Posição e rotação
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    this.quaternion = new THREE.Quaternion();
    
    // Estado do veículo
    this.velocidadeAtual = 0;
    this.velocidadeMaxima = 50.0;
    this.penalizado = false;
    this.tempoPenalizacao = 0;
    
    // Sistema de disparos
    this.disparosDisponiveis = 4;
    this.disparosMaximos = 4;
    
    // Cores do veículo
    this.cores = cores || {
      baseInferior: 0x000000,
      baseSuperior: 0x4A3C2A,
      cabine: 0x3C4A2F,
      propulsor: 0x3D4A2E
    };
    
    // Criar modelo com tipo para identificação
    criarModeloHavac(this.group, this.cores, this.tipo);
    this.group.scale.set(0.2, 0.2, 0.2);
    
    // Encontrar hélice no grupo
    this.group.traverse((child) => {
      if (child.name === 'helice') {
        this.helice = child;
      }
    });
    
    this.scene.add(this.group);
  }

  // ========== MOVIMENTAÇÃO ==========
  
  rotateY(angle) {
    this.group.rotateY(angle);
    this.rotation.y = this.group.rotation.y;
    this.quaternion.copy(this.group.quaternion);
  }

  translateZ(distance) {
    this.group.translateZ(distance);
    this.position.copy(this.group.position);

    // Animar hélice
    if (this.helice && Math.abs(distance) > 0.001) {
      this.helice.rotation.z += distance * 60;
    }
  }

  reset(x = 0, y = 0, z = 0, rotY = 0) {
    this.group.position.set(x, y, z);
    this.group.rotation.set(0, rotY, 0);
    this.position.copy(this.group.position);
    this.rotation.copy(this.group.rotation);
    this.quaternion.copy(this.group.quaternion);
    this.velocidadeAtual = 0;
    this.disparosDisponiveis = this.disparosMaximos;
    this.penalizado = false;
    this.tempoPenalizacao = 0;
  }

  // ========== SISTEMA DE DISPAROS ==========
  
  podeDisparar() {
    return this.disparosDisponiveis > 0 && !this.penalizado;
  }

  gastarDisparo() {
    if (this.disparosDisponiveis > 0) {
      this.disparosDisponiveis--;
      return true;
    }
    return false;
  }

  recarregarDisparos() {
    this.disparosDisponiveis = this.disparosMaximos;
    console.log("Munição recarregada!");
  }

  // ========== SISTEMA DE DANO ==========
  
  aplicarDano() {
    if (this.penalizado) return;

    this.penalizado = true;
    this.tempoPenalizacao = 3.0;
    
    this.velocidadeAntesDano = this.velocidadeAtual;
    this.velocidadeMinima = this.velocidadeAntesDano * 0.3; // 30% da velocidade atual
    
    console.log(`⚠️ ${this.tipo.toUpperCase()} atingido! Velocidade ${this.velocidadeAntesDano.toFixed(1)} → ${this.velocidadeMinima.toFixed(1)} (30%)`);
  }

  atualizarPenalizacao(deltaTime) {
    if (this.penalizado) {
      // CORREÇÃO: Redução GRADUAL até 30% da velocidade original
      const velocidadeAlvo = this.velocidadeMinima;
      
      // Só reduz se estiver acima dos 30%
      if (this.velocidadeAtual > velocidadeAlvo) {
        // Interpolação suave para 30%
        this.velocidadeAtual = THREE.MathUtils.lerp(
          this.velocidadeAtual, 
          velocidadeAlvo, 
          0.08 // Taxa de redução gradual
        );
        
        // Garante que não caia abaixo dos 30%
        if (this.velocidadeAtual < velocidadeAlvo) {
          this.velocidadeAtual = velocidadeAlvo;
        }
      } else {
        // Mantém nos 30% durante a penalização
        this.velocidadeAtual = velocidadeAlvo;
      }
      
      // Conta o tempo de penalização
      this.tempoPenalizacao -= deltaTime;

      // Fim da penalização após 3 segundos
      if (this.tempoPenalizacao <= 0) {
        this.penalizado = false;
        this.tempoPenalizacao = 0;
        delete this.velocidadeAntesDano;
        delete this.velocidadeMinima;
        console.log(`✅ ${this.tipo.toUpperCase()} recuperado! Pode acelerar novamente.`);
      }
    }
  }
  
  // ========== GETTERS ==========
  
  getDirecaoFrente() {
    const direcao = new THREE.Vector3(0, 0, 1);
    direcao.applyQuaternion(this.quaternion);
    return direcao.normalize();
  }

  getBoundingSphere() {
    return new THREE.Sphere(this.position.clone(), 0.8);
  }
}