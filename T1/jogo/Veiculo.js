// veiculo.js
import * as THREE from "three";

export class Veiculo {
  constructor(scene) {
    console.log("Construindo veículo Havac...");
    this.scene = scene;
    this.group = new THREE.Group();
    this.helice = null; // Posição e rotação
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    this.quaternion = new THREE.Quaternion();
    this.createVeiculo();
    this.group.scale.set(0.2, 0.2, 0.2); //40% //this.group.position.y = ;
    this.scene.add(this.group);
    console.log("Veículo Havac construído!");
  }

  createVeiculo() {
    console.log("Criando base oval do Havac..."); // ========== BASE OVAL INFERIOR (MAIOR) ==========
    const baseInferiorGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32);
    const baseInferiorMat = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 30,
    });
    const baseInferior = new THREE.Mesh(baseInferiorGeo, baseInferiorMat);
    baseInferior.position.y = 0.4;
    baseInferior.scale.set(1, 1, 1.4);
    baseInferior.castShadow = true; // <-- PROJETAR SOMBRA
    baseInferior.receiveShadow = true; // <-- RECEBER SOMBRA
    this.group.add(baseInferior); // ========== BASE SUPERIOR (ACHATADA COM DESNÍVEL) ==========

    const baseSuperiorGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.4, 32);
    const baseSuperiorMat = new THREE.MeshPhongMaterial({
      color: 0x4a3c2a,
      shininess: 30,
    });
    const baseSuperior = new THREE.Mesh(baseSuperiorGeo, baseSuperiorMat);
    baseSuperior.position.y = 1.0;
    baseSuperior.scale.set(1, 1, 1.4);
    baseSuperior.castShadow = true; // <-- PROJETAR SOMBRA
    baseSuperior.receiveShadow = true; // <-- RECEBER SOMBRA
    this.group.add(baseSuperior); // ========== CABINE HEXAGONAL ==========

    const cabineBaseShape = new THREE.Shape();
    cabineBaseShape.moveTo(-1.2, -0.5);
    cabineBaseShape.lineTo(1.2, -0.5);
    cabineBaseShape.lineTo(1.2, 1.5);
    cabineBaseShape.lineTo(0.6, 2.2);
    cabineBaseShape.lineTo(0, 2.5);
    cabineBaseShape.lineTo(-0.6, 2.2);
    cabineBaseShape.lineTo(-1.2, 1.5);
    cabineBaseShape.lineTo(-1.2, -0.5);

    const cabineBaseGeo = new THREE.ExtrudeGeometry(cabineBaseShape, {
      depth: 1.0,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.2,
      bevelSegments: 1,
    });
    const cabineMat = new THREE.MeshPhongMaterial({
      color: 0x3c4a2f,
      shininess: 30,
    });
    const cabineBase = new THREE.Mesh(cabineBaseGeo, cabineMat);
    cabineBase.rotation.x = Math.PI / 2;
    cabineBase.position.set(0, 2, 0.3);
    cabineBase.castShadow = true; // <-- PROJETAR SOMBRA
    cabineBase.receiveShadow = true; // <-- RECEBER SOMBRA
    this.group.add(cabineBase); // ========== PROPULSOR TRASEIRO ==========

    const coneGeo = new THREE.ConeGeometry(0.3, 1.5, 16);
    const coneMat = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 30,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, 2, -1.8);
    cone.castShadow = true; // <-- PROJETAR SOMBRA
    cone.receiveShadow = true; // <-- RECEBER SOMBRA
    this.group.add(cone);

    const decagonoGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.6, 10);
    const decagonoMat = new THREE.MeshPhongMaterial({
      color: 0x3d4a2e,
      shininess: 30,
    });
    const decagono = new THREE.Mesh(decagonoGeo, decagonoMat);
    decagono.position.set(0, 2.5, -1.8);
    decagono.rotation.x = Math.PI / 2;
    decagono.castShadow = true; // <-- PROJETAR SOMBRA
    decagono.receiveShadow = true; // <-- RECEBER SOMBRA
    this.group.add(decagono); // ========== HÉLICES ==========

    const heliceGroup = new THREE.Group();
    for (let i = 0; i < 2; i++) {
      const paGeo = new THREE.BoxGeometry(0.08, 0.8, 0.15);
      const paMat = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
      const pa = new THREE.Mesh(paGeo, paMat);
      pa.rotation.z = (Math.PI / 2) * i;
      pa.castShadow = true; // <-- PROJETAR SOMBRA
      pa.receiveShadow = true; // <-- RECEBER SOMBRA
      heliceGroup.add(pa);
    }
    heliceGroup.position.set(0, 2.5, -2.1);
    heliceGroup.rotation.z = Math.PI / 2;
    this.group.add(heliceGroup);
    this.helice = heliceGroup;
  }

  // ========== MÉTODOS COMPATÍVEIS COM THREE.Mesh ==========

  rotateY(angle) {
    this.group.rotateY(angle);
    this.rotation.y = this.group.rotation.y;
    this.quaternion.copy(this.group.quaternion);
  }

  translateZ(distance) {
    this.group.translateZ(distance);
    this.position.copy(this.group.position);

    // Animar hélice baseado no movimento
    if (this.helice && Math.abs(distance) > 0.001) {
      this.helice.rotation.z += distance * 60;
    }
  }

  // ========== UTILITÁRIO ==========

  reset(x = 0, y = 0, z = 0, rotY = 0) {
    this.group.position.set(x, y, z);
    this.group.rotation.set(0, rotY, 0);
    this.position.copy(this.group.position);
    this.rotation.copy(this.group.rotation);
    this.quaternion.copy(this.group.quaternion);
  }
}
