import * as THREE from "three";

// ========== CARREGAMENTO TEXTURAS ==========
const textureLoader = new THREE.TextureLoader();

const texMetal = textureLoader.load("assets/texturas/objetos/metal.jpg");
texMetal.colorSpace = THREE.SRGBColorSpace;
texMetal.wrapS = texMetal.wrapT = THREE.RepeatWrapping;
// Repetição padrão para o topo (planar) - Ajustado para ver melhor
texMetal.repeat.set(0.9, 0.9);

const texLateral = texMetal.clone();
texLateral.wrapS = texLateral.wrapT = THREE.RepeatWrapping;
texLateral.repeat.set(1, 1); // Lateral menos esticada

const texCabine = texMetal.clone();
texCabine.wrapS = texCabine.wrapT = THREE.RepeatWrapping;
texCabine.repeat.set(1, 1);

const texVidro = texMetal.clone();
texVidro.colorSpace = THREE.SRGBColorSpace;
texVidro.wrapS = texVidro.wrapT = THREE.RepeatWrapping;

const texMotor = texMetal.clone();
texMotor.colorSpace = THREE.SRGBColorSpace;

const texHelice = texMetal.clone();
texHelice.wrapS = texHelice.wrapT = THREE.RepeatWrapping;
texHelice.repeat.set(1, 1);

export function criarModeloHavac(group, cores, tipo) {
  // TOPO
  const matTopo = new THREE.MeshPhongMaterial({
    color: 0xdddddd,
    map: texMetal,
    emissive: cores.baseSuperior,
    emissiveIntensity: 0.3,
    shininess: 30,
    specular: 0x222222,
  });

  const matFundo = new THREE.MeshPhongMaterial({
    color: 0x888888,
    map: texMetal,
    emissive: cores.baseInferior,
    emissiveIntensity: 0.3,
  });

  const matLateralBase = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    map: texLateral,
    emissive: cores.baseInferior,
    emissiveIntensity: 0.4,
    shininess: 20,
    specular: 0x111111,
  });

  const matLateralSuperior = new THREE.MeshPhongMaterial({
    color: 0xdddddd,
    map: texLateral,
    emissive: cores.baseSuperior,
    emissiveIntensity: 0.3,
    shininess: 30,
    specular: 0x222222,
  });

  const matMotor = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: texMotor,
    shininess: 20,
    emissive: 0x333333,
  });

  const matCabine = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: texCabine,
    shininess: 80,
    specular: 0x999999,
    emissive: cores.cabine,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.9,
  });

  const matHelice = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    map: texHelice,
    shininess: 50,
    specular: 0x444444,
  });

  // ========== CONSTRUÇÃO (Geometria Reconstruída) ==========

  //  BASE INFERIOR
  const raioBase = 2.5;
  const alturaBase = 0.8;
  const yBase = 0.4;
  const baseLat = new THREE.Mesh(
    new THREE.CylinderGeometry(raioBase, raioBase, alturaBase, 32, 1, true),
    matLateralBase
  );
  baseLat.position.y = yBase;
  baseLat.scale.set(1, 1, 1.4);
  baseLat.castShadow = true;
  baseLat.receiveShadow = true;
  group.add(baseLat);

  const baseTampaGeo = new THREE.CircleGeometry(raioBase, 32);
  const baseTopo = new THREE.Mesh(baseTampaGeo, matFundo);
  baseTopo.rotation.x = -Math.PI / 2;
  baseTopo.position.y = yBase + alturaBase / 2;
  baseTopo.scale.set(1, 1.4, 1);
  baseTopo.castShadow = true;
  group.add(baseTopo);

  const baseFundo = new THREE.Mesh(baseTampaGeo, matFundo);
  baseFundo.rotation.x = Math.PI / 2;
  baseFundo.position.y = yBase - alturaBase / 2;
  baseFundo.scale.set(1, 1.4, 1);
  group.add(baseFundo);

  //  BASE SUPERIOR
  const raioSup = 2.2;
  const alturaSup = 0.4;
  const ySup = 1.0;
  const supLat = new THREE.Mesh(
    new THREE.CylinderGeometry(raioSup, 2.5, alturaSup, 32, 1, true),
    matLateralSuperior
  );
  supLat.position.y = ySup;
  supLat.scale.set(1, 1, 1.4);
  supLat.castShadow = true;
  supLat.receiveShadow = true;
  group.add(supLat);

  const supTampaGeo = new THREE.CircleGeometry(raioSup, 32);
  const supTopo = new THREE.Mesh(supTampaGeo, matTopo);
  supTopo.rotation.x = -Math.PI / 2;
  supTopo.position.y = ySup + alturaSup / 2;
  supTopo.scale.set(1, 1.4, 1);
  supTopo.castShadow = true;
  supTopo.receiveShadow = true;
  group.add(supTopo);

  //  CABINE (UV Planar)
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

  const uvCabine = cabineGeo.attributes.uv;
  const posCabine = cabineGeo.attributes.position;
  for (let i = 0; i < uvCabine.count; i++) {
    const x = posCabine.getX(i);
    const y = posCabine.getY(i);
    const z = posCabine.getZ(i);
    if (z > 0.9 || z < 0.1) {
      const u = x / 3 + 0.5;
      const v = y / 3 + 0.5;
      uvCabine.setXY(i, u, v);
    }
  }
  cabineGeo.attributes.uv.needsUpdate = true;

  const cabine = new THREE.Mesh(cabineGeo, matCabine);
  cabine.rotation.x = Math.PI / 2;
  cabine.position.set(0, 2, 0.3);
  cabine.castShadow = true;
  cabine.receiveShadow = true;
  group.add(cabine);

  //  HÉLICES E MOTOR
  const coneGeo = new THREE.ConeGeometry(0.3, 1.5, 16);
  const uvCone = coneGeo.attributes.uv;
  for (let i = 0; i < uvCone.count; i++) uvCone.setX(i, uvCone.getX(i) * 2);
  coneGeo.attributes.uv.needsUpdate = true;

  const cone = new THREE.Mesh(coneGeo, matMotor);
  cone.position.set(0, 2, -1.8);
  cone.castShadow = true;
  cone.receiveShadow = true;
  group.add(cone);

  const decagono = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.6, 10),
    matMotor
  );
  decagono.position.set(0, 2.5, -1.8);
  decagono.rotation.x = Math.PI / 2;
  group.add(decagono);

  const heliceGroup = new THREE.Group();
  heliceGroup.name = "helice";
  for (let i = 0; i < 2; i++) {
    const pa = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.8, 0.15),
      matHelice
    );
    pa.rotation.z = (Math.PI / 2) * i;
    heliceGroup.add(pa);
  }
  heliceGroup.position.set(0, 2.5, -2.1);
  heliceGroup.rotation.z = Math.PI / 2;
  group.add(heliceGroup);

  console.log(`✅ Havac Fosco (${tipo})`);
}
