import * as THREE from "three";

// ========== CONFIGURAÇÕES DE CORES ==========
const CORES_MURETAS_PISTA1 = {
  cor1: "red",      // Cor principal do padrão xadrez
  cor2: "white",    // Cor secundária do padrão xadrez
};

const CORES_MURETAS_PISTA2 = {
  cor1: "blue",     // Cor principal do padrão xadrez (MUDADO DE VERMELHO PARA AZUL)
  cor2: "white",    // Cor secundária do padrão xadrez
};

// ========== CONFIGURAÇÕES DE DIMENSÕES ==========
const ALTURA_MURETA = 0.5;
const ESPESSURA_MURETA_HORIZONTAL = 0.1;
const ESPESSURA_MURETA_VERTICAL = 0.05;

// ========== MATERIAIS PISTA 1 ==========
const materialMuretaVermelha = new THREE.MeshLambertMaterial({
  color: CORES_MURETAS_PISTA1.cor1,
  side: THREE.DoubleSide
});

const materialMuretaBranca = new THREE.MeshLambertMaterial({
  color: CORES_MURETAS_PISTA1.cor2,
  side: THREE.DoubleSide
});

// ========== MATERIAIS PISTA 2 ==========
const materialMuretaAzul = new THREE.MeshLambertMaterial({
  color: CORES_MURETAS_PISTA2.cor1,
  side: THREE.DoubleSide
});

const materialMuretaBrancaPista2 = new THREE.MeshLambertMaterial({
  color: CORES_MURETAS_PISTA2.cor2,
  side: THREE.DoubleSide
});

// ========== GEOMETRIAS PARA 10x10 ==========
const muretaGeometry = new THREE.BoxGeometry(10, ALTURA_MURETA, ESPESSURA_MURETA_HORIZONTAL);
const muretaGeometryLateral = new THREE.BoxGeometry(ESPESSURA_MURETA_VERTICAL, ALTURA_MURETA, 10);

// ========== FUNÇÃO AUXILIAR: CRIAR MURETA HORIZONTAL ==========
function criarMuretaHorizontal(x, z, material) {
  const mureta = new THREE.Mesh(muretaGeometry, material);
  mureta.position.set(x, 0.1, z);
  
  return {
    mesh: mureta,
    tipo: 'horizontal',
    posicao: { x, z }
  };
}

// ========== FUNÇÃO AUXILIAR: CRIAR MURETA VERTICAL ==========
function criarMuretaVertical(x, z, material) {
  const mureta = new THREE.Mesh(muretaGeometryLateral, material);
  mureta.position.set(x, 0.1, z);
  
  return {
    mesh: mureta,
    tipo: 'vertical',
    posicao: { x, z }
  };
}

// ========== MURETAS PISTA 1 ==========
export function criarMuretasPista1(scene) {
  const muretas = [];

  // MURETAS HORIZONTAIS (Norte e Sul)
  for (let x = -45; x <= 45; x += 10) {
    let material;
    
    // Sul Exterior (z = 45): de -35 a 35
    if (x >= -35 && x <= 35) {
      material = ((x + 35) / 10) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
      const mureta = criarMuretaHorizontal(x, 45, material);
      scene.add(mureta.mesh);
      muretas.push(mureta);
    }
    
    // Sul Interior (z = 55): de -45 a 45
    material = ((x + 45) / 10) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
    const muretaSul = criarMuretaHorizontal(x, 55, material);
    scene.add(muretaSul.mesh);
    muretas.push(muretaSul);
    
    // Norte Interno (z = -45): de -35 a 35
    if (x >= -35 && x <= 35) {
      material = ((x + 25) / 10) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
      const muretaNorte = criarMuretaHorizontal(x, -45, material);
      scene.add(muretaNorte.mesh);
      muretas.push(muretaNorte);
    }
    
    // Norte Externo (z = -55): de -45 a 45
    material = ((x + 35) / 10) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
    const muretaNorteExt = criarMuretaHorizontal(x, -55, material);
    scene.add(muretaNorteExt.mesh);
    muretas.push(muretaNorteExt);
  }

  // MURETAS VERTICAIS (Leste e Oeste)
  for (let z = -40; z <= 40; z += 10) {
    let material;
    
    // Interior Esquerda (x = -40)
    if (z === -40 || z === -20 || z === 0 || z === 20) {
      material = materialMuretaVermelha;
    } else {
      material = materialMuretaBranca;
    }
    const muretaIntEsq = criarMuretaVertical(-40, z, material);
    scene.add(muretaIntEsq.mesh);
    muretas.push(muretaIntEsq);
    
    // Interior Direita (x = 40)
    if (z === -40 || z === 40) {
      continue; // não existe mureta nessas posições
    }
    if (z === -20 || z === 0 || z === 30) {
      material = materialMuretaVermelha;
    } else {
      material = materialMuretaBranca;
    }
    const muretaIntDir = criarMuretaVertical(40, z, material);
    scene.add(muretaIntDir.mesh);
    muretas.push(muretaIntDir);
  }

  // Exterior Esquerda (x = -50)
  for (let z = -50; z <= 50; z += 10) {
    const material = (z === 30 || z === 10 || z === -10 || z === -30 || z === -50) ? 
                   materialMuretaVermelha : materialMuretaBranca;
    const muretaExtEsq = criarMuretaVertical(-50, z, material);
    scene.add(muretaExtEsq.mesh);
    muretas.push(muretaExtEsq);
  }

  // Exterior Direita (x = 50)
  for (let z = -50; z <= 50; z += 10) {
    const material = (z === -40 || z === -20 || z === 20 || z === 40) ? 
                   materialMuretaVermelha : materialMuretaBranca;
    const muretaExtDir = criarMuretaVertical(50, z, material);
    scene.add(muretaExtDir.mesh);
    muretas.push(muretaExtDir);
  }

  // PONTAS (Cantos)
  const pontas = [
    {x: -50, z: -50, material: materialMuretaVermelha},
    {x: -40, z: -40, material: materialMuretaBranca},
    {x: 40, z: -40, material: materialMuretaVermelha},
    {x: 50, z: -50, material: materialMuretaBranca},
    {x: -50, z: 50, material: materialMuretaVermelha},
    {x: -40, z: 40, material: materialMuretaVermelha},
    {x: 40, z: 40, material: materialMuretaBranca},
    {x: 50, z: 50, material: materialMuretaBranca}
  ];

  for (let ponta of pontas) {
    const muretaPonta = criarMuretaVertical(ponta.x, ponta.z, ponta.material);
    scene.add(muretaPonta.mesh);
    muretas.push(muretaPonta);
  }

  return muretas;
}

