import * as THREE from "three";

export class Veiculo {
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
    
    this.createVeiculo ();
    this.scene.add(this.group);
    
    console.log("Veículo Havac construído!");
  }

  createVeiculo () {
    console.log("Criando base oval do Havac...");
    
    // ========== BASE OVAL INFERIOR (MAIOR) ==========
    const baseInferiorGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32);
    const baseInferiorMat = new THREE.MeshPhongMaterial({ 
      color: 0x000000, 
      shininess: 30,
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
      color: 0x4A3C2A, 
      shininess: 30,
    });
    const baseSuperior = new THREE.Mesh(baseSuperiorGeo, baseSuperiorMat);
    baseSuperior.position.y = 1.0;
    baseSuperior.scale.set(1, 1, 1.4);
    baseSuperior.castShadow = true;
    this.group.add(baseSuperior);


    // ========== CABINE HEXAGONAL (base que afina para cima) ==========
    const cabineBaseShape = new THREE.Shape();

    // Hexágono alongado (vista de cima)
    cabineBaseShape.moveTo(-1.2, -0.5);    // Traseira esquerda
    cabineBaseShape.lineTo(1.2, -0.5);     // Traseira direita
    cabineBaseShape.lineTo(1.2, 1.5);      // Lateral direita
    cabineBaseShape.lineTo(0.6, 2.2);      // Frente direita diagonal
    cabineBaseShape.lineTo(0, 2.5);        // Frente ponta
    cabineBaseShape.lineTo(-0.6, 2.2);     // Frente esquerda diagonal
    cabineBaseShape.lineTo(-1.2, 1.5);     // Lateral esquerda
    cabineBaseShape.lineTo(-1.2, -0.5);    // Fecha

    const cabineBaseGeo = new THREE.ExtrudeGeometry(cabineBaseShape, {
      depth: 1.0,
      bevelEnabled: true,
      bevelThickness: 0.1,  // Cria inclinação
      bevelSize: 0.2,
      bevelSegments: 1,
    });
    const cabineMat = new THREE.MeshPhongMaterial({ 
      color: 0x3C4A2F,
      shininess: 30
    });
    const cabineBase = new THREE.Mesh(cabineBaseGeo, cabineMat);
    cabineBase.rotation.x = Math.PI / 2;
    cabineBase.position.set(0, 2, 0.3);
    cabineBase.castShadow = true;
    this.group.add(cabineBase);

    // ========== PROPULSOR TRASEIRO ==========

    // Cone mais fino
    const coneGeo = new THREE.ConeGeometry(0.3, 1.5, 16);  // Mais fino
    const coneMat = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      shininess: 30
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, 2, -1.8);
    cone.castShadow = true;
    this.group.add(cone);

    // Decágono 3D (10 lados) em cima do cone
    const decagonoGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.6, 10);  // 10 segmentos = decágono
    const decagonoMat = new THREE.MeshPhongMaterial({ 
      color: 0x3D4A2E,
      shininess: 30,
      //flatShading: true  // Mostra os lados definidos
    });
    const decagono = new THREE.Mesh(decagonoGeo, decagonoMat);
    decagono.position.set(0, 2.5, -1.8);  // Em cima do cone
    decagono.rotation.x = Math.PI / 2;
    decagono.castShadow = true;
    this.group.add(decagono);

    // ========== 2 HÉLICES ATRÁS DO DECÁGONO ==========
    const heliceGroup = new THREE.Group();

    for (let i = 0; i < 2; i++) {
      const paGeo = new THREE.BoxGeometry(0.08, 0.8, 0.15);
      const paMat = new THREE.MeshPhongMaterial({ color: 0x2A2A2A });
      const pa = new THREE.Mesh(paGeo, paMat);
      
      // Rotacionar cada pá 90 graus (sentidos opostos = perpendiculares)
      pa.rotation.z = (Math.PI / 2) * i;
      
      pa.castShadow = true;
      heliceGroup.add(pa);
    }

    // Posicionar o grupo atrás do decágono
    heliceGroup.position.set(0, 2.5, -2.1);
    heliceGroup.rotation.z = Math.PI / 2;  // Virar para ficar correto
    this.group.add(heliceGroup);

    // Guardar referência para rotação futura
    this.helice = heliceGroup;
  }

  // ========== MÉTODOS DE ATUALIZAÇÃO ==========
  updateWheelRotation() {
    this.wheels.forEach(wheel => {
      wheel.rotation.y += this.speed * 0.3;
    });
    
    // Rotação da hélice quando há movimento
    if (this.helice && Math.abs(this.speed) > 0.01) {
      this.helice.rotation.z += this.speed * 3;  // Gira rápido
    }
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
