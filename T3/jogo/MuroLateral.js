import * as THREE from "three";

// ========== TEXTURAS ==========
const textureLoader = new THREE.TextureLoader();

// Pista 1: Parede
const texParede = textureLoader.load("assets/texturas/pista/wall.jpg");
texParede.colorSpace = THREE.SRGBColorSpace;
texParede.wrapS = texParede.wrapT = THREE.RepeatWrapping;
texParede.repeat.set(2, 4);

// Pista 2: Ipanema
const texIpanema = textureLoader.load("assets/texturas/objetos/ipanema.jpg");
texIpanema.colorSpace = THREE.SRGBColorSpace;
texIpanema.wrapS = texIpanema.wrapT = THREE.RepeatWrapping;
texIpanema.repeat.set(2, 4);

// Pista 3: Pedra
const texPedra = textureLoader.load("assets/texturas/pista/pedra.jpg");
texPedra.colorSpace = THREE.SRGBColorSpace;
texPedra.wrapS = texPedra.wrapT = THREE.RepeatWrapping;
texPedra.repeat.set(2, 4);

// ========== MATERIAIS DOS MUROS ==========
const matMuroP1 = new THREE.MeshLambertMaterial({
  color: 0x808080,
  map: texParede,
  side: THREE.DoubleSide,
});

const matMuroP2 = new THREE.MeshLambertMaterial({
  color: 0x808080,
  map: texIpanema,
  side: THREE.DoubleSide,
});

const matMuroP3 = new THREE.MeshLambertMaterial({
  color: 0x808080,
  map: texPedra,
  side: THREE.DoubleSide,
});

// ========== CONFIGURAÇÕES DE DIMENSÕES ==========
const ALTURA_MURETA = 1.5;
const POSICAO_Y_MURETA = 0.1;
const POSICAO_Y_CHAO = -20.1; // Posição do chão verde

// Altura do muro = distância da mureta até o chão
const ALTURA_MURO = POSICAO_Y_MURETA - POSICAO_Y_CHAO;
const POSICAO_Y_MURO = POSICAO_Y_CHAO + ALTURA_MURO / 2;

const ESPESSURA_MURO_HORIZONTAL = 0.3;
const ESPESSURA_MURO_VERTICAL = 0.1;

// ========== GEOMETRIAS DOS MUROS ==========
const muroGeometryHorizontal = new THREE.BoxGeometry(
  20,
  ALTURA_MURO,
  ESPESSURA_MURO_HORIZONTAL
);

const muroGeometryVertical = new THREE.BoxGeometry(
  ESPESSURA_MURO_VERTICAL,
  ALTURA_MURO,
  20
);

// ========== FUNÇÃO AUXILIAR: CRIAR MURO HORIZONTAL ==========
function criarMuroHorizontal(x, z, material) {
  const muro = new THREE.Mesh(muroGeometryHorizontal, material);
  muro.position.set(x, POSICAO_Y_MURO - 0.8, z);
  muro.castShadow = true;
  muro.receiveShadow = true;
  return muro;
}

// ========== FUNÇÃO AUXILIAR: CRIAR MURO VERTICAL ==========
function criarMuroVertical(x, z, material, altura = null) {
  let geometry = muroGeometryVertical;

  // Se altura customizada for fornecida, cria geometria específica
  if (altura !== null) {
    geometry = new THREE.BoxGeometry(
      ESPESSURA_MURO_VERTICAL,
      ALTURA_MURO,
      altura
    );
  }

  const muro = new THREE.Mesh(geometry, material);
  muro.position.set(x, POSICAO_Y_MURO - 0.8, z);
  muro.castShadow = true;
  muro.receiveShadow = true;
  return muro;
}

