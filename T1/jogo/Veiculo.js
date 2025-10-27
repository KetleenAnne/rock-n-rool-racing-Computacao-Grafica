import * as THREE from "three";

export class Vehicle {
  constructor(scene) {
    console.log("Construindo veículo Havac...");
    
    this.scene = scene;
    this.group = new THREE.Group();
    this.wheels = [];
    
    // Estado do veículo
    this.speed = 0;
    this.rotation = 0;
    this.position = { x: 0, y: 0, z: 0 };
    this.steeringAngle = 0; // Ângulo de direção atual
    
    // Constantes de física
    this.MAX_SPEED = 1.8;
    this.MAX_REVERSE_SPEED = -0.8;
    this.ACCELERATION = 0.04;
    this.DECELERATION = 0.025;
    this.FRICTION = 0.015;
    this.MAX_STEERING = 0.04; // Ângulo máximo de direção
    this.STEERING_SPEED = 0.003; // Velocidade que o volante vira
    this.STEERING_RECOVERY = 0.002; // Velocidade que o volante volta ao centro
    
    this.createVehicle();
    this.scene.add(this.group);
    
    console.log("Veículo Havac construído!");
  }

  createVehicle() {
    console.log("Criando Havac (hovercraft)...");
    
    // Array para armazenar hélices (para rotação)
    this.propellers = [];
    
    // ========== BASE INFLÁVEL (TORUS OVAL) ==========
    const baseTorusGeo = new THREE.TorusGeometry(2.2, 0.5, 16, 32);
    const baseTorusMat = new THREE.MeshPhongMaterial({ 
      color: 0x556B2F, // Verde oliva militar
      shininess: 20
    });
    const baseTorus = new THREE.Mesh(baseTorusGeo, baseTorusMat);
    baseTorus.rotation.x = Math.PI / 2;
    baseTorus.position.y = 0.5;
    baseTorus.scale.set(1, 1.3, 1); // Oval
    baseTorus.castShadow = true;
    this.group.add(baseTorus);

    // ========== PISO/PLATAFORMA INTERNA ==========
    const floorGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.15, 32);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x3C3C3C }); // Cinza escuro
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.5;
    floor.scale.set(1, 1, 1.3);
    floor.castShadow = true;
    this.group.add(floor);

    // ========== CORPO PRINCIPAL (CABINE) - AGORA NA FRENTE ==========
    const cabinGeo = new THREE.BoxGeometry(2.2, 1.2, 2.0);
    const cabinMat = new THREE.MeshPhongMaterial({ 
      color: 0x6B7C59, // Verde militar médio
      flatShading: false
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.3, 0.5); // INVERTIDO: positivo = frente
    cabin.castShadow = true;
    this.group.add(cabin);

    // Topo da cabine (levemente inclinado para frente)
    const cabinTopGeo = new THREE.BoxGeometry(2.2, 0.3, 1.5);
    const cabinTop = new THREE.Mesh(cabinTopGeo, cabinMat);
    cabinTop.position.set(0, 2.0, 0.3); // INVERTIDO
    cabinTop.rotation.x = 0.15; // Ângulo invertido
    cabinTop.castShadow = true;
    this.group.add(cabinTop);

    // ========== COCKPIT/JANELA FRONTAL - AGORA NA FRENTE ==========
    const cockpitGeo = new THREE.BoxGeometry(1.6, 0.7, 0.3);
    const cockpitMat = new THREE.MeshPhongMaterial({ 
      color: 0x1C3A1C, // Verde escuro
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 1.6, 1.5); // INVERTIDO: agora na frente
    cockpit.rotation.x = -0.1; // Ângulo invertido
    cockpit.castShadow = true;
    this.group.add(cockpit);

    // Moldura da janela
    const frameGeo = new THREE.BoxGeometry(1.7, 0.8, 0.15);
    const frameMat = new THREE.MeshPhongMaterial({ color: 0x4A5D3F });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 1.6, 1.58); // INVERTIDO
    frame.castShadow = true;
    this.group.add(frame);

    // ========== SEÇÃO TRASEIRA (BASE DOS PROPULSORES) - AGORA ATRÁS ==========
    const rearSectionGeo = new THREE.BoxGeometry(2.0, 0.8, 1.2);
    const rearSectionMat = new THREE.MeshPhongMaterial({ color: 0x5A6B4A });
    const rearSection = new THREE.Mesh(rearSectionGeo, rearSectionMat);
    rearSection.position.set(0, 1.0, -0.8); // INVERTIDO: negativo = trás
    rearSection.castShadow = true;
    this.group.add(rearSection);

    // ========== PAINÉIS LATERAIS ==========
    [-1.15, 1.15].forEach(xPos => {
      const panelGeo = new THREE.BoxGeometry(0.12, 0.8, 2.2);
      const panelMat = new THREE.MeshPhongMaterial({ color: 0x4A5638 });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(xPos, 1.3, 0.3); // Ajustado
      panel.castShadow = true;
      this.group.add(panel);

      // Detalhes metálicos nos painéis
      const detailGeo = new THREE.BoxGeometry(0.08, 0.15, 0.15);
      const detailMat = new THREE.MeshPhongMaterial({ color: 0x808080 });
      
      [-0.8, 0, 0.8].forEach(zPos => {
        const detail = new THREE.Mesh(detailGeo, detailMat);
        detail.position.set(xPos, 1.3, zPos);
        this.group.add(detail);
      });
    });

    // ========== PROPULSORES TRASEIROS (2 SEPARADOS) - AGORA ATRÁS ==========
    [-0.9, 0.9].forEach(xPos => {
      // Suporte do propulsor (conecta ao corpo)
      const supportGeo = new THREE.BoxGeometry(0.35, 0.6, 0.4);
      const supportMat = new THREE.MeshPhongMaterial({ color: 0x4A4A4A });
      const support = new THREE.Mesh(supportGeo, supportMat);
      support.position.set(xPos, 1.0, -1.6); // INVERTIDO: negativo = trás
      support.castShadow = true;
      this.group.add(support);

      // Corpo do propulsor (cilindro principal)
      const thrusterBodyGeo = new THREE.CylinderGeometry(0.4, 0.45, 1.0, 16);
      const thrusterBodyMat = new THREE.MeshPhongMaterial({ 
        color: 0x505050, // Cinza médio
        metalness: 0.5
      });
      const thrusterBody = new THREE.Mesh(thrusterBodyGeo, thrusterBodyMat);
      thrusterBody.position.set(xPos, 1.0, -2.1); // INVERTIDO
      thrusterBody.rotation.x = Math.PI / 2;
      thrusterBody.castShadow = true;
      this.group.add(thrusterBody);

      // Anel traseiro do propulsor (cinza escuro)
      const ringGeo = new THREE.TorusGeometry(0.45, 0.08, 8, 16);
      const ringMat = new THREE.MeshPhongMaterial({ 
        color: 0x3A3A3A, // Cinza escuro (SEM LARANJA)
        metalness: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(xPos, 1.0, -2.6); // INVERTIDO
      this.group.add(ring);

      // ========== HÉLICES (PALHETAS ROTATIVAS) ==========
      const propellerGroup = new THREE.Group();
      
      for (let i = 0; i < 4; i++) {
        const bladeGeo = new THREE.BoxGeometry(0.65, 0.08, 0.12);
        const bladeMat = new THREE.MeshPhongMaterial({ color: 0x2A2A2A });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.y = (Math.PI / 2) * i;
        blade.castShadow = true;
        propellerGroup.add(blade);
      }
      
      propellerGroup.position.set(xPos, 1.0, -2.1); // INVERTIDO
      propellerGroup.rotation.x = Math.PI / 2;
      this.group.add(propellerGroup);
      this.propellers.push(propellerGroup); // Adiciona ao array para rotação

      // Eixo central da hélice
      const axisGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
      const axisMat = new THREE.MeshPhongMaterial({ color: 0x1A1A1A });
      const axis = new THREE.Mesh(axisGeo, axisMat);
      axis.position.set(xPos, 1.0, -2.1); // INVERTIDO
      axis.rotation.x = Math.PI / 2;
      this.group.add(axis);
    });

    // ========== FARÓIS FRONTAIS - AGORA NA FRENTE ==========
    [-0.75, 0.75].forEach(xPos => {
      const lightGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const lightMat = new THREE.MeshPhongMaterial({ 
        color: 0xFFFFCC,
        emissive: 0xFFFF99,
        emissiveIntensity: 0.6
      });
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.position.set(xPos, 0.9, 1.65); // INVERTIDO
      this.group.add(light);
    });

    // ========== DETALHES MILITARES (LISTRAS/MARCAÇÕES) ==========
    // Listras camuflagem
    const stripeGeo = new THREE.BoxGeometry(0.15, 0.05, 1.8);
    const stripeMat = new THREE.MeshPhongMaterial({ color: 0x3D4A2E }); // Verde escuro
    
    [-0.5, 0.5].forEach(xPos => {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(xPos, 0.92, 0.3); // Ajustado
      this.group.add(stripe);
    });

    // Marcação central
    const markGeo = new THREE.BoxGeometry(0.3, 0.08, 0.3);
    const markMat = new THREE.MeshPhongMaterial({ color: 0xFFCC00 }); // Amarelo
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.position.set(0, 0.95, -0.5); // Ajustado
    this.group.add(mark);

    // ========== ESFERAS DE SUSTENTAÇÃO (4 CANTOS) ==========
    const supportSphereGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const supportSphereMat = new THREE.MeshPhongMaterial({ 
      color: 0x1C1C1C,
      shininess: 70
    });
    
    const supportPositions = [
      [-1.5, 0.45, -1.3], // INVERTIDO
      [1.5, 0.45, -1.3],  // INVERTIDO
      [-1.5, 0.45, 1.3],  // INVERTIDO
      [1.5, 0.45, 1.3]    // INVERTIDO
    ];

    supportPositions.forEach(pos => {
      const sphere = new THREE.Mesh(supportSphereGeo, supportSphereMat);
      sphere.position.set(...pos);
      sphere.castShadow = true;
      this.group.add(sphere);
      this.wheels.push(sphere);
    });

    console.log("Havac completo!");
  }

  // ========== MÉTODOS DE ATUALIZAÇÃO ==========
  
  updateWheelRotation() {
    // Rotação das esferas de sustentação
    this.wheels.forEach(wheel => {
      wheel.rotation.y += this.speed * 0.3;
    });
  }

  updatePosition() {
    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.group.rotation.y = -this.rotation;
  }

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
    // Aumenta o ângulo de direção gradualmente (quanto mais segura, mais vira)
    this.steeringAngle = Math.min(this.steeringAngle + this.STEERING_SPEED, this.MAX_STEERING);
  }

  turnRight() {
    // Diminui o ângulo de direção gradualmente (quanto mais segura, mais vira)
    this.steeringAngle = Math.max(this.steeringAngle - this.STEERING_SPEED, -this.MAX_STEERING);
  }

  // Retorna o volante ao centro quando não está virando
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