import * as THREE from "three";
import { CSG } from "../../libs/other/CSGMesh.js";

// ========== TEXTURAS ==========
const textureLoader = new THREE.TextureLoader();

// Muretas (Concreto)
const texParede = textureLoader.load("assets/texturas/objetos/parede.jpg");
texParede.colorSpace = THREE.SRGBColorSpace;
texParede.wrapS = texParede.wrapT = THREE.RepeatWrapping;
texParede.repeat.set(10, 1); // Repete para não esticar

// Chão Pista 3 (Asfalto)
const texAsfalto = textureLoader.load("assets/texturas/pista/asfalto.jpg");
texAsfalto.colorSpace = THREE.SRGBColorSpace;
texAsfalto.wrapS = texAsfalto.wrapT = THREE.RepeatWrapping;
texAsfalto.repeat.set(1, 1);

// Túnel (Metal)
const texTunel = textureLoader.load("assets/texturas/objetos/tunel.jpg");
texTunel.colorSpace = THREE.SRGBColorSpace;
texTunel.wrapS = texTunel.wrapT = THREE.RepeatWrapping;
texTunel.repeat.set(2, 2);

// Largada (Quadriculada)
const texLargada = textureLoader.load("assets/texturas/objetos/largada.jpg");
texLargada.colorSpace = THREE.SRGBColorSpace;
texLargada.wrapS = texLargada.wrapT = THREE.RepeatWrapping;
// Ajuste a repetição se sua imagem for apenas 1 quadrado (ex: 8, 1)
texLargada.repeat.set(1, 1);

// ========== CONFIGURAÇÕES DE CORES ==========
const CORES_MURETAS_PISTA1 = {
  cor1: "red",
  cor2: "white",
};

const CORES_MURETAS_PISTA2 = {
  cor1: "blue",
  cor2: "white",
};

// ========== CONFIGURAÇÕES DE DIMENSÕES ==========
const ALTURA_MURETA = 1.5;
const ESPESSURA_MURETA_HORIZONTAL = 0.3;
const ESPESSURA_MURETA_VERTICAL = 0.1;

// ========== MATERIAIS PISTA 1 ==========
const materialMuretaVermelha = new THREE.MeshLambertMaterial({
  color: CORES_MURETAS_PISTA1.cor1,
  map: texParede, // Textura
  side: THREE.DoubleSide,
});

const materialMuretaBranca = new THREE.MeshLambertMaterial({
  color: CORES_MURETAS_PISTA1.cor2,
  map: texParede, // Textura
  side: THREE.DoubleSide,
});

// ========== MATERIAIS PISTA 2 ==========
const materialMuretaAzul = new THREE.MeshLambertMaterial({
  color: CORES_MURETAS_PISTA2.cor1,
  map: texParede, // Textura
  side: THREE.DoubleSide,
});

const materialMuretaBrancaPista2 = new THREE.MeshLambertMaterial({
  color: CORES_MURETAS_PISTA2.cor2,
  map: texParede, // Textura
  side: THREE.DoubleSide,
});

// ========== MATERIAIS EXTRAS  ==========
// Pista 3
const materialBloco = new THREE.MeshLambertMaterial({ map: texAsfalto });
const materialMuretaRoxa = new THREE.MeshLambertMaterial({
  color: 0x9370db, // Roxo mais claro para ver textura
  map: texParede,
  side: THREE.DoubleSide,
});
const materialMuretaBrancaPista3 = new THREE.MeshLambertMaterial({
  color: "white",
  map: texParede,
  side: THREE.DoubleSide,
});
// Túnel
const materialTunel = new THREE.MeshPhongMaterial({
  map: texTunel,
  side: THREE.DoubleSide,
});

// ========== GEOMETRIAS PARA 20x20 ==========
const muretaGeometry = new THREE.BoxGeometry(
  20,
  ALTURA_MURETA,
  ESPESSURA_MURETA_HORIZONTAL
);

// Cria geometria "deitada" (X=20) para textura alinhar corretamente
// Será rotacionada na função de criação
const muretaGeometryLateral = new THREE.BoxGeometry(
  20,
  ALTURA_MURETA,
  ESPESSURA_MURETA_VERTICAL
);

