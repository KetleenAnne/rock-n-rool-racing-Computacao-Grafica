// veiculos/VeiculoBase.js
import * as THREE from "three";
import { criarModeloHavac } from "./modelos/Havac.js";

export class VeiculoBase {
  constructor(scene, cores, usarPhong = false) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.helice = null;
    
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
    
    // Criar modelo
    criarModeloHavac(this.group, this.cores, usarPhong);
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
    this.tempoPenalizacao = 3.0; // 3 segundos

    // Reduz velocidade para 30%, mas garante no mínimo um valor para não parar totalmente
    this.velocidadeAtual = Math.max(this.velocidadeAtual * 0.3, 2);

    console.log("Veículo atingido! Velocidade reduzida por 3 segundos.");
  }

  atualizarPenalizacao(deltaTime) {
    if (this.penalizado) {
      this.tempoPenalizacao -= deltaTime;

      if (this.tempoPenalizacao <= 0) {
        this.penalizado = false;
        this.tempoPenalizacao = 0;

        // IMPORTANTE: limpa a velocidade penalizada
        this.velocidadeAtual = 0;

        console.log("Penalização finalizada! Pode acelerar novamente.");
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
