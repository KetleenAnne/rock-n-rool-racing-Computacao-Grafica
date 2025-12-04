import * as THREE from "three";
import { CSG } from '../../libs/other/CSGMesh.js'

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
const ESPESSURA_MURETA_HORIZONTAL = 0.1;
const ESPESSURA_MURETA_VERTICAL = 0.06;

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

// ========== GEOMETRIAS PARA 20x20 ==========
const muretaGeometry = new THREE.BoxGeometry(20, ALTURA_MURETA, ESPESSURA_MURETA_HORIZONTAL);
const muretaGeometryLateral = new THREE.BoxGeometry(ESPESSURA_MURETA_VERTICAL, ALTURA_MURETA, 20);

// ========== FUNÇÃO AUXILIAR: CRIAR MURETA HORIZONTAL ==========
function criarMuretaHorizontal(x, z, material) {
  const mureta = new THREE.Mesh(muretaGeometry, material);
  mureta.position.set(x, 0.1, z);
  mureta.castShadow = true;
  mureta.receiveShadow = true;
  
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
  mureta.castShadow = true;
  mureta.receiveShadow = true;
  
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
  for (let x = -90; x <= 90; x += 20) {
    let material;
    
    // Sul Exterior (z = 90): de -70 a 70
    if (x >= -70 && x <= 70) {
      material = ((x + 70) / 20) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
      const mureta = criarMuretaHorizontal(x, 90, material);
      scene.add(mureta.mesh);
      muretas.push(mureta);
    }
    
    // Sul Interior (z = 110): de -90 a 90
    material = ((x + 90) / 20) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
    const muretaSul = criarMuretaHorizontal(x, 110, material);
    scene.add(muretaSul.mesh);
    muretas.push(muretaSul);
    
    // Norte Interno (z = -90): de -70 a 70
    if (x >= -70 && x <= 70) {
      material = ((x + 50) / 20) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
      const muretaNorte = criarMuretaHorizontal(x, -90, material);
      scene.add(muretaNorte.mesh);
      muretas.push(muretaNorte);
    }
    
    // Norte Externo (z = -110): de -90 a 90
    material = ((x + 70) / 20) % 2 === 0 ? materialMuretaVermelha : materialMuretaBranca;
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
    const material = (z === 60 || z === 20 || z === -20 || z === -60 || z === -100) ? 
                   materialMuretaVermelha : materialMuretaBranca;
    const muretaExtEsq = criarMuretaVertical(-100, z, material);
    scene.add(muretaExtEsq.mesh);
    muretas.push(muretaExtEsq);
  }

  // Exterior Direita (x = 100)
  for (let z = -100; z <= 100; z += 20) {
    const material = (z === -80 || z === -40 || z === 40 || z === 80) ? 
                   materialMuretaVermelha : materialMuretaBranca;
    const muretaExtDir = criarMuretaVertical(100, z, material);
    scene.add(muretaExtDir.mesh);
    muretas.push(muretaExtDir);
  }

  // PONTAS (Cantos)
  const pontas = [
    {x: -100, z: -100, material: materialMuretaVermelha},
    {x: -80, z: -80, material: materialMuretaBranca},
    {x: 80, z: -80, material: materialMuretaVermelha},
    {x: 100, z: -100, material: materialMuretaBranca},
    {x: -100, z: 100, material: materialMuretaVermelha},
    {x: -80, z: 80, material: materialMuretaVermelha},
    {x: 80, z: 80, material: materialMuretaBranca},
    {x: 100, z: 100, material: materialMuretaBranca}
  ];

  for (let ponta of pontas) {
    const muretaPonta = criarMuretaVertical(ponta.x, ponta.z, ponta.material);
    scene.add(muretaPonta.mesh);
    muretas.push(muretaPonta);
  }

    // ========== TÚNEL Pista 1 (usando CSG) ==========
  try {
    const geometry = new THREE.CylinderGeometry(20, 20, 80, 16);
    const geometry2 = new THREE.CylinderGeometry(14, 14, 80, 16);

    const cylinder = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: "red"}));
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.set(-210, 10, 0);

    const cylinder2 = new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({color: "blue"}));
    cylinder2.rotation.x = Math.PI / 2;
    cylinder2.position.set(-210, 10, 0);

    const geometry3 = new THREE.SphereGeometry(10, 16, 8);
    const material3 = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const spheres = [
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3)
    ];

    spheres[0].position.set(-220, 20, -20);
    spheres[1].position.set(-200, 20, -20);
    spheres[2].position.set(-200, 20, 20);
    spheres[3].position.set(-220, 20, 20);

    cylinder.updateMatrix();
    cylinder2.updateMatrix();
    spheres.forEach(s => s.updateMatrix());

    geometry.applyMatrix4(cylinder.matrix);
    geometry2.applyMatrix4(cylinder2.matrix);

    const geoSpheres = spheres.map(s => {
      const g = s.geometry.clone();
      g.applyMatrix4(s.matrix);
      return new THREE.Mesh(g, s.material);
    });

    let cylinderCSG = CSG.fromMesh(new THREE.Mesh(geometry, cylinder.material));
    let cylinder2CSG = CSG.fromMesh(new THREE.Mesh(geometry2, cylinder2.material));

    let resultado = cylinderCSG.subtract(cylinder2CSG);
    geoSpheres.forEach(s => {
      resultado = resultado.subtract(CSG.fromMesh(s));
    });

    let csgFinal = CSG.toMesh(resultado, new THREE.Matrix4());
    csgFinal.material = new THREE.MeshPhongMaterial({ color: 'white' });
    csgFinal.position.set(300.4, -6, 0);
    scene.add(csgFinal);
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
    {x:10, mat:materialMuretaAzul}, {x:9, mat:materialMuretaBrancaPista2},
    {x:8, mat:materialMuretaAzul}, {x:7, mat:materialMuretaBrancaPista2},
    {x:6, mat:materialMuretaAzul}, {x:5, mat:materialMuretaBrancaPista2},
    {x:4, mat:materialMuretaAzul}, {x:3, mat:materialMuretaBrancaPista2}
  ];
  for (let m of muretasSulExt) {
    const mureta = criarMuretaHorizontal((m.x * 20) + offsetX, 30 + offsetZ, m.mat);
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
    const mureta = criarMuretaHorizontal((m.x * 20) + offsetX, (m.z * 20) + offsetZ, m.mat);
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
    const mureta = criarMuretaHorizontal((m.x * 20) + offsetX, (m.z * 20) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // NORTE L INTERNO - muretas horizontais
  const muretasNorteL = [
    {x:6, z:-2.5, mat:materialMuretaAzul}, {x:8, z:-2.5, mat:materialMuretaAzul},
    {x:7, z:-2.5, mat:materialMuretaBrancaPista2}, {x:9, z:-2.5, mat:materialMuretaBrancaPista2}
  ];
  for (let m of muretasNorteL) {
    const mureta = criarMuretaHorizontal((m.x * 20) + offsetX, (m.z * 20) + offsetZ, m.mat);
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
    const mureta = criarMuretaHorizontal((m.x * 20) + offsetX, (m.z * 20) + offsetZ, m.mat);
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
    const mureta = criarMuretaVertical(30 + offsetX, (m.z * 20) + offsetZ, m.mat);
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
    const mureta = criarMuretaVertical(110 + offsetX, (m.z * 20) + offsetZ, m.mat);
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
    const mureta = criarMuretaVertical(130 + offsetX, (m.z * 20) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

  // LATERAIS CURVA L INTERIOR (x=9.5)
  const lateraisLInt = [
    {z:-2, mat:materialMuretaAzul}, {z:0, mat:materialMuretaAzul},
    {z:-1, mat:materialMuretaBrancaPista2}
  ];
  for (let m of lateraisLInt) {
    const mureta = criarMuretaVertical(190 + offsetX, (m.z * 20) + offsetZ, m.mat);
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
    const mureta = criarMuretaVertical(210 + offsetX, (m.z * 20) + offsetZ, m.mat);
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
    const mureta = criarMuretaVertical(10 + offsetX, (m.z * 20) + offsetZ, m.mat);
    scene.add(mureta.mesh);
    muretas.push(mureta);
  }

    // ========== TÚNEL Pista 2 (usando CSG) ==========
  try {
    const geometry = new THREE.CylinderGeometry(20, 20, 80, 16);
    const geometry2 = new THREE.CylinderGeometry(14, 14, 80, 16);

    const cylinder = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: "red"}));
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.set(-210, 10, 0);

    const cylinder2 = new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({color: "blue"}));
    cylinder2.rotation.x = Math.PI / 2;
    cylinder2.position.set(-210, 10, 0);

    const geometry3 = new THREE.SphereGeometry(10, 16, 8);
    const material3 = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const spheres = [
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3)
    ];

    spheres[0].position.set(-220, 20, -20);
    spheres[1].position.set(-200, 20, -20);
    spheres[2].position.set(-200, 20, 20);
    spheres[3].position.set(-220, 20, 20);

    cylinder.updateMatrix();
    cylinder2.updateMatrix();
    spheres.forEach(s => s.updateMatrix());

    geometry.applyMatrix4(cylinder.matrix);
    geometry2.applyMatrix4(cylinder2.matrix);

    const geoSpheres = spheres.map(s => {
      const g = s.geometry.clone();
      g.applyMatrix4(s.matrix);
      return new THREE.Mesh(g, s.material);
    });

    let cylinderCSG = CSG.fromMesh(new THREE.Mesh(geometry, cylinder.material));
    let cylinder2CSG = CSG.fromMesh(new THREE.Mesh(geometry2, cylinder2.material));

    let resultado = cylinderCSG.subtract(cylinder2CSG);
    geoSpheres.forEach(s => {
      resultado = resultado.subtract(CSG.fromMesh(s));
    });

    let csgFinal = CSG.toMesh(resultado, new THREE.Matrix4());
    csgFinal.material = new THREE.MeshPhongMaterial({ color: 'white' });
    csgFinal.rotation.y = Math.PI / 2;
    csgFinal.position.set(20, -6, -140);
    scene.add(csgFinal);
  } catch (error) {
    console.warn("CSG não disponível, túnel não foi criado:", error);
  }

  return muretas;
}