// Ponta também "deitada" para rotação
const muretaGeometryPonta = new THREE.BoxGeometry(
  9.54,
  ALTURA_MURETA,
  ESPESSURA_MURETA_VERTICAL
);

// Pista 3 chão
const cubeGeometry = new THREE.BoxGeometry(20, 0.1, 20);

// ========== FUNÇÃO AUXILIAR: CRIAR MURETA HORIZONTAL ==========
function criarMuretaHorizontal(x, z, material) {
  const mureta = new THREE.Mesh(muretaGeometry, material);
  mureta.position.set(x, 0.1, z);
  mureta.castShadow = true;
  mureta.receiveShadow = true;

  return {
    mesh: mureta,
    tipo: "horizontal",
    posicao: { x, z },
  };
}

// ========== FUNÇÃO AUXILIAR: CRIAR MURETA VERTICAL ==========
function criarMuretaVertical(x, z, material) {
  const mureta = new THREE.Mesh(muretaGeometryLateral, material);
  mureta.rotation.y = Math.PI / 2; // Rotação necessária pela nova geometria
  mureta.position.set(x, 0.1, z);
  mureta.castShadow = true;
  mureta.receiveShadow = true;

  return {
    mesh: mureta,
    tipo: "vertical",
    posicao: { x, z },
  };
}

// ========== FUNÇÃO AUXILIAR: TÚNEL (REUTILIZÁVEL) ==========
function criarTunel(scene, posX, posZ, rotateY) {
  const geometry = new THREE.CylinderGeometry(20, 20, 80, 16);
  const geometry2 = new THREE.CylinderGeometry(14, 14, 80, 16);
  const cylinder = new THREE.Mesh(geometry);
  cylinder.rotation.x = Math.PI / 2;
  cylinder.position.set(-210, 10, 0);
  const cylinder2 = new THREE.Mesh(geometry2);
  cylinder2.rotation.x = Math.PI / 2;
  cylinder2.position.set(-210, 10, 0);

  const geometry3 = new THREE.SphereGeometry(10, 16, 8);
  const spheres = [-20, 20]
    .map((z) =>
      [-220, -200].map((x) => {
        const s = new THREE.Mesh(geometry3);
        s.position.set(x, 20, z);
        return s;
      })
    )
    .flat();

  cylinder.updateMatrix();
  cylinder2.updateMatrix();
  spheres.forEach((s) => s.updateMatrix());
  geometry.applyMatrix4(cylinder.matrix);
  geometry2.applyMatrix4(cylinder2.matrix);

  let res = CSG.fromMesh(new THREE.Mesh(geometry));
  res = res.subtract(CSG.fromMesh(new THREE.Mesh(geometry2)));
  spheres.forEach((s) => {
    const g = s.geometry.clone();
    g.applyMatrix4(s.matrix);
    res = res.subtract(CSG.fromMesh(new THREE.Mesh(g)));
  });

  let csgFinal = CSG.toMesh(res, new THREE.Matrix4());
  csgFinal.material = materialTunel; // Aplica textura metal

  if (rotateY) csgFinal.rotation.y = Math.PI / 2;
  csgFinal.position.set(posX, -6, posZ);
  scene.add(csgFinal);
}