// ========== MUROS PISTA 1 (Usa matMuroP1) ==========
export function criarMurosPista1(scene) {
  const muros = [];
  const material = matMuroP1;

  // MUROS HORIZONTAIS (Norte e Sul)
  for (let x = -90; x <= 90; x += 20) {
    // Sul Exterior (z = 90): de -70 a 70
    if (x >= -70 && x <= 70) {
      const muro = criarMuroHorizontal(x, 90, material);
      scene.add(muro);
      muros.push(muro);
    }

    // Sul Interior (z = 110): de -90 a 90
    const muroSul = criarMuroHorizontal(x, 110, material);
    scene.add(muroSul);
    muros.push(muroSul);

    // Norte Interno (z = -90): de -70 a 70
    if (x >= -70 && x <= 70) {
      const muroNorte = criarMuroHorizontal(x, -90, material);
      scene.add(muroNorte);
      muros.push(muroNorte);
    }

    // Norte Externo (z = -110): de -90 a 90
    const muroNorteExt = criarMuroHorizontal(x, -110, material);
    scene.add(muroNorteExt);
    muros.push(muroNorteExt);
  }

  // MUROS VERTICAIS (Leste e Oeste)
  for (let z = -80; z <= 80; z += 20) {
    // Interior Esquerda (x = -80)
    const muroIntEsq = criarMuroVertical(-80, z, material);
    scene.add(muroIntEsq);
    muros.push(muroIntEsq);

    // Interior Direita (x = 80)
    if (z === -80 || z === 80) {
      continue; // não existe mureta nessas posições
    }
    const muroIntDir = criarMuroVertical(80, z, material);
    scene.add(muroIntDir);
    muros.push(muroIntDir);
  }

  // Exterior Esquerda (x = -100)
  for (let z = -100; z <= 100; z += 20) {
    const muroExtEsq = criarMuroVertical(-100, z, material);
    scene.add(muroExtEsq);
    muros.push(muroExtEsq);
  }

  // Exterior Direita (x = 100)
  for (let z = -100; z <= 100; z += 20) {
    const muroExtDir = criarMuroVertical(100, z, material);
    scene.add(muroExtDir);
    muros.push(muroExtDir);
  }

  // PONTAS (Cantos)
  const pontas = [
    { x: -100, z: -100 },
    { x: -80, z: -80 },
    { x: 80, z: -80 },
    { x: 100, z: -100 },
    { x: -100, z: 100 },
    { x: -80, z: 80 },
    { x: 80, z: 80 },
    { x: 100, z: 100 },
  ];

  for (let ponta of pontas) {
    const muroPonta = criarMuroVertical(ponta.x, ponta.z, material);
    scene.add(muroPonta);
    muros.push(muroPonta);
  }

  return muros;
}

