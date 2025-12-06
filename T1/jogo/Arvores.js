import * as THREE from "three";

// ========== MATERIAIS ==========
const materialTroncoCone = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const materialFolhagemCone1 = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
const materialFolhagemCone2 = new THREE.MeshLambertMaterial({ color: 0x3a6b1f });
const materialFolhagemCone3 = new THREE.MeshLambertMaterial({ color: 0x4a8028 });

const materialTroncoEsfera = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const materialFolhagemEsfera = new THREE.MeshLambertMaterial({ 
  color: 0x32CD32,
  flatShading: true 
});

// ========== FUNÇÃO: CRIAR ÁRVORE TIPO CONE (PINHEIRO) ==========
function criarArvoreCone(x, z) {
  const tree = new THREE.Group();

  // Tronco (cilindro)
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
  const trunk = new THREE.Mesh(trunkGeometry, materialTroncoCone);
  trunk.position.y = 1;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // Folhagem - 3 cones empilhados
  const coneSizes = [
    { radiusBottom: 2.5, radiusTop: 0, height: 3, posY: 3.5, material: materialFolhagemCone1 },
    { radiusBottom: 2.0, radiusTop: 0, height: 2.5, posY: 5.5, material: materialFolhagemCone2 },
    { radiusBottom: 1.5, radiusTop: 0, height: 2, posY: 7, material: materialFolhagemCone3 }
  ];

  coneSizes.forEach((size) => {
    const coneGeometry = new THREE.ConeGeometry(
      size.radiusBottom,
      size.height,
      6
    );
    const cone = new THREE.Mesh(coneGeometry, size.material);
    cone.position.y = size.posY;
    cone.castShadow = true;
    cone.receiveShadow = true;
    tree.add(cone);
  });

  tree.position.set(x, 0, z);
  return tree;
}

// ========== FUNÇÃO: CRIAR ÁRVORE TIPO ESFERA (ARREDONDADA) ==========
function criarArvoreEsfera(x, z) {
  const tree = new THREE.Group();

  // Tronco (cilindro)
  const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.35, 2, 6);
  const trunk = new THREE.Mesh(trunkGeometry, materialTroncoEsfera);
  trunk.position.y = 1;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  // Folhagem - esfera única
  const sphereGeometry = new THREE.SphereGeometry(2, 8, 6);
  const sphere = new THREE.Mesh(sphereGeometry, materialFolhagemEsfera);
  sphere.position.y = 3.5;
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  tree.add(sphere);

  tree.position.set(x, 0, z);
  return tree;
}

// ========== POSIÇÕES DAS ÁRVORES PISTA 1 ==========
const POSICOES_ARVORES_PISTA1 = {
  // Árvores CONE - Ilha Externa (15 árvores)
  cones: [
    { x: -120, z: 100 }, // Arvore (-120/100)
    { x: -120, z: 60 },
    { x: -120, z: 20 },
    { x: -120, z: -20 },
    { x: -120, z: -60 },
    { x: -120, z: -100 },
    { x: 120, z: 100 },
    { x: 120, z: 60 },
    { x: 120, z: 20 },
    { x: 120, z: -20 },
    { x: 120, z: -60 },
    { x: 120, z: -100 },
    { x: 0, z: -130 },
    { x: -60, z: -130 },
    { x: 60, z: -130 }
  ],
  
  // Árvores ESFERA - Ilha Interna (15 árvores)
  esferas: [
    { x: -60, z: 80 }, 
    { x: -60, z: 40 },
    { x: -60, z: 0 },
    { x: -60, z: -40 },
    { x: -60, z: -80 }, 
    { x: 60, z: 80 },  
    { x: -10, z: 80 },  // Arvore esfera tunel (60/40) -> Dir Int Primeiro Quadrado 
    { x: 10, z: 80 },  // Arvore esfera Tunel(60/ 0) -> Dir Int Primeiro Quadrado
    { x: 60, z: -40 }, 
    { x: 60, z: -80 },  
    { x: -30, z: -70 },
    { x: 0, z: -70 },
    { x: 30, z: -70 },
    { x: -30, z: 80 },
    { x: 30, z: 80 }
  ]
};