// ========== MURETAS PISTA 3  ==========
export function criarMuretasPista3(scene) {
  const muretas = [];
  
  // Materiais
  const materialBloco = new THREE.MeshLambertMaterial({ color: 0xC8503C });
  const materialMuretaRoxa = new THREE.MeshLambertMaterial({ color: 0x4B0082, side: THREE.DoubleSide });
  const materialMuretaBrancaPista3 = new THREE.MeshLambertMaterial({ color: "white", side: THREE.DoubleSide });

  // Constantes de dimensões (certifique-se de que estão definidas no seu arquivo)
  const ALTURA_MURETA = 1.5;
  const ESPESSURA_MURETA_HORIZONTAL = 1;
  const ESPESSURA_MURETA_VERTICAL = 1;

  // Geometrias (blocos e muretas - escala 20x20)
  const cubeGeometry = new THREE.BoxGeometry(20, 0.1, 20);
  const muretaGeometry = new THREE.BoxGeometry(20, ALTURA_MURETA, ESPESSURA_MURETA_HORIZONTAL);
  const muretaGeometryLateral = new THREE.BoxGeometry(ESPESSURA_MURETA_VERTICAL, ALTURA_MURETA, 20);
  const muretaGeometryPonta = new THREE.BoxGeometry(ESPESSURA_MURETA_VERTICAL, ALTURA_MURETA, 22.5);

  const altura = 0.0;

  // ========== PRIMEIRO QUADRADO - BLOCOS BASE ==========
  for (let x = -90; x <= 90; x += 20) {
    // Sul
    const blocoSul = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoSul.position.set(x, altura, 100);
    blocoSul.receiveShadow = true;
    scene.add(blocoSul);
    
    // Norte
    const blocoNorte = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoNorte.position.set(x, altura, -100);
    blocoNorte.receiveShadow = true;
    scene.add(blocoNorte);
  }
  
  for (let z = -80; z <= 80; z += 20) {
    // Esquerda
    const blocoE = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoE.position.set(-90, altura, z);
    blocoE.receiveShadow = true;
    scene.add(blocoE);
    
    // Direita
    const blocoD = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoD.position.set(90, altura, z);
    blocoD.receiveShadow = true;
    scene.add(blocoD);
  }

  // ========== SEGUNDO QUADRADO - BLOCOS BASE ==========
  const offsetX = -180;
  const offsetZ = -200;

  for (let x = -90; x <= 90; x += 20) {
    // Sul
    const blocoSul = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoSul.position.set(x + offsetX, altura, 100 + offsetZ);
    blocoSul.receiveShadow = true;
    scene.add(blocoSul);
    
    // Norte
    const blocoNorte = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoNorte.position.set(x + offsetX, altura, -100 + offsetZ);
    blocoNorte.receiveShadow = true;
    scene.add(blocoNorte);
  }
  
  for (let z = -80; z <= 80; z += 20) {
    const blocoE = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoE.position.set(-90 + offsetX, altura, z + offsetZ);
    blocoE.receiveShadow = true;
    scene.add(blocoE);
    
    const blocoD = new THREE.Mesh(cubeGeometry, materialBloco);
    blocoD.position.set(90 + offsetX, altura, z + offsetZ);
    blocoD.receiveShadow = true;
    scene.add(blocoD);
  }

  // ========== MURETAS HORIZONTAIS PRIMEIRO QUADRADO ==========
  // Sul Interior (z=89)  //SR - Mudei de 89 para 90
  const muretasSulInt1 = [
    {x: 70, mat: materialMuretaRoxa}, {x: 50, mat: materialMuretaBrancaPista3},
    {x: 30, mat: materialMuretaRoxa}, {x: 10, mat: materialMuretaBrancaPista3},
    {x: -10, mat: materialMuretaRoxa}, {x: -30, mat: materialMuretaBrancaPista3},
    {x: -50, mat: materialMuretaRoxa}, {x: -70, mat: materialMuretaBrancaPista3}
  ];
  
  for (let m of muretasSulInt1) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, 90); //SR - Mudei de 89 para 90
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'horizontal', posicao: {x: m.x, z: 90}}); // SR - Mudei de 89 para 90
  }

  // Sul Exterior (z=111) //SR - Mudei de 111 para 110
  const muretasSulExt1 = [
    {x: 90, mat: materialMuretaBrancaPista3}, {x: 70, mat: materialMuretaRoxa},
    {x: 50, mat: materialMuretaBrancaPista3}, {x: 30, mat: materialMuretaRoxa},
    {x: 10, mat: materialMuretaBrancaPista3}, {x: -10, mat: materialMuretaRoxa},
    {x: -30, mat: materialMuretaBrancaPista3}, {x: -50, mat: materialMuretaRoxa},
    {x: -70, mat: materialMuretaBrancaPista3}, {x: -90, mat: materialMuretaRoxa}
  ];
  
  for (let m of muretasSulExt1) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, 110); //SR - Mudei de 111 para 110
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'horizontal', posicao: {x: m.x, z: 110}}); //SR - Mudei de 111 para 110
  }

  // Norte Interno (z=-89) //SR - Mudei de -89 para -90
  const muretasNorteInt1 = [
    {x: 70, mat: materialMuretaBrancaPista3}, {x: 50, mat: materialMuretaRoxa},
    {x: 30, mat: materialMuretaBrancaPista3}, {x: 10, mat: materialMuretaRoxa},
    {x: -10, mat: materialMuretaBrancaPista3}, {x: -30, mat: materialMuretaRoxa},
    {x: -50, mat: materialMuretaBrancaPista3}, {x: -70, mat: materialMuretaRoxa}
  ];
  
  for (let m of muretasNorteInt1) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -90); //SR - Mudei de -89 para -90
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'horizontal', posicao: {x: m.x, z: -90}}); //SR - Mudei de -89 para -90
  }

  // Norte Externo (z=-111) //SR - Mudei de -111 para -110
  const muretasNorteExt1 = [
    {x: 90, mat: materialMuretaRoxa}, {x: 70, mat: materialMuretaBrancaPista3},
    {x: 50, mat: materialMuretaRoxa}, {x: 30, mat: materialMuretaBrancaPista3},
    {x: 10, mat: materialMuretaRoxa}, {x: -10, mat: materialMuretaBrancaPista3},
    {x: -30, mat: materialMuretaRoxa}, {x: -50, mat: materialMuretaBrancaPista3},
    {x: -70, mat: materialMuretaRoxa}
  ];
  
  for (let m of muretasNorteExt1) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -110); //SR - Mudei de -111 para -110
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'horizontal', posicao: {x: m.x, z: -110}}); //SR - Mudei de -111 para -110
  }

  // ========== MURETAS HORIZONTAIS SEGUNDO QUADRADO ==========
  // Sul Exterior (z=-89) //SR - Mudei de -89 para -90
  const muretasSulExt2 = [
    {x: -110, mat: materialMuretaRoxa}, {x: -130, mat: materialMuretaBrancaPista3},
    {x: -150, mat: materialMuretaRoxa}, {x: -170, mat: materialMuretaBrancaPista3},
    {x: -190, mat: materialMuretaRoxa}, {x: -210, mat: materialMuretaBrancaPista3},
    {x: -230, mat: materialMuretaRoxa}, {x: -250, mat: materialMuretaBrancaPista3},
    {x: -270, mat: materialMuretaRoxa}
  ];
  
  for (let m of muretasSulExt2) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -90); //SR - Mudei de -89 para -90
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'horizontal', posicao: {x: m.x, z: -90}}); //SR - Mudei de -89 para -90
  }

  // Sul Interior (z=-110) ///SR - Mudei de -110 para -110.5
  const muretasSulInt2 = [
    {x: -110, mat: materialMuretaRoxa}, {x: -130, mat: materialMuretaBrancaPista3},
    {x: -150, mat: materialMuretaRoxa}, {x: -170, mat: materialMuretaBrancaPista3},
    {x: -190, mat: materialMuretaRoxa}, {x: -210, mat: materialMuretaBrancaPista3},
    {x: -230, mat: materialMuretaRoxa}, {x: -250, mat: materialMuretaBrancaPista3}
  ];
  
  for (let m of muretasSulInt2) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -110.5); //SR - Mudei de -110 para -110.5
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'horizontal', posicao: {x: m.x, z: -110.5}}); //SR - Mudei de -110 para -110.5
  }

  // Norte Externo (z=-311) //SR - Mudei de -311 para -310.5
  const muretasNorteExt2 = [
    {x: -90, mat: materialMuretaRoxa}, {x: -110, mat: materialMuretaBrancaPista3},
    {x: -130, mat: materialMuretaRoxa}, {x: -150, mat: materialMuretaBrancaPista3},
    {x: -170, mat: materialMuretaRoxa}, {x: -190, mat: materialMuretaBrancaPista3},
    {x: -210, mat: materialMuretaRoxa}, {x: -230, mat: materialMuretaBrancaPista3},
    {x: -250, mat: materialMuretaRoxa}, {x: -270, mat: materialMuretaBrancaPista3}
  ];
  
  for (let m of muretasNorteExt2) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -310.5); //SR - Mudei de -311 para -310.5
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'horizontal', posicao: {x: m.x, z: -310.5}});//SR - Mudei de -311 para -310.5
  }

  // Norte Interno (z=-289) //SR - Mudei de -289 para -289.5
  const muretasNorteInt2 = [
    {x: -130, mat: materialMuretaRoxa}, {x: -150, mat: materialMuretaBrancaPista3},
    {x: -170, mat: materialMuretaRoxa}, {x: -190, mat: materialMuretaBrancaPista3},
    {x: -210, mat: materialMuretaRoxa}, {x: -230, mat: materialMuretaBrancaPista3},
    {x: -250, mat: materialMuretaRoxa}, {x: -110, mat: materialMuretaBrancaPista3}
  ];
  
  for (let m of muretasNorteInt2) {
    const mureta = new THREE.Mesh(muretaGeometry, m.mat);
    mureta.position.set(m.x, 0.1, -289.5); //SR - Mudei de -289 para -289.5
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'horizontal', posicao: {x: m.x, z: -289.5}}); //SR - Mudei de -289 para -289.5
  }

  // ========== MURETAS LATERAIS PRIMEIRO QUADRADO ==========
  // Interior Esquerda (x=-79) //SR - Mudei de -79 para -80
  const lateraisEsqInt1 = [
    {z: -58, mat: materialMuretaRoxa}, {z: -38, mat: materialMuretaBrancaPista3},
    {z: -18, mat: materialMuretaRoxa}, {z: 2, mat: materialMuretaBrancaPista3},
    {z: 38, mat: materialMuretaRoxa}, {z: 58, mat: materialMuretaBrancaPista3}
  ];
  
  for (let m of lateraisEsqInt1) {
    const mureta = new THREE.Mesh(muretaGeometryLateral, m.mat);
    mureta.position.set(-79.5, 0.1, m.z); //SR - Mudei de -79 para -79.5
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'vertical', posicao: {x: -79.5, z: m.z}}); //SR - Mudei de -79 para -79.5
  }

  // Interior Direita (x=79) //SR - Mudei de 79 para 79.5
  const lateraisDirInt1 = [
    {z: -58, mat: materialMuretaBrancaPista3}, {z: -38, mat: materialMuretaRoxa},
    {z: -18, mat: materialMuretaBrancaPista3}, {z: 2, mat: materialMuretaBrancaPista3},
    {z: 22, mat: materialMuretaRoxa}, {z: 58, mat: materialMuretaBrancaPista3}
  ];
  
  for (let m of lateraisDirInt1) {
    const mureta = new THREE.Mesh(muretaGeometryLateral, m.mat);
    mureta.position.set(79.5, 0.1, m.z); //SR - Mudei de 79 para 79.5
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'vertical', posicao: {x: 79.5, z: m.z}}); //SR - Mudei de 79 para 79.5
  }

  // Exterior Direita (x=101) //SR - Mudei de 101 para 100.5
  const lateraisDirExt1 = [
    {z: -78, mat: materialMuretaRoxa}, {z: -58, mat: materialMuretaBrancaPista3},
    {z: -38, mat: materialMuretaRoxa}, {z: -18, mat: materialMuretaBrancaPista3},
    {z: 2, mat: materialMuretaRoxa}, {z: 22, mat: materialMuretaBrancaPista3},
    {z: 58, mat: materialMuretaBrancaPista3}, {z: 78, mat: materialMuretaRoxa}
  ];
  
  for (let m of lateraisDirExt1) {
    const mureta = new THREE.Mesh(muretaGeometryLateral, m.mat);
    mureta.position.set(100.5, 0.1, m.z); //SR - Mudei de 101 para 100.5
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'vertical', posicao: {x: 100.5, z: m.z}}); //SR - Mudei de 101 para 100.5
  }

  // Exterior Esquerda (x=-101) //SR - Mudei de -101 para -100.5
  const lateraisEsqExt1 = [
    {z: 78, mat: materialMuretaBrancaPista3}, {z: 22, mat: materialMuretaRoxa},
    {z: 2, mat: materialMuretaBrancaPista3}, {z: -18, mat: materialMuretaRoxa},
    {z: -38, mat: materialMuretaBrancaPista3}, {z: -58, mat: materialMuretaRoxa},
    {z: 42, mat: materialMuretaBrancaPista3} // Adicionei essa ultima
  ];
  
  for (let m of lateraisEsqExt1) {
    const mureta = new THREE.Mesh(muretaGeometryLateral, m.mat);
    mureta.position.set(-100.5, 0.1, m.z);//SR - Mudei de -101 para -100.5
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'vertical', posicao: {x: -100.5, z: m.z}});//SR - Mudei de -101 para -100.5
  }

  // ========== MURETAS LATERAIS SEGUNDO QUADRADO ==========
  const laterais2 = [
    // x=-79 //SR - Mudei de -79 para -79.5 LATERAL EXTERIOR ESQUERDO SEGUNDO
    {x: -79.5, z: -278, mat: materialMuretaRoxa}, {x: -79.5, z: -258, mat: materialMuretaBrancaPista3},
    {x: -79.5, z: -238, mat: materialMuretaRoxa}, {x: -79.5, z: -218, mat: materialMuretaBrancaPista3},
    {x: -79.5, z: -178, mat: materialMuretaRoxa}, {x: -79.5, z: -198, mat: materialMuretaBrancaPista3},
    {x: -79.5, z: -141, mat: materialMuretaRoxa},
    
    // x=-101 //SR - Mudei de -101 para -100.5 LATERAL INTERIOR ESQUERDO SEGUNDO
    {x: -100.5, z: -238, mat: materialMuretaRoxa}, {x: -100.5, z: -258, mat: materialMuretaBrancaPista3},
    {x: -100.5, z: -218, mat: materialMuretaBrancaPista3}, {x: -100.5, z: -198, mat: materialMuretaBrancaPista3},
    {x: -100.5, z: -178, mat: materialMuretaRoxa}, {x: -100.5, z: -141, mat: materialMuretaRoxa},
    
    // x=-259 //SR - Mudei de -259 para -259.5 LATERAL INTERIOR DIREITO SEGUNDO
    {x:-259.5, z: -258, mat: materialMuretaRoxa}, {x: -259.5, z: -238, mat: materialMuretaBrancaPista3},
    {x: -259.5, z: -218, mat: materialMuretaRoxa}, {x: -259.5, z: -198, mat: materialMuretaBrancaPista3},
    {x: -259.5, z: -178, mat: materialMuretaRoxa}, {x: -259.5, z: -158, mat: materialMuretaBrancaPista3},
    {x: -259.5, z: -138, mat: materialMuretaRoxa},
    
    // x=-281 //SR - Mudei de -281 para -280.5 LATERAL INTERIOR DIREITO SEGUNDO
    {x: -280.5, z: -262, mat: materialMuretaRoxa}, {x: -280.5, z: -242, mat: materialMuretaBrancaPista3},
    {x: -280.5, z: -222, mat: materialMuretaRoxa}, {x: -280.5, z: -202, mat: materialMuretaBrancaPista3},
    {x: -280.5, z: -182, mat: materialMuretaRoxa}, {x: -280.5, z: -162, mat: materialMuretaBrancaPista3},
    {x: -280.5, z: -142, mat: materialMuretaRoxa}, {x: -280.5, z: -122, mat: materialMuretaBrancaPista3}
  ];
  
  for (let m of laterais2) {
    const mureta = new THREE.Mesh(muretaGeometryLateral, m.mat);
    mureta.position.set(m.x, 0.1, m.z);
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'vertical', posicao: {x: m.x, z: m.z}});
  }

  // ========== PONTAS (CANTOS) ==========
  const pontas = [
    // Primeiro Quadrado
    {x: 100.5, z: -99.2, mat: materialMuretaBrancaPista3, geo: muretaGeometryPonta},   //Lateral Dir Exter Nort Primeiro (101,-100)
    {x: -100.5, z: 99.2, mat: materialMuretaRoxa, geo: muretaGeometryPonta},           //Lateral Esq Inter Sul Primeiro (-101,100)
    {x: 100.5, z: 99.2, mat: materialMuretaBrancaPista3, geo: muretaGeometryPonta},    //Lateral Dir Ext Sul Primeiro (101,100)
    
    
    // Segundo Quadrado
    {x: -280.5, z: -100.7, mat: materialMuretaRoxa, geo: muretaGeometryPonta},           //Lateral Esq Ext Sul (-281,-100)
    {x: -100.5, z: -121, mat: materialMuretaBrancaPista3, geo: muretaGeometryLateral},   //Lateral Dir Int Sul (-101,-121)
    {x: -79.5, z: -120.5, mat: materialMuretaBrancaPista3, geo: muretaGeometryLateral},  //Lateral Dir Ext Sul (-79,-122)
    {x: -280.5, z: -299.7, mat: materialMuretaRoxa, geo: muretaGeometryPonta},           //Lateral Esq Ext Nort (-281,-300)  
  ];

  // Pontas especiais (fechamento)
  const pontasEspeciais = [
    {x: -280.5, z: -280.2, mat: materialMuretaBrancaPista3, w: 16.48},    //Ponta Esq Ext Nort Segundo (-281,-280, w:16)
    {x: -79.5, z: -159.5, mat: materialMuretaBrancaPista3, w: 17},       //Ponta Dir Ext Sul Segundo (-79,-159.5, w:17)
    {x: -100.5, z: -159.5, mat: materialMuretaBrancaPista3, w: 17},     //Ponta Dir Int Sul Segundo (-101,-159.5, w:17)
    {x: -100.5, z: 60, mat: materialMuretaRoxa, w: 16},                //Lateral Esq Ext Sul Primeiro (-101,60, w:16)
    {x: 100.5, z: 40, mat: materialMuretaRoxa, w: 16},                 //Lateral Dir Ext Sul Primeiro (101,40, w:16)
    {x: -79.5, z: 20, mat: materialMuretaBrancaPista3, w: 16},         //Lateral Esq Int Sul Primeiro (-79,20, w:16)
    {x: 79.5, z: 40, mat: materialMuretaBrancaPista3, w: 16},          //Lateral Dir Int Sul Primeiro (79,40, w:16)
    {x: -100.5, z: -78.7, mat: materialMuretaBrancaPista3, w: 21.5},   //Ponta Nort Exter Primeiro (Criei nova)
    {x: 79.5, z: 78.7, mat: materialMuretaRoxa, w: 21.5},              //Lateral Dir Inter Sul Primeiro (79,78)
    {x: 79.5, z: -78.7, mat: materialMuretaRoxa, w: 21.5},             //Lateral Dir Inter Nort Primeiro (-79,-78)
    {x: -79.5, z: -78.7, mat: materialMuretaBrancaPista3, w: 21.5},    //Lateral Esq Inter Nort Primeiro (-79,-78)
    {x: -79.5, z: 78.7, mat: materialMuretaRoxa, w: 21.5},             //Lateral Esq Ext Sul Primeiro (-79,78)
    {x: -259.5, z: -278.5, mat: materialMuretaBrancaPista3, w: 21},   //Lateral Esq Int Nort (-259,-278)
    {x: -79.5, z: -299.5, mat: materialMuretaBrancaPista3, w: 23},       //Ponta Dir Ext Nort Segundo (-79.5,-300)
    {x: -100.5, z: -278.5, mat: materialMuretaRoxa, w: 21},              //Ponta Dir Int Nort (-101,-278)
    {x: -259.5, z: -120, mat: materialMuretaRoxa, w: 18},                //Lateral Esq Int Nort (-259,-121) Podemos trocar para branco
  ];

  for (let p of pontas) {
    const mureta = new THREE.Mesh(p.geo, p.mat);
    mureta.position.set(p.x, 0.1, p.z);
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'ponta', posicao: {x: p.x, z: p.z}});
  }

  for (let p of pontasEspeciais) {
    const geo = new THREE.BoxGeometry(ESPESSURA_MURETA_VERTICAL, ALTURA_MURETA, p.w);
    const mureta = new THREE.Mesh(geo, p.mat);
    mureta.position.set(p.x, 0.1, p.z);
    scene.add(mureta);
    muretas.push({mesh: mureta, tipo: 'ponta', posicao: {x: p.x, z: p.z}});
  }

  // ========== TÚNEL Pista 3 (usando CSG) ==========
  try {
    const geometry = new THREE.CylinderGeometry(20, 20, 80, 16);
    const geometry2 = new THREE.CylinderGeometry(14, 14, 80, 16);

    const cylinder = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: "red"}));
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.set(-210, 10, 0);

    const cylinder2 = new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({color: "blue"}));
    cylinder2.rotation.x = Math.PI / 2;
    cylinder2.position.set(-210, 10, 0);

    const geometry3 = new THREE.SphereGeometry(10, 16, 8);
    const material3 = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const spheres = [
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3),
      new THREE.Mesh(geometry3, material3)
    ];

    spheres[0].position.set(-220, 20, -20);
    spheres[1].position.set(-200, 20, -20);
    spheres[2].position.set(-200, 20, 20);
    spheres[3].position.set(-220, 20, 20);

    cylinder.updateMatrix();
    cylinder2.updateMatrix();
    spheres.forEach(s => s.updateMatrix());

    geometry.applyMatrix4(cylinder.matrix);
    geometry2.applyMatrix4(cylinder2.matrix);

    const geoSpheres = spheres.map(s => {
      const g = s.geometry.clone();
      g.applyMatrix4(s.matrix);
      return new THREE.Mesh(g, s.material);
    });

    let cylinderCSG = CSG.fromMesh(new THREE.Mesh(geometry, cylinder.material));
    let cylinder2CSG = CSG.fromMesh(new THREE.Mesh(geometry2, cylinder2.material));

    let resultado = cylinderCSG.subtract(cylinder2CSG);
    geoSpheres.forEach(s => {
      resultado = resultado.subtract(CSG.fromMesh(s));
    });

    let csgFinal = CSG.toMesh(resultado, new THREE.Matrix4());
    csgFinal.material = new THREE.MeshPhongMaterial({ color: 'white' });
    csgFinal.position.set(119.4, -6, 0);
    scene.add(csgFinal);
  } catch (error) {
    console.warn("CSG não disponível, túnel não foi criado:", error);
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
  const tamanhoQuadrado = 20 / numQuadrados;
  const quadradoGeometry = new THREE.BoxGeometry(tamanhoQuadrado, 0.01, tamanhoQuadrado);

  for (let i = 0; i < numQuadrados; i++) {
    for (let j = 0; j < numQuadrados; j++) {
      const material = ((i + j) % 2 === 0) ? materialQuadradoBranco : materialQuadradoPreto;
      const quadrado = new THREE.Mesh(quadradoGeometry, material);
      
      const posX = x - 10 + (i * tamanhoQuadrado) + (tamanhoQuadrado / 2);
      const posZ = z - 10 + (j * tamanhoQuadrado) + (tamanhoQuadrado / 2);
      
      quadrado.receiveShadow = true;
      quadrado.castShadow = true;
      
      quadrado.position.set(posX, 0.06, posZ);
      quadrado.name = "linhaChegadaQuadrado";
      group.add(quadrado);
    }
  }
  
  return group;
}