// ========== MURETAS PISTA 1 ==========
export function criarMuretasPista1(scene) {
  const muretas = [];

  // MURETAS HORIZONTAIS (Norte e Sul)
  for (let x = -90; x <= 90; x += 20) {
    let material;

    // Sul Exterior (z = 90): de -70 a 70
    if (x >= -70 && x <= 70) {
      material =
        ((x + 70) / 20) % 2 === 0
          ? materialMuretaVermelha
          : materialMuretaBranca;
      const mureta = criarMuretaHorizontal(x, 90, material);
      scene.add(mureta.mesh);
      muretas.push(mureta);
    }

    // Sul Interior (z = 110): de -90 a 90
    material =
      ((x + 90) / 20) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
    const muretaSul = criarMuretaHorizontal(x, 110, material);
    scene.add(muretaSul.mesh);
    muretas.push(muretaSul);

    // Norte Interno (z = -90): de -70 a 70
    if (x >= -70 && x <= 70) {
      material =
        ((x + 50) / 20) % 2 === 0
          ? materialMuretaVermelha
          : materialMuretaBranca;
      const muretaNorte = criarMuretaHorizontal(x, -90, material);
      scene.add(muretaNorte.mesh);
      muretas.push(muretaNorte);
    }

    // Norte Externo (z = -110): de -90 a 90
    material =
      ((x + 70) / 20) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
    const muretaNorteExt = criarMuretaHorizontal(x, -110, material);
    scene.add(muretaNorteExt.mesh);
    muretas.push(muretaNorteExt);
  }

  // MURETAS VERTICAIS (Leste e Oeste)
  for (let z = -80; z <= 80; z += 20) {
    let material;

    // Interior Esquerda (x = -80)
    if (z === -80 || z === -40 || z === 0 || z === 40) {
      material = materialMuretaVermelha;
    } else {
      material = materialMuretaBranca;
    }
    const muretaIntEsq = criarMuretaVertical(-80, z, material);
    scene.add(muretaIntEsq.mesh);
    muretas.push(muretaIntEsq);

    // Interior Direita (x = 80)
    if (z === -80 || z === 80) {
      continue; // não existe mureta nessas posições
    }
    if (z === -40 || z === 0 || z === 60) {
      material = materialMuretaVermelha;
    } else {
      material = materialMuretaBranca;
    }
    const muretaIntDir = criarMuretaVertical(80, z, material);
    scene.add(muretaIntDir.mesh);
    muretas.push(muretaIntDir);
  }

  // Exterior Esquerda (x = -100)
  for (let z = -100; z <= 100; z += 20) {
    const material =
      z === 60 || z === 20 || z === -20 || z === -60 || z === -100
        ? materialMuretaVermelha
        : materialMuretaBranca;
    const muretaExtEsq = criarMuretaVertical(-100, z, material);
    scene.add(muretaExtEsq.mesh);
    muretas.push(muretaExtEsq);
  }

  // Exterior Direita (x = 100)
  for (let z = -100; z <= 100; z += 20) {
    const material =
      z === -80 || z === -40 || z === 40 || z === 80
        ? materialMuretaVermelha
        : materialMuretaBranca;
    const muretaExtDir = criarMuretaVertical(100, z, material);
    scene.add(muretaExtDir.mesh);
    muretas.push(muretaExtDir);
  }

  // PONTAS (Cantos)
  const pontas = [
    { x: -100, z: -100, material: materialMuretaVermelha },
    { x: -80, z: -80, material: materialMuretaBranca },
    { x: 80, z: -80, material: materialMuretaVermelha },
    { x: 100, z: -100, material: materialMuretaBranca },
    { x: -100, z: 100, material: materialMuretaVermelha },
    { x: -80, z: 80, material: materialMuretaVermelha },
    { x: 80, z: 80, material: materialMuretaBranca },
    { x: 100, z: 100, material: materialMuretaBranca },
  ];

  for (let ponta of pontas) {
    const muretaPonta = criarMuretaVertical(ponta.x, ponta.z, ponta.material);
    scene.add(muretaPonta.mesh);
    muretas.push(muretaPonta);
  }

  // ========== TÚNEL Pista 1 (usando CSG) ==========
  try {
    criarTunel(scene, 300.4, 0, false);
  } catch (error) {
    console.warn("CSG não disponível, túnel não foi criado:", error);
  }

  return muretas;
}

