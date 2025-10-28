import * as THREE from "three";

export class Vehicle {
  constructor(scene) {
    console.log("Construindo veículo Havac...");
    
    this.scene = scene;
    this.group = new THREE.Group();
    this.wheels = [];
    this.helice = null;  
    
    // Estado do veículo
    this.speed = 0;
    this.rotation = 0;
    this.position = { x: 0, y: 0, z: 0 };
    this.steeringAngle = 0;
    
    
    // Constantes de física
    this.MAX_SPEED = 1.8;
    this.MAX_REVERSE_SPEED = -0.8;
    this.ACCELERATION = 0.04;
    this.DECELERATION = 0.025;
    this.FRICTION = 0.015;
    this.MAX_STEERING = 0.04;
    this.STEERING_SPEED = 0.003;
    this.STEERING_RECOVERY = 0.002;
    
    this.createVehicle();
    this.scene.add(this.group);
    
    console.log("Veículo Havac construído!");
  }

  createVehicle() {
    console.log("Criando base oval do Havac...");
    
    // ========== BASE OVAL INFERIOR (MAIOR) ==========
    const baseInferiorGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32);
    const baseInferiorMat = new THREE.MeshPhongMaterial({ 
      color: 0x556B2F, // Verde militar
      shininess: 30
    });
    const baseInferior = new THREE.Mesh(baseInferiorGeo, baseInferiorMat);
    baseInferior.position.y = 0.4;
    baseInferior.scale.set(1, 1, 1.4); // Escala Z maior = oval
    baseInferior.castShadow = true;
    this.group.add(baseInferior);

    // ========== BASE SUPERIOR (ACHATADA COM DESNÍVEL) ==========
    const baseSuperiorGeo = new THREE.CylinderGeometry(
      2.2,  // Raio superior (topo)
      2.5,  // Raio inferior
      0.4,  // Altura menor = mais achatada
      32
    );
    const baseSuperiorMat = new THREE.MeshPhongMaterial({ 
      color: 0x6B7C59, // Verde mais claro
      shininess: 30
    });
    const baseSuperior = new THREE.Mesh(baseSuperiorGeo, baseSuperiorMat);
    baseSuperior.position.y = 1.0;
    baseSuperior.scale.set(1, 1, 1.4);
    baseSuperior.castShadow = true;
    this.group.add(baseSuperior);

    // ========== CABINE TRAPEZOIDAL ==========
    const cabineShape = new THREE.Shape();
    // Desenhar vista de cima (trapézio horizontal)
    cabineShape.moveTo(-1.2, 0);       // Traseira esquerda (mais largo)
    cabineShape.lineTo(1.2, 0);        // Traseira direita (mais largo)
    cabineShape.lineTo(0.8, 2.5);      // Frente direita (mais fino)
    cabineShape.lineTo(-0.8, 2.5);     // Frente esquerda (mais fino)
    cabineShape.lineTo(-1.2, 0);       // Fecha

    const extrudeSettings = {
      depth: 0.8,  // Altura da cabine (baixa)
      bevelEnabled: true
    };

    const cabineGeo = new THREE.ExtrudeGeometry(cabineShape, extrudeSettings);
    const cabineMat = new THREE.MeshPhongMaterial({ 
      color: 0x5A6B4A,
      shininess: 30
    });
    const cabine = new THREE.Mesh(cabineGeo, cabineMat);

    // Rotacionar para ficar em pé
    cabine.rotation.x = Math.PI / 2;
    cabine.position.set(0, 1.8, 0.2);
    cabine.castShadow = true;
    this.group.add(cabine);

    console.log("Bases e cabine trapezoidal criadas!");

    // ========== PROPULSOR TRASEIRO ==========
    const coneGeo = new THREE.ConeGeometry(0.8, 3, 16);
    const coneMat = new THREE.MeshPhongMaterial({ 
      color: 0x3A4D2F,
      shininess: 30
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, 1.5, -1.8);  // Em pé na traseira
    cone.castShadow = true;
    this.group.add(cone);

    // Cilindro deitado em cima do cone
    const cilindroGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const cilindroMat = new THREE.MeshPhongMaterial({ 
      color: 0x4A5D3F,
      shininess: 30
    });
    const cilindro = new THREE.Mesh(cilindroGeo, cilindroMat);
    cilindro.position.set(0, 2.8, -1.8);  // Em cima do cone
    cilindro.rotation.x = Math.PI / 2;     // Deitado
    cilindro.castShadow = true;
    this.group.add(cilindro);
  }

  

  // ========== MÉTODOS DE ATUALIZAÇÃO ==========
  updateWheelRotation() {
  // Rotação das esferas de sustentação
  this.wheels.forEach(wheel => {
    wheel.rotation.y += this.speed * 0.3;
  });
  
  // Rotação da hélice quando há movimento
  if (this.helice && Math.abs(this.speed) > 0.01) {
    this.helice.rotation.x += this.speed * 3;  // Gira rápido
  }
}
  
  updateWheelRotation() {
    // Por enquanto vazio
  }

  updatePosition() {
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.y = -this.rotation;
  }
1
  move() {
    // Aplica a rotação baseada no ângulo de direção e velocidade
    this.rotation += this.steeringAngle * this.speed;
    
    // Move na direção que está apontando
    this.position.x += Math.sin(this.rotation) * this.speed;
    this.position.z += Math.cos(this.rotation) * this.speed;
  }

  // ========== MÉTODOS DE CONTROLE ==========
  
  accelerate() {
    this.speed = Math.min(this.speed + this.ACCELERATION, this.MAX_SPEED);
  }

  brake() {
    if (this.speed > 0.1) {
      this.speed = Math.max(this.speed - this.DECELERATION * 1.5, 0);
    } else if (Math.abs(this.speed) < 0.1) {
      this.speed = Math.max(this.speed - this.ACCELERATION * 0.7, this.MAX_REVERSE_SPEED);
    } else {
      this.speed = Math.max(this.speed - this.DECELERATION, this.MAX_REVERSE_SPEED);
    }
  }

  applyFriction() {
    if (this.speed > 0) {
      this.speed = Math.max(this.speed - this.FRICTION, 0);
    } else if (this.speed < 0) {
      this.speed = Math.min(this.speed + this.FRICTION, 0);
    }
  }

  turnLeft() {
    this.steeringAngle = Math.min(this.steeringAngle + this.STEERING_SPEED, this.MAX_STEERING);
  }

  turnRight() {
    this.steeringAngle = Math.max(this.steeringAngle - this.STEERING_SPEED, -this.MAX_STEERING);
  }

  straightenSteering() {
    if (this.steeringAngle > 0) {
      this.steeringAngle = Math.max(this.steeringAngle - this.STEERING_RECOVERY, 0);
    } else if (this.steeringAngle < 0) {
      this.steeringAngle = Math.min(this.steeringAngle + this.STEERING_RECOVERY, 0);
    }
  }

  // ========== MÉTODO PRINCIPAL DE UPDATE ==========
  
  update() {
    this.move();
    this.updateWheelRotation();
    this.updatePosition();
  }

  // ========== UTILITÁRIOS ==========
  
  getSpeedKmh() {
    return Math.round(Math.abs(this.speed) * 100);
  }

  getBoundingBox() {
    return new THREE.Box3().setFromObject(this.group);
  }

  getDirection() {
    return new THREE.Vector3(
      Math.sin(this.rotation),
      0,
      Math.cos(this.rotation)
    ).normalize();
  }

  reset(x = 0, y = 0, z = 0, rotation = 0) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.rotation = rotation;
    this.speed = 0;
    this.steeringAngle = 0;
    this.updatePosition();
  }
}