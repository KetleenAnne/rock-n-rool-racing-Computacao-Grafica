// veiculos/modelos/Havac.js
import * as THREE from "three";

export function criarModeloHavac(group, cores, tipo) {
  // ========== MATERIAIS SEPARADOS ==========
  
  // LAMBERT - Materiais foscos (base, propulsor)
  const matBaseInferiorLambert = new THREE.MeshLambertMaterial({ 
    color: cores.baseInferior
  });
  
  const matPropulsorLambert = new THREE.MeshLambertMaterial({ 
    color: cores.propulsor
  });

  // PHONG - Materiais com brilho (FACILMENTE IDENTIFICÁVEIS!)
  const matBaseSuperiorPhong = new THREE.MeshPhongMaterial({ 
    color: cores.baseSuperior,
    shininess: 80,        // Brilho médio-alto
    specular: 0xaaaaaa    // Reflexo cinza
  });

  const matCabinePhong = new THREE.MeshPhongMaterial({ 
    color: cores.cabine,
    shininess: 100,       // Brilho ALTO - DESTACA!
    specular: 0xffffff    // Reflexo branco - MUITO VISÍVEL!
  });

  const matHelicePhong = new THREE.MeshPhongMaterial({
    color: tipo === "jogador" ? 0xFF6347 : 0x00BFFF, // Cor vibrante
    shininess: 120,       // Brilho MUITO ALTO
    specular: 0xffffff,   // Reflexo branco intenso
    emissive: tipo === "jogador" ? 0x331100 : 0x001133, // Leve emissão
    emissiveIntensity: 0.2
  });

  // ========== BASE OVAL INFERIOR (LAMBERT - FOSCO) ==========
  const baseInferiorGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32);
  const baseInferior = new THREE.Mesh(baseInferiorGeo, matBaseInferiorLambert);
  baseInferior.position.y = 0.4;
  baseInferior.scale.set(1, 1, 1.4);
  baseInferior.castShadow = true;
  group.add(baseInferior);

  // ========== BASE SUPERIOR (PHONG - BRILHO) ==========
  const baseSuperiorGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.4, 32);
  const baseSuperior = new THREE.Mesh(baseSuperiorGeo, matBaseSuperiorPhong);
  baseSuperior.position.y = 1.0;
  baseSuperior.scale.set(1, 1, 1.4);
  baseSuperior.castShadow = true;
  group.add(baseSuperior);

  // ========== CABINE HEXAGONAL (PHONG - BRILHO ALTO!) ==========
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
  const cabine = new THREE.Mesh(cabineGeo, matCabinePhong);
  cabine.rotation.x = Math.PI / 2;
  cabine.position.set(0, 2, 0.3);
  cabine.castShadow = true;
  group.add(cabine);

  // ========== PROPULSOR (LAMBERT - FOSCO) ==========
  
  // Cone do propulsor
  const coneGeo = new THREE.ConeGeometry(0.3, 1.5, 16);
  const coneMat = new THREE.MeshLambertMaterial({ 
    color: 0x000000
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(0, 2, -1.8);
  cone.castShadow = true;
  group.add(cone);

  // Base do propulsor
  const decagonoGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.6, 10);
  const decagono = new THREE.Mesh(decagonoGeo, matPropulsorLambert);
  decagono.position.set(0, 2.5, -1.8);
  decagono.rotation.x = Math.PI / 2;
  decagono.castShadow = true;
  group.add(decagono);

  // ========== HÉLICES (PHONG - BRILHO INTENSO!) ==========
  const heliceGroup = new THREE.Group();
  heliceGroup.name = 'helice'; // Nome para animação
  
  for (let i = 0; i < 2; i++) {
    const paGeo = new THREE.BoxGeometry(0.08, 0.8, 0.15);
    const pa = new THREE.Mesh(paGeo, matHelicePhong); // Hélice com brilho!
    pa.rotation.z = (Math.PI / 2) * i;
    pa.castShadow = true;
    heliceGroup.add(pa);
  }
  
  heliceGroup.position.set(0, 2.5, -2.1);
  heliceGroup.rotation.z = Math.PI / 2;
  group.add(heliceGroup);

  console.log(`✅ Havac criado (${tipo}) - Lambert (fosco) + Phong (brilho) aplicados`);
}