// ========== MURETAS PISTA 2  ==========
export function criarMuretasPista2(scene) {
  const muretas = [];
  const offsetX = -110;
  const offsetZ = 50;

  // SUL EXTERIOR - muretas horizontais
  const muretasSulExt = [
    { x: 10, mat: materialMuretaAzul },
    { x: 9, mat: materialMuretaBrancaPista2 },
    { x: 8, mat: materialMuretaAzul },
    { x: 7, mat: materialMuretaBrancaPista2 },
    { x: 6, mat: materialMuretaAzul },
    { x: 5, mat: materialMuretaBrancaPista2 },
    { x: 4, mat: materialMuretaAzul },
    { x: 3, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of muretasSulExt) {
    const mureta = criarMuretaHorizontal(
      m.x * 20 + offsetX,
      30 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // SUL INTERIOR - muretas horizontais
  const muretasSulInt = [
    { x: 2, z: 1.5, mat: materialMuretaAzul },
    { x: 1, z: 1.5, mat: materialMuretaBrancaPista2 },
    { x: 2, z: 0.5, mat: materialMuretaAzul },
    { x: 3, z: 0.5, mat: materialMuretaBrancaPista2 },
    { x: 4, z: 0.5, mat: materialMuretaAzul },
    { x: 5, z: 0.5, mat: materialMuretaBrancaPista2 },
    { x: 6, z: 0.5, mat: materialMuretaAzul },
    { x: 7, z: 0.5, mat: materialMuretaBrancaPista2 },
    { x: 8, z: 0.5, mat: materialMuretaAzul },
    { x: 9, z: 0.5, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of muretasSulInt) {
    const mureta = criarMuretaHorizontal(
      m.x * 20 + offsetX,
      m.z * 20 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // NORTE SUPERIOR - muretas horizontais
  const muretasNorteSup = [
    { x: 3, z: -8.5, mat: materialMuretaBrancaPista2 },
    { x: 5, z: -8.5, mat: materialMuretaBrancaPista2 },
    { x: 7, z: -3.5, mat: materialMuretaBrancaPista2 },
    { x: 9, z: -3.5, mat: materialMuretaBrancaPista2 },
    { x: 2, z: -8.5, mat: materialMuretaAzul },
    { x: 4, z: -8.5, mat: materialMuretaAzul },
  ];
  for (let m of muretasNorteSup) {
    const mureta = criarMuretaHorizontal(
      m.x * 20 + offsetX,
      m.z * 20 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // NORTE L INTERNO - muretas horizontais
  const muretasNorteL = [
    { x: 6, z: -2.5, mat: materialMuretaAzul },
    { x: 8, z: -2.5, mat: materialMuretaAzul },
    { x: 7, z: -2.5, mat: materialMuretaBrancaPista2 },
    { x: 9, z: -2.5, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of muretasNorteL) {
    const mureta = criarMuretaHorizontal(
      m.x * 20 + offsetX,
      m.z * 20 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // NORTE EXTERNO - muretas horizontais
  const muretasNorteExt = [
    { x: 2, z: -9.5, mat: materialMuretaAzul },
    { x: 4, z: -9.5, mat: materialMuretaAzul },
    { x: 6, z: -9.5, mat: materialMuretaAzul },
    { x: 8, z: -3.5, mat: materialMuretaAzul },
    { x: 10, z: -3.5, mat: materialMuretaAzul },
    { x: 1, z: -9.5, mat: materialMuretaBrancaPista2 },
    { x: 3, z: -9.5, mat: materialMuretaBrancaPista2 },
    { x: 5, z: -9.5, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of muretasNorteExt) {
    const mureta = criarMuretaHorizontal(
      m.x * 20 + offsetX,
      m.z * 20 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS INTERIOR ESQUERDA (x=1.5)
  const lateraisEsqInt = [
    { z: -1, mat: materialMuretaAzul },
    { z: -3, mat: materialMuretaAzul },
    { z: -5, mat: materialMuretaAzul },
    { z: -7, mat: materialMuretaAzul },
    { z: 0, mat: materialMuretaBrancaPista2 },
    { z: -2, mat: materialMuretaBrancaPista2 },
    { z: -4, mat: materialMuretaBrancaPista2 },
    { z: -6, mat: materialMuretaBrancaPista2 },
    { z: -8, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of lateraisEsqInt) {
    const mureta = criarMuretaVertical(30 + offsetX, m.z * 20 + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS INTERIOR DIREITA (x=5.5)
  const lateraisDirInt = [
    { z: -8, mat: materialMuretaAzul },
    { z: -6, mat: materialMuretaAzul },
    { z: -4, mat: materialMuretaAzul },
    { z: -7, mat: materialMuretaBrancaPista2 },
    { z: -5, mat: materialMuretaBrancaPista2 },
    { z: -3, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of lateraisDirInt) {
    const mureta = criarMuretaVertical(
      110 + offsetX,
      m.z * 20 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS EXTERIOR DIREITA (x=6.5)
  const lateraisDirExt = [
    { z: -8, mat: materialMuretaAzul },
    { z: -6, mat: materialMuretaAzul },
    { z: -4, mat: materialMuretaAzul },
    { z: -9, mat: materialMuretaBrancaPista2 },
    { z: -7, mat: materialMuretaBrancaPista2 },
    { z: -5, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of lateraisDirExt) {
    const mureta = criarMuretaVertical(
      130 + offsetX,
      m.z * 20 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS CURVA L INTERIOR (x=9.5)
  const lateraisLInt = [
    { z: -2, mat: materialMuretaAzul },
    { z: 0, mat: materialMuretaAzul },
    { z: -1, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of lateraisLInt) {
    const mureta = criarMuretaVertical(
      190 + offsetX,
      m.z * 20 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS CURVA L EXTERIOR (x=10.5)
  const lateraisLExt = [
    { z: -2, mat: materialMuretaAzul },
    { z: 0, mat: materialMuretaAzul },
    { z: 1, mat: materialMuretaBrancaPista2 },
    { z: -1, mat: materialMuretaBrancaPista2 },
    { z: -3, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of lateraisLExt) {
    const mureta = criarMuretaVertical(
      210 + offsetX,
      m.z * 20 + offsetZ,
      m.mat
    );
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS EXTERIOR ESQUERDA (x=0.5)
  const lateraisEsqExt = [
    { z: 1, mat: materialMuretaAzul },
    { z: -1, mat: materialMuretaAzul },
    { z: -3, mat: materialMuretaAzul },
    { z: -5, mat: materialMuretaAzul },
    { z: -7, mat: materialMuretaAzul },
    { z: -9, mat: materialMuretaAzul },
    { z: 0, mat: materialMuretaBrancaPista2 },
    { z: -2, mat: materialMuretaBrancaPista2 },
    { z: -4, mat: materialMuretaBrancaPista2 },
    { z: -6, mat: materialMuretaBrancaPista2 },
    { z: -8, mat: materialMuretaBrancaPista2 },
  ];
  for (let m of lateraisEsqExt) {
    const mureta = criarMuretaVertical(10 + offsetX, m.z * 20 + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // ========== TÚNEL Pista 2 (usando CSG) ==========
  try {
    criarTunel(scene, 20, -140, true);
  } catch (error) {
    console.warn("CSG não disponível, túnel não foi criado:", error);
  }

  return muretas;
}

// ========== MURETAS PISTA 3  ==========
export function criarMuretasPista3(scene) {
  const muretas = [];

  // Materiais
  const ALTURA_MURETA = 1.5;
  const altura = 0.0;

  // ========== PRIMEIRO QUADRADO - BLOCOS BASE (5x5) ==========
  for (let x = -50; x <= 50; x += 20) {
    // Sul
    const blocoSul = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoSul.position.set(x, altura, 60);
    blocoSul.castShadow = true;
    blocoSul.receiveShadow = true;
    scene.add(blocoSul);

    // Norte
    const blocoNorte = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoNorte.position.set(x, altura, -60);
    blocoNorte.castShadow = true;
    blocoNorte.receiveShadow = true;
    scene.add(blocoNorte);
  }

  for (let z = -40; z <= 40; z += 20) {
    // Esquerda
    const blocoE = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoE.position.set(-50, altura, z);
    blocoE.castShadow = true;
    blocoE.receiveShadow = true;
    scene.add(blocoE);

    // Direita
    const blocoD = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoD.position.set(50, altura, z);
    blocoD.castShadow = true;
    blocoD.receiveShadow = true;
    scene.add(blocoD);
  }

  // ========== SEGUNDO QUADRADO - BLOCOS BASE (5x5) ==========
  const offsetX = -100;
  const offsetZ = -120;

  for (let x = -50; x <= 50; x += 20) {
    // Sul
    const blocoSul = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoSul.position.set(x + offsetX, altura, 60 + offsetZ);
    blocoSul.castShadow = true;
    blocoSul.receiveShadow = true;
    scene.add(blocoSul);

    // Norte
    const blocoNorte = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoNorte.position.set(x + offsetX, altura, -60 + offsetZ);
    blocoNorte.castShadow = true;
    blocoNorte.receiveShadow = true;
    scene.add(blocoNorte);
  }

  for (let z = -40; z <= 40; z += 20) {
    const blocoE = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoE.position.set(-50 + offsetX, altura, z + offsetZ);
    blocoE.castShadow = true;
    blocoE.receiveShadow = true;
    scene.add(blocoE);

    const blocoD = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoD.position.set(50 + offsetX, altura, z + offsetZ);
    blocoD.castShadow = true;
    blocoD.receiveShadow = true;
    scene.add(blocoD);
  }

  // ========== MURETAS HORIZONTAIS PRIMEIRO QUADRADO ==========
  // Sul Interior (z=50)
  const muretasSulInt1 = [
    { x: 30, mat: materialMuretaRoxa },
    { x: 10, mat: materialMuretaBrancaPista3 },
    { x: -10, mat: materialMuretaRoxa },
    { x: -30, mat: materialMuretaBrancaPista3 },
  ];

  for (let m of muretasSulInt1) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, 50);
    scene.add(mureta);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "horizontal",
      posicao: { x: m.x, z: 50 },
    });
  }

  // Sul Exterior (z=70)
  const muretasSulExt1 = [
    { x: 50, mat: materialMuretaBrancaPista3 },
    { x: 30, mat: materialMuretaRoxa },
    { x: 10, mat: materialMuretaBrancaPista3 },
    { x: -10, mat: materialMuretaRoxa },
    { x: -30, mat: materialMuretaBrancaPista3 },
    { x: -50, mat: materialMuretaRoxa },
  ];

  for (let m of muretasSulExt1) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, 70);
    scene.add(mureta);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "horizontal",
      posicao: { x: m.x, z: 70 },
    });
  }

  // Norte Interno (z=-50)
  const muretasNorteInt1 = [
    { x: 30, mat: materialMuretaBrancaPista3 },
    { x: 10, mat: materialMuretaRoxa },
    { x: -10, mat: materialMuretaBrancaPista3 },
    { x: -30, mat: materialMuretaRoxa },
  ];

  for (let m of muretasNorteInt1) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -50);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    scene.add(mureta);
    muretas.push({
      mesh: mureta,
      tipo: "horizontal",
      posicao: { x: m.x, z: -50 },
    });
  }

  // Norte Externo (z=-70)
  const muretasNorteExt1 = [
    { x: 50, mat: materialMuretaRoxa },
    { x: 30, mat: materialMuretaBrancaPista3 },
    { x: 10, mat: materialMuretaRoxa },
    { x: -10, mat: materialMuretaBrancaPista3 },
    { x: -30, mat: materialMuretaRoxa },
  ];

  for (let m of muretasNorteExt1) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -70);
    scene.add(mureta);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "horizontal",
      posicao: { x: m.x, z: -70 },
    });
  }

  // ========== MURETAS HORIZONTAIS SEGUNDO QUADRADO ==========
  // Sul Exterior (z=-60)
  const muretasSulExt2 = [
    { x: -70, mat: materialMuretaRoxa },
    { x: -90, mat: materialMuretaBrancaPista3 },
    { x: -110, mat: materialMuretaRoxa },
    { x: -130, mat: materialMuretaBrancaPista3 },
    { x: -150, mat: materialMuretaRoxa },
  ];

  for (let m of muretasSulExt2) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -50);
    scene.add(mureta);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "horizontal",
      posicao: { x: m.x, z: -50 },
    });
  }

  // Sul Interior (z=-70)
  const muretasSulInt2 = [
    { x: -70, mat: materialMuretaRoxa },
    { x: -90, mat: materialMuretaBrancaPista3 },
    { x: -110, mat: materialMuretaRoxa },
    { x: -130, mat: materialMuretaBrancaPista3 },
  ];

  for (let m of muretasSulInt2) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -70);
    scene.add(mureta);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "horizontal",
      posicao: { x: m.x, z: -70 },
    });
  }

  // Norte Externo (z=-190.5)
  const muretasNorteExt2 = [
    { x: -50, mat: materialMuretaBrancaPista3 },
    { x: -70, mat: materialMuretaRoxa },
    { x: -90, mat: materialMuretaBrancaPista3 },
    { x: -110, mat: materialMuretaRoxa },
    { x: -130, mat: materialMuretaBrancaPista3 },
    { x: -150, mat: materialMuretaRoxa },
  ];

  for (let m of muretasNorteExt2) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -190.5);
    scene.add(mureta);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "horizontal",
      posicao: { x: m.x, z: -190.5 },
    });
  }

  // Norte Interno (z=-170)
  const muretasNorteInt2 = [
    { x: -70, mat: materialMuretaBrancaPista3 },
    { x: -90, mat: materialMuretaRoxa },
    { x: -110, mat: materialMuretaBrancaPista3 },
    { x: -130, mat: materialMuretaRoxa },
  ];

  for (let m of muretasNorteInt2) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -170);
    scene.add(mureta);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "horizontal",
      posicao: { x: m.x, z: -170 },
    });
  }

  // ========== MURETAS LATERAIS PRIMEIRO QUADRADO ==========
  // Interior Esquerda (x=-39.5)
  const lateraisEsqInt1 = [
    { z: -30, mat: materialMuretaRoxa },
    { z: -10, mat: materialMuretaBrancaPista3 },
    { z: 10, mat: materialMuretaRoxa },
    { z: 30, mat: materialMuretaBrancaPista3 },
  ];

  for (let m of lateraisEsqInt1) {
    const mureta = criarMuretaVertical(-39.5, m.z, m.mat);
    scene.add(mureta.mesh);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "vertical",
      posicao: { x: -39.5, z: m.z },
    });
  }

  // Interior Direita (x=40)
  const lateraisDirInt1 = [
    { z: -30, mat: materialMuretaBrancaPista3 },
    { z: -10, mat: materialMuretaRoxa },
    { z: 10, mat: materialMuretaBrancaPista3 },
    { z: 30, mat: materialMuretaRoxa },
  ];

  for (let m of lateraisDirInt1) {
    const mureta = criarMuretaVertical(39.5, m.z, m.mat);
    scene.add(mureta.mesh);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "vertical",
      posicao: { x: 39.5, z: m.z },
    });
  }

  // Exterior Direita (x=60.5)
  const lateraisDirExt1 = [
    { z: -40, mat: materialMuretaRoxa },
    { z: -20, mat: materialMuretaBrancaPista3 },
    { z: 0, mat: materialMuretaRoxa },
    { z: 20, mat: materialMuretaBrancaPista3 },
    { z: 40, mat: materialMuretaRoxa },
  ];

  for (let m of lateraisDirExt1) {
    const mureta = criarMuretaVertical(60.5, m.z, m.mat);
    scene.add(mureta.mesh);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "vertical",
      posicao: { x: 60.5, z: m.z },
    });
  }

  // Exterior Esquerda (x=-60.5)
  const lateraisEsqExt1 = [
    { z: 40, mat: materialMuretaBrancaPista3 },
    { z: 20, mat: materialMuretaRoxa },
    { z: 0, mat: materialMuretaBrancaPista3 },
    { z: -20, mat: materialMuretaRoxa },
  ];

  for (let m of lateraisEsqExt1) {
    const mureta = criarMuretaVertical(-60.5, m.z, m.mat);
    scene.add(mureta.mesh);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "vertical",
      posicao: { x: -60.5, z: m.z },
    });
  }

  // ========== MURETAS LATERAIS SEGUNDO QUADRADO ==========
  const laterais2 = [
    // x=-39.5 LATERAL EXTERIOR DIREITO SEGUNDO (CONEXÃO)
    { x: -39.5, z: -160, mat: materialMuretaRoxa },
    { x: -39.5, z: -140, mat: materialMuretaBrancaPista3 },
    { x: -39.5, z: -120, mat: materialMuretaRoxa },
    { x: -39.5, z: -100, mat: materialMuretaBrancaPista3 },
    { x: -39.5, z: -80, mat: materialMuretaRoxa },

    // x=-60.5 LATERAL INTERIOR DIREITO SEGUNDO
    { x: -60.5, z: -140, mat: materialMuretaBrancaPista3 },
    { x: -60.5, z: -120, mat: materialMuretaRoxa },
    { x: -60.5, z: -100, mat: materialMuretaBrancaPista3 },
    { x: -60.5, z: -80, mat: materialMuretaRoxa },

    // x=-139.5 LATERAL INTERIOR ESQUERDO SEGUNDO
    { x: -139.5, z: -140, mat: materialMuretaRoxa },
    { x: -139.5, z: -120, mat: materialMuretaBrancaPista3 },
    { x: -139.5, z: -100, mat: materialMuretaRoxa },
    { x: -139.5, z: -80, mat: materialMuretaBrancaPista3 },

    // x=-160 LATERAL EXTERIOR ESQUERDO SEGUNDO
    { x: -160.5, z: -160, mat: materialMuretaRoxa },
    { x: -160.5, z: -140, mat: materialMuretaBrancaPista3 },
    { x: -160.5, z: -120, mat: materialMuretaRoxa },
    { x: -160.5, z: -100, mat: materialMuretaBrancaPista3 },
    { x: -160.5, z: -80, mat: materialMuretaRoxa },
  ];

  for (let m of laterais2) {
    const mureta = criarMuretaVertical(m.x, m.z, m.mat);
    scene.add(mureta.mesh);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    muretas.push({
      mesh: mureta,
      tipo: "vertical",
      posicao: { x: m.x, z: m.z },
    });
  }

  // ========== PONTAS (CANTOS) ==========
  const pontas = [
    // Primeiro Quadrado
    { x: 39.5, z: 44.75, mat: materialMuretaRoxa, geo: muretaGeometryPonta },
    { x: 39.5, z: -44.75, mat: materialMuretaRoxa, geo: muretaGeometryPonta },
    {
      x: -39.5,
      z: 44.75,
      mat: materialMuretaBrancaPista3,
      geo: muretaGeometryPonta,
    },

    // Segundo Quadrado
    {
      x: -39.5,
      z: -44.75,
      mat: materialMuretaBrancaPista3,
      geo: muretaGeometryPonta,
    },
  ];

  // Pontas especiais (fechamento) - ajustadas para 5x5
  const pontasEspeciais = [
    { x: -160.5, z: -180.5, mat: materialMuretaBrancaPista3, w: 21 },
    { x: -160.5, z: -59.75, mat: materialMuretaBrancaPista3, w: 20.5 },
    { x: -139.5, z: -159.75, mat: materialMuretaBrancaPista3, w: 19.5 },
    { x: -60.5, z: 60.25, mat: materialMuretaRoxa, w: 20.5 },
    { x: -60.5, z: -39.75, mat: materialMuretaBrancaPista3, w: 19.5 },
    { x: 60.5, z: 60.25, mat: materialMuretaBrancaPista3, w: 20.5 },
    { x: 60.5, z: -60.25, mat: materialMuretaBrancaPista3, w: 20.5 },
    { x: -39.5, z: -180.5, mat: materialMuretaBrancaPista3, w: 21 },
    { x: -60.5, z: -159.75, mat: materialMuretaRoxa, w: 19.5 },
  ];

  for (let p of pontas) {
    const mureta = new THREE.Mesh(muretaGeometryPonta, p.mat);
    mureta.rotation.y = Math.PI / 2; // Rotação para a geometria 'deitada'
    mureta.position.set(p.x, 0.1, p.z);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    scene.add(mureta);
    muretas.push({ mesh: mureta, tipo: "ponta", posicao: { x: p.x, z: p.z } });
  }

  for (let p of pontasEspeciais) {
    const geo = new THREE.BoxGeometry(
      p.w, // Geometria larga no X para textura alinhar
      ALTURA_MURETA,
      ESPESSURA_MURETA_VERTICAL
    );
    const mureta = new THREE.Mesh(geo, p.mat);
    mureta.rotation.y = Math.PI / 2; // Rotação
    mureta.position.set(p.x, 0.1, p.z);
    mureta.castShadow = true;
    mureta.receiveShadow = true;
    scene.add(mureta);
    muretas.push({ mesh: mureta, tipo: "ponta", posicao: { x: p.x, z: p.z } });
  }

  // ========== TÚNEL Pista 3 (usando CSG) ==========
  try {
    criarTunel(scene, 159.4, 0, false);
  } catch (error) {
    console.warn("CSG não disponível, túnel não foi criado:", error);
  }

  return muretas;
}

// ========== LINHA DE LARGADA (TEXTURIZADA) ==========
export function criarLinhaLargada(x, z) {
  const group = new THREE.Group();

  // Substituindo 64 blocos por um plano único texturizado
  const larguraTotal = 20;
  const geometriaLargada = new THREE.BoxGeometry(
    larguraTotal,
    0.02,
    larguraTotal
  );

  const materialLargada = new THREE.MeshLambertMaterial({
    map: texLargada,
    side: THREE.DoubleSide,
  });

  const largada = new THREE.Mesh(geometriaLargada, materialLargada);
  largada.receiveShadow = true;
  largada.position.set(x, 0.06, z);
  largada.name = "linhaChegadaQuadrado";

  group.add(largada);
  return group;
}