// ========== POSIÇÕES DAS ÁRVORES PISTA 2 ==========
const POSICOES_ARVORES_PISTA2 = {
  // Árvores CONE - Ilha Externa (15 árvores) //(30/70) largada
  cones: [
    { x: 30, z: -70 },  //(-120,90)  
    { x: -120, z: 50 },
    { x: -120, z: 10 },
    { x: -120, z: -30 },
    { x: -120, z: -70 },
    { x: -120, z: -110 },  // Nort Ext Primeiro quadrado 
    { x: -70, z: -150 },  // Nort Ext Primeiro quadrado (-90/-11) 
    { x: -10, z: -150 },  // Nort Ext Primeiro quadrado (-90/-110) 
    { x: 40, z: -30 },   // Nort Ext Primeiro quadrado 
    { x: 70, z: -30 },   // Nort Ext Primeiro quadrado
    { x: 30, z: -120 },   // Nort Ext Primeiro quadrado(110,-30)
    { x: 110, z: 10 },  //(110,10)
    { x: 110, z: 50 },
    { x: 70, z: 90 },  // Nort Ext Primeiro quadrado(70,90)
    { x: -60, z: 90 }  //(30,90)
  ],  //(80,-40) colocar uma arvore nessa posição
   
  // Árvores ESFERA - Ilha Interna (15 árvores)
  esferas: [
    { x: -50, z: 50 },    // Sul Int Primeiro quadrado (-80/-90)
    { x: -70, z: 30 },    // Nort Int Primeiro quadrado (-80/-90)
    { x: -70, z: -10 },   // Nort Int Primeiro quadrado (-80/-90)
    { x: -70, z: -50 },   // Nort Int Primeiro quadrado (-80/-90) 
    { x: -70, z: -90 },   // Nort Int Primeiro quadrado (-80/-90) Primeira arvore
    { x: -45, z: -100 },  // Centro Nort do mapa(-45/-160)
    { x: -10, z: -100 },   // Centro Nort do mapa(-5/-160)
    { x: 10, z: 10 },     // Sul Int Primeiro quadrado (30/-160)
    { x: -10, z: -50 },   // Centro do mapa(70/-160)
    { x: -10, z: -10 },   // Centro do mapa(70/-120)
    { x: -10, z: -80 },    // Sul Int Primeiro quadrado (70/-80)
    { x: 70, z: 10 },     // Sul Int Primeiro quadrado (70/10)
    { x: 70, z: 50 },     // Sul Int Primeiro quadrado (70/50)
    { x: 40, z: 10 },     // Sul Int Primeiro quadrado (50/70)
    { x: 70, z: 30 }      // Sul Int Primeiro quadrado (10/70)
  ]
};

// ========== POSIÇÕES DAS ÁRVORES PISTA 3 ========== (0/100)
const POSICOES_ARVORES_PISTA3 = {
  // Árvores CONE - Distribuídas (15 árvores)
  cones: [
    // Primeiro quadrado - externo
    { x: -120, z: 100 },
    { x: -120, z: 50 },
    { x: -180, z: -320 },     //(-120,-50) 
    { x: -150, z: -80 },  //(-120,-50)
    { x: -110, z: -80 }, // (-120.-100)
    { x: 120, z: 100 },
    { x: 120, z: 50 },
    { x: 120, z: 0 },
    { x: 120, z: -50 },
    { x: 120, z: -100 },
    // Segundo quadrado - externo
    { x: -300, z: -120 },
    { x: -300, z: -180 },
    { x: -300, z: -240 },
    { x: -300, z: -280 },
    { x: -60, z: -120 }
  ],
  
  // Árvores ESFERA - Ilhas internas (15 árvores)
  esferas: [
    // Primeiro quadrado - interno
    { x: -60, z: 80 },
    { x: 20, z: 80 },      //(-60,40)
    { x: 0, z: -60 },       //(-60,0)
    { x: -20, z: 80 },      //(-60,0)
    { x: -60, z: -80 },
    { x: 60, z: 80 },
    { x: 60, z: 40 },
    { x: 60, z: 0 },  
    { x: 60, z: -40 },
    { x: 60, z: -80 },
    // Segundo quadrado - interno
    { x: -180, z: -110 },
    { x: -110, z: -200 },
    { x: -180, z: -200 },
    { x: -180, z: -260 },
    { x: -240, z: -180 }
  ]
};

// ========== CRIAR ÁRVORES PISTA 1 ==========
export function criarArvoresPista1(scene) {
  const arvores = [];

  // Adicionar árvores CONE
  POSICOES_ARVORES_PISTA1.cones.forEach(pos => {
    const arvore = criarArvoreCone(pos.x, pos.z);
    scene.add(arvore);
    arvores.push(arvore);
  });

  // Adicionar árvores ESFERA
  POSICOES_ARVORES_PISTA1.esferas.forEach(pos => {
    const arvore = criarArvoreEsfera(pos.x, pos.z);
    scene.add(arvore);
    arvores.push(arvore);
  });

  console.log(`Pista 1: ${arvores.length} árvores criadas (15 cones + 15 esferas)`);
  return arvores;
}

// ========== CRIAR ÁRVORES PISTA 2 ==========
export function criarArvoresPista2(scene) {
  const arvores = [];

  // Adicionar árvores CONE
  POSICOES_ARVORES_PISTA2.cones.forEach(pos => {
    const arvore = criarArvoreCone(pos.x, pos.z);
    scene.add(arvore);
    arvores.push(arvore);
  });

  // Adicionar árvores ESFERA
  POSICOES_ARVORES_PISTA2.esferas.forEach(pos => {
    const arvore = criarArvoreEsfera(pos.x, pos.z);
    scene.add(arvore);
    arvores.push(arvore);
  });

  console.log(`Pista 2: ${arvores.length} árvores criadas (15 cones + 15 esferas)`);
  return arvores;
}

// ========== CRIAR ÁRVORES PISTA 3 ==========
export function criarArvoresPista3(scene) {
  const arvores = [];

  // Adicionar árvores CONE
  POSICOES_ARVORES_PISTA3.cones.forEach(pos => {
    const arvore = criarArvoreCone(pos.x, pos.z);
    scene.add(arvore);
    arvores.push(arvore);
  });

  // Adicionar árvores ESFERA
  POSICOES_ARVORES_PISTA3.esferas.forEach(pos => {
    const arvore = criarArvoreEsfera(pos.x, pos.z);
    scene.add(arvore);
    arvores.push(arvore);
  });

  console.log(`Pista 3: ${arvores.length} árvores criadas (15 cones + 15 esferas)`);
  return arvores;
}