// ========== MUROS PISTA 2 (Usa matMuroP2) ==========
export function criarMurosPista2(scene) {
  const muros = [];
  const offsetX = -110;
  const offsetZ = 50;
  const material = matMuroP2;

  // SUL EXTERIOR - muros horizontais
  const murosSulExt = [10, 9, 8, 7, 6, 5, 4, 3];
  for (let x of murosSulExt) {
    const muro = criarMuroHorizontal(x * 20 + offsetX, 30 + offsetZ, material);
    scene.add(muro);
    muros.push(muro);
  }

  // SUL INTERIOR - muros horizontais
  const murosSulInt = [
    { x: 2, z: 1.5 },
    { x: 1, z: 1.5 },
    { x: 2, z: 0.5 },
    { x: 3, z: 0.5 },
    { x: 4, z: 0.5 },
    { x: 5, z: 0.5 },
    { x: 6, z: 0.5 },
    { x: 7, z: 0.5 },
    { x: 8, z: 0.5 },
    { x: 9, z: 0.5 },
  ];
  for (let m of murosSulInt) {
    const muro = criarMuroHorizontal(
      m.x * 20 + offsetX,
      m.z * 20 + offsetZ,
      material
    );
    scene.add(muro);
    muros.push(muro);
  }

  // NORTE SUPERIOR - muros horizontais
  const murosNorteSup = [
    { x: 3, z: -8.5 },
    { x: 5, z: -8.5 },
    { x: 7, z: -3.5 },
    { x: 9, z: -3.5 },
    { x: 2, z: -8.5 },
    { x: 4, z: -8.5 },
  ];
  for (let m of murosNorteSup) {
    const muro = criarMuroHorizontal(
      m.x * 20 + offsetX,
      m.z * 20 + offsetZ,
      material
    );
    scene.add(muro);
    muros.push(muro);
  }

  // NORTE L INTERNO - muros horizontais
  const murosNorteL = [
    { x: 6, z: -2.5 },
    { x: 8, z: -2.5 },
    { x: 7, z: -2.5 },
    { x: 9, z: -2.5 },
  ];
  for (let m of murosNorteL) {
    const muro = criarMuroHorizontal(
      m.x * 20 + offsetX,
      m.z * 20 + offsetZ,
      material
    );
    scene.add(muro);
    muros.push(muro);
  }

  // NORTE EXTERNO - muros horizontais
  const murosNorteExt = [
    { x: 2, z: -9.5 },
    { x: 4, z: -9.5 },
    { x: 6, z: -9.5 },
    { x: 8, z: -3.5 },
    { x: 10, z: -3.5 },
    { x: 1, z: -9.5 },
    { x: 3, z: -9.5 },
    { x: 5, z: -9.5 },
  ];
  for (let m of murosNorteExt) {
    const muro = criarMuroHorizontal(
      m.x * 20 + offsetX,
      m.z * 20 + offsetZ,
      material
    );
    scene.add(muro);
    muros.push(muro);
  }

  // LATERAIS INTERIOR ESQUERDA (x=1.5)
  const lateraisEsqInt = [-1, -3, -5, -7, 0, -2, -4, -6, -8];
  for (let z of lateraisEsqInt) {
    const muro = criarMuroVertical(30 + offsetX, z * 20 + offsetZ, material);
    scene.add(muro);
    muros.push(muro);
  }

  // LATERAIS INTERIOR DIREITA (x=5.5)
  const lateraisDirInt = [-8, -6, -4, -7, -5, -3];
  for (let z of lateraisDirInt) {
    const muro = criarMuroVertical(110 + offsetX, z * 20 + offsetZ, material);
    scene.add(muro);
    muros.push(muro);
  }

  // LATERAIS EXTERIOR DIREITA (x=6.5)
  const lateraisDirExt = [-8, -6, -4, -9, -7, -5];
  for (let z of lateraisDirExt) {
    const muro = criarMuroVertical(130 + offsetX, z * 20 + offsetZ, material);
    scene.add(muro);
    muros.push(muro);
  }

  // LATERAIS CURVA L INTERIOR (x=9.5)
  const lateraisLInt = [-2, 0, -1];
  for (let z of lateraisLInt) {
    const muro = criarMuroVertical(190 + offsetX, z * 20 + offsetZ, material);
    scene.add(muro);
    muros.push(muro);
  }

  // LATERAIS CURVA L EXTERIOR (x=10.5)
  const lateraisLExt = [-2, 0, 1, -1, -3];
  for (let z of lateraisLExt) {
    const muro = criarMuroVertical(210 + offsetX, z * 20 + offsetZ, material);
    scene.add(muro);
    muros.push(muro);
  }

  // LATERAIS EXTERIOR ESQUERDA (x=0.5)
  const lateraisEsqExt = [1, -1, -3, -5, -7, -9, 0, -2, -4, -6, -8];
  for (let z of lateraisEsqExt) {
    const muro = criarMuroVertical(10 + offsetX, z * 20 + offsetZ, material);
    scene.add(muro);
    muros.push(muro);
  }

  return muros;
}