// ========== MURETAS PISTA 2  ==========
export function criarMuretasPista2(scene) {
  const muretas = [];
  const offsetX = -55;
  const offsetZ = 25;

  // SUL EXTERIOR - muretas horizontais
  const muretasSulExt = [
    {x:10, mat:materialMuretaAzul}, {x:9, mat:materialMuretaBrancaPista2},
    {x:8, mat:materialMuretaAzul}, {x:7, mat:materialMuretaBrancaPista2},
    {x:6, mat:materialMuretaAzul}, {x:5, mat:materialMuretaBrancaPista2},
    {x:4, mat:materialMuretaAzul}, {x:3, mat:materialMuretaBrancaPista2}
  ];
  for (let m of muretasSulExt) {
    const mureta = criarMuretaHorizontal((m.x * 10) + offsetX, 15 + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // SUL INTERIOR - muretas horizontais
  const muretasSulInt = [
    {x:2, z:1.5, mat:materialMuretaAzul}, {x:1, z:1.5, mat:materialMuretaBrancaPista2},
    {x:2, z:0.5, mat:materialMuretaAzul}, {x:3, z:0.5, mat:materialMuretaBrancaPista2},
    {x:4, z:0.5, mat:materialMuretaAzul}, {x:5, z:0.5, mat:materialMuretaBrancaPista2},
    {x:6, z:0.5, mat:materialMuretaAzul}, {x:7, z:0.5, mat:materialMuretaBrancaPista2},
    {x:8, z:0.5, mat:materialMuretaAzul}, {x:9, z:0.5, mat:materialMuretaBrancaPista2}
  ];
  for (let m of muretasSulInt) {
    const mureta = criarMuretaHorizontal((m.x * 10) + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // NORTE SUPERIOR - muretas horizontais
  const muretasNorteSup = [
    {x:3, z:-8.5, mat:materialMuretaBrancaPista2}, {x:5, z:-8.5, mat:materialMuretaBrancaPista2},
    {x:7, z:-3.5, mat:materialMuretaBrancaPista2}, {x:9, z:-3.5, mat:materialMuretaBrancaPista2},
    {x:2, z:-8.5, mat:materialMuretaAzul}, {x:4, z:-8.5, mat:materialMuretaAzul}
  ];
  for (let m of muretasNorteSup) {
    const mureta = criarMuretaHorizontal((m.x * 10) + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // NORTE L INTERNO - muretas horizontais
  const muretasNorteL = [
    {x:6, z:-2.5, mat:materialMuretaAzul}, {x:8, z:-2.5, mat:materialMuretaAzul},
    {x:7, z:-2.5, mat:materialMuretaBrancaPista2}, {x:9, z:-2.5, mat:materialMuretaBrancaPista2}
  ];
  for (let m of muretasNorteL) {
    const mureta = criarMuretaHorizontal((m.x * 10) + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // NORTE EXTERNO - muretas horizontais
  const muretasNorteExt = [
    {x:2, z:-9.5, mat:materialMuretaAzul}, {x:4, z:-9.5, mat:materialMuretaAzul},
    {x:6, z:-9.5, mat:materialMuretaAzul}, {x:8, z:-3.5, mat:materialMuretaAzul},
    {x:10, z:-3.5, mat:materialMuretaAzul}, {x:1, z:-9.5, mat:materialMuretaBrancaPista2},
    {x:3, z:-9.5, mat:materialMuretaBrancaPista2}, {x:5, z:-9.5, mat:materialMuretaBrancaPista2}
  ];
  for (let m of muretasNorteExt) {
    const mureta = criarMuretaHorizontal((m.x * 10) + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS INTERIOR ESQUERDA (x=1.5)
  const lateraisEsqInt = [
    {z:-1, mat:materialMuretaAzul}, {z:-3, mat:materialMuretaAzul},
    {z:-5, mat:materialMuretaAzul}, {z:-7, mat:materialMuretaAzul},
    {z:0, mat:materialMuretaBrancaPista2}, {z:-2, mat:materialMuretaBrancaPista2},
    {z:-4, mat:materialMuretaBrancaPista2}, {z:-6, mat:materialMuretaBrancaPista2},
    {z:-8, mat:materialMuretaBrancaPista2}
  ];
  for (let m of lateraisEsqInt) {
    const mureta = criarMuretaVertical(15 + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS INTERIOR DIREITA (x=5.5)
  const lateraisDirInt = [
    {z:-8, mat:materialMuretaAzul}, {z:-6, mat:materialMuretaAzul},
    {z:-4, mat:materialMuretaAzul}, {z:-7, mat:materialMuretaBrancaPista2},
    {z:-5, mat:materialMuretaBrancaPista2}, {z:-3, mat:materialMuretaBrancaPista2}
  ];
  for (let m of lateraisDirInt) {
    const mureta = criarMuretaVertical(55 + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS EXTERIOR DIREITA (x=6.5)
  const lateraisDirExt = [
    {z:-8, mat:materialMuretaAzul}, {z:-6, mat:materialMuretaAzul},
    {z:-4, mat:materialMuretaAzul}, {z:-9, mat:materialMuretaBrancaPista2},
    {z:-7, mat:materialMuretaBrancaPista2}, {z:-5, mat:materialMuretaBrancaPista2}
  ];
  for (let m of lateraisDirExt) {
    const mureta = criarMuretaVertical(65 + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS CURVA L INTERIOR (x=9.5)
  const lateraisLInt = [
    {z:-2, mat:materialMuretaAzul}, {z:0, mat:materialMuretaAzul},
    {z:-1, mat:materialMuretaBrancaPista2}
  ];
  for (let m of lateraisLInt) {
    const mureta = criarMuretaVertical(95 + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS CURVA L EXTERIOR (x=10.5)
  const lateraisLExt = [
    {z:-2, mat:materialMuretaAzul}, {z:0, mat:materialMuretaAzul},
    {z:1, mat:materialMuretaBrancaPista2}, {z:-1, mat:materialMuretaBrancaPista2},
    {z:-3, mat:materialMuretaBrancaPista2}
  ];
  for (let m of lateraisLExt) {
    const mureta = criarMuretaVertical(105 + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS EXTERIOR ESQUERDA (x=0.5)
  const lateraisEsqExt = [
    {z:1, mat:materialMuretaAzul}, {z:-1, mat:materialMuretaAzul},
    {z:-3, mat:materialMuretaAzul}, {z:-5, mat:materialMuretaAzul},
    {z:-7, mat:materialMuretaAzul}, {z:-9, mat:materialMuretaAzul},
    {z:0, mat:materialMuretaBrancaPista2}, {z:-2, mat:materialMuretaBrancaPista2},
    {z:-4, mat:materialMuretaBrancaPista2}, {z:-6, mat:materialMuretaBrancaPista2},
    {z:-8, mat:materialMuretaBrancaPista2}
  ];
  for (let m of lateraisEsqExt) {
    const mureta = criarMuretaVertical(5 + offsetX, (m.z * 10) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  return muretas;
}

// ========== LINHA DE LARGADA ==========
export function criarLinhaLargada(x, z) {
  const group = new THREE.Group();
  
  const materialQuadradoBranco = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
  });

  const materialQuadradoPreto = new THREE.MeshLambertMaterial({
    color: 0x000000,
    side: THREE.DoubleSide
  });

  const numQuadrados = 8;
  const tamanhoQuadrado = 10 / numQuadrados;
  const quadradoGeometry = new THREE.BoxGeometry(tamanhoQuadrado, 0.01, tamanhoQuadrado);

  for (let i = 0; i < numQuadrados; i++) {
    for (let j = 0; j < numQuadrados; j++) {
      const material = ((i + j) % 2 === 0) ? materialQuadradoBranco : materialQuadradoPreto;
      const quadrado = new THREE.Mesh(quadradoGeometry, material);
      
      const posX = x - 5 + (i * tamanhoQuadrado) + (tamanhoQuadrado / 2);
      const posZ = z - 5 + (j * tamanhoQuadrado) + (tamanhoQuadrado / 2);
      
      quadrado.position.set(posX, 0.06, posZ);
      quadrado.name = "linhaChegadaQuadrado";
      group.add(quadrado);
    }
  }
  
  return group;
}