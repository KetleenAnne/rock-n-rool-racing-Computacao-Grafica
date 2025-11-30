// veiculos/modelos/Havac.js
import * as THREE from "three";

export function criarModeloHavac(group, cores, usarPhong = false) {
  // Escolher tipo de material
  const MaterialType = usarPhong ? THREE.MeshPhongMaterial : THREE.MeshLambertMaterial;
  
  // ========== BASE OVAL INFERIOR ==========
  const baseInferiorGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32);
  const baseInferiorMat = new MaterialType({ 
    color: cores.baseInferior,
    shininess: usarPhong ? 30 : undefined
  });
  const baseInferior = new THREE.Mesh(baseInferiorGeo, baseInferiorMat);
  baseInferior.position.y = 0.4;
  baseInferior.scale.set(1, 1, 1.4);
  baseInferior.castShadow = true;
  group.add(baseInferior);

  // ========== BASE SUPERIOR ==========
  const baseSuperiorGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.4, 32);
  const baseSuperiorMat = new MaterialType({ 
    color: cores.baseSuperior,
    shininess: usarPhong ? 30 : undefined
  });
  const baseSuperior = new THREE.Mesh(baseSuperiorGeo, baseSuperiorMat);
  baseSuperior.position.y = 1.0;
  baseSuperior.scale.set(1, 1, 1.4);
  baseSuperior.castShadow = true;
  group.add(baseSuperior);

  // ========== CABINE HEXAGONAL ==========
  const cabineShape = new THREE.Shape();
  cabineShape.moveTo(-1.2, -0.5);
  cabineShape.lineTo(1.2, -0.5);
  cabineShape.lineTo(1.2, 1.5);
  cabineShape.lineTo(0.6, 2.2);
  cabineShape.lineTo(0, 2.5);
  cabineShape.lineTo(-0.6, 2.2);
  cabineShape.lineTo(-1.2, 1.5);
  cabineShape.lineTo(-1.2, -0.5);

  const cabineGeo = new THREE.ExtrudeGeometry(cabineShape, {
    depth: 1.0,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.2,
    bevelSegments: 1,
  });
  const cabineMat = new MaterialType({ 
    color: cores.cabine,
    shininess: usarPhong ? 50 : undefined  // Brilho EXTRA na cabine!
  });
  const cabine = new THREE.Mesh(cabineGeo, cabineMat);
  cabine.rotation.x = Math.PI / 2;
  cabine.position.set(0, 2, 0.3);
  cabine.castShadow = true;
  group.add(cabine);

  // ========== PROPULSOR ==========
  const coneGeo = new THREE.ConeGeometry(0.3, 1.5, 16);
  const coneMat = new MaterialType({ 
    color: 0x000000,
    shininess: usarPhong ? 30 : undefined
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(0, 2, -1.8);
  cone.castShadow = true;
  group.add(cone);

  const decagonoGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.6, 10);
  const decagonoMat = new MaterialType({ 
    color: cores.propulsor,
    shininess: usarPhong ? 30 : undefined
  });
  const decagono = new THREE.Mesh(decagonoGeo, decagonoMat);
  decagono.position.set(0, 2.5, -1.8);
  decagono.rotation.x = Math.PI / 2;
  decagono.castShadow = true;
  group.add(decagono);

  // ========== HÉLICES ==========
  const heliceGroup = new THREE.Group();
  heliceGroup.name = 'helice'; // Nome para encontrar depois
  
  for (let i = 0; i < 2; i++) {
    const paGeo = new THREE.BoxGeometry(0.08, 0.8, 0.15);
    const paMat = new MaterialType({ color: 0x2A2A2A });
    const pa = new THREE.Mesh(paGeo, paMat);
    pa.rotation.z = (Math.PI / 2) * i;
    pa.castShadow = true;
    heliceGroup.add(pa);
  }
  
  heliceGroup.position.set(0, 2.5, -2.1);
  heliceGroup.rotation.z = Math.PI / 2;
  group.add(heliceGroup);
}