// ========== MUROS PISTA 3 (Usa matMuroP3) ==========
export function criarMurosPista3(scene) {
  const muros = [];
  const material = matMuroP3;

  // ========== MUROS HORIZONTAIS PRIMEIRO QUADRADO ==========
  // Sul Interior (z=50)
  const murosSulInt1 = [30, 10, -10, -30];
  for (let x of murosSulInt1) {
    const muro = criarMuroHorizontal(x, 50, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Sul Exterior (z=70)
  const murosSulExt1 = [50, 30, 10, -10, -30, -50];
  for (let x of murosSulExt1) {
    const muro = criarMuroHorizontal(x, 70, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Norte Interno (z=-50)
  const murosNorteInt1 = [30, 10, -30]; // Removido -10 (buraco)
  for (let x of murosNorteInt1) {
    const muro = criarMuroHorizontal(x, -49.5, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Norte Externo (z=-70)
  const murosNorteExt1 = [50, 30, 10, -30]; // Removido -10 (buraco)
  for (let x of murosNorteExt1) {
    const muro = criarMuroHorizontal(x, -70.5, material);
    scene.add(muro);
    muros.push(muro);
  }

  // ========== MUROS HORIZONTAIS SEGUNDO QUADRADO ==========
  // Sul Exterior (z=-60)
  const murosSulExt2 = [-70, -90, -110, -130, -150];
  for (let x of murosSulExt2) {
    const muro = criarMuroHorizontal(x, -50, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Sul Interior (z=-70)
  const murosSulInt2 = [-70, -90, -110, -130];
  for (let x of murosSulInt2) {
    const muro = criarMuroHorizontal(x, -70, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Norte Externo (z=-190.5)
  const murosNorteExt2 = [-50, -70, -90, -110, -130, -150];
  for (let x of murosNorteExt2) {
    const muro = criarMuroHorizontal(x, -190.5, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Norte Interno (z=-170)
  const murosNorteInt2 = [-70, -90, -110, -130];
  for (let x of murosNorteInt2) {
    const muro = criarMuroHorizontal(x, -170, material);
    scene.add(muro);
    muros.push(muro);
  }

  // ========== MUROS LATERAIS PRIMEIRO QUADRADO ==========
  // Interior Esquerda (x=-39.5)
  const lateraisEsqInt1 = [-30, -10, 10, 30];
  for (let z of lateraisEsqInt1) {
    const muro = criarMuroVertical(-39.5, z, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Interior Direita (x=40)
  const lateraisDirInt1 = [-30, -10, 10, 30];
  for (let z of lateraisDirInt1) {
    const muro = criarMuroVertical(39.5, z, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Exterior Direita (x=60.5)
  const lateraisDirExt1 = [-40, -20, 0, 20, 40];
  for (let z of lateraisDirExt1) {
    const muro = criarMuroVertical(60.5, z, material);
    scene.add(muro);
    muros.push(muro);
  }

  // Exterior Esquerda (x=-60.5)
  const lateraisEsqExt1 = [40, 20, 0, -20];
  for (let z of lateraisEsqExt1) {
    const muro = criarMuroVertical(-60.5, z, material);
    scene.add(muro);
    muros.push(muro);
  }

  // ========== MUROS LATERAIS SEGUNDO QUADRADO ==========
  const laterais2 = [
    // LATERAL EXTERIOR DIREITO SEGUNDO
    { x: -39.5, z: -160 },
    { x: -39.5, z: -140 },
    { x: -39.5, z: -120 },
    { x: -39.5, z: -100 },
    { x: -39.5, z: -80 },

    // LATERAL INTERIOR DIREITO SEGUNDO
    { x: -60.5, z: -140 },
    { x: -60.5, z: -120 },
    { x: -60.5, z: -100 },
    { x: -60.5, z: -80 },

    // LATERAL INTERIOR ESQUERDO SEGUNDO
    { x: -139.5, z: -140 },
    { x: -139.5, z: -120 },
    { x: -139.5, z: -100 },
    { x: -139.5, z: -80 },

    // LATERAL EXTERIOR ESQUERDO SEGUNDO
    { x: -160.5, z: -160 },
    { x: -160.5, z: -140 },
    { x: -160.5, z: -120 },
    { x: -160.5, z: -100 },
    { x: -160.5, z: -80 },
  ];

  for (let m of laterais2) {
    const muro = criarMuroVertical(m.x, m.z, material);
    scene.add(muro);
    muros.push(muro);
  }

  // ========== PONTAS ESPECIAIS (com alturas customizadas) ==========
  const pontasEspeciais = [
    { x: -160.5, z: -180.5, w: 21 },
    { x: -160.5, z: -59.75, w: 20.5 },
    { x: -139.5, z: -159.75, w: 19.5 },
    { x: -60.5, z: 60.25, w: 20.5 },
    { x: -60.5, z: -39.75, w: 19.5 },
    { x: 60.5, z: 60.25, w: 20.5 },
    { x: 60.5, z: -60.25, w: 20.5 },
    { x: -39.5, z: -180.5, w: 21 },
    { x: -60.5, z: -159.75, w: 19.5 },
    { x: -39.5, z: -44.5, w: 9 },
    { x: 39.5, z: -44.5, w: 9 },
    { x: 39.5, z: 44.75, w: 9.54 },
    { x: -39.5, z: 44.75, w: 9.54 },
  ];

  for (let p of pontasEspeciais) {
    const muro = criarMuroVertical(p.x, p.z, material, p.w);
    scene.add(muro);
    muros.push(muro);
  }

  return muros;
}
