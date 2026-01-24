import * as THREE from "three";

let aguasAtivas = [];

// ========== CRIAR ÁGUA PISTA 2 ==========
export function criarAguaPista2(group) {
  // Material da água com transparência e cor azul
  const materialAgua = new THREE.MeshPhongMaterial({
    color: 0x1e90ff, // Azul água
    transparent: true,
    opacity: 0.7,
    shininess: 100,
    side: THREE.DoubleSide,
  });

  // Geometria da água - plano horizontal no topo da pista
  // TOPO tem 5 blocos (x=2,3,4,5,6) = 5 * 20 = 100 de largura
  const largura = 67; // 5 blocos de 20
  const profundidade = 20; // 1 bloco de profundidade
  const aguaGeometry = new THREE.PlaneGeometry(largura, profundidade);

  const agua = new THREE.Mesh(aguaGeometry, materialAgua);
  
  // Posicionamento no topo horizontal da pista 2
  // NORTE EXTERNO: x de 2 a 8 (6 blocos), z = -3.5
  // Centro X: (2+3+4+5+6+7+8)/7 * 20 + offsetX = 5*20 - 110 = -10
  // Z: -3.5 * 20 + offsetZ = -70 + 50 = -20
  agua.position.set(-36, 0.5, -130); 
  agua.rotation.x = -Math.PI / 2; // Horizontal
  agua.receiveShadow = true;

  // Dados para animação
  agua.userData.offsetY = 0.15; // Altura base
  agua.userData.amplitude = 0.1; // Amplitude da ondulação
  agua.userData.velocidade = 2; // Velocidade da animação

  group.add(agua);
  aguasAtivas.push(agua);

  console.log("💧 Água criada na Pista 2!");
  return agua;
}

// ========== ATUALIZAR ANIMAÇÃO DA ÁGUA ==========
export function atualizarAguas(time) {
  aguasAtivas.forEach((agua) => {
    if (agua && agua.userData) {
      // Animação de ondulação (subir e descer)
      agua.position.y = 
        agua.userData.offsetY + 
        Math.sin(time * agua.userData.velocidade) * agua.userData.amplitude;
      
      // Rotação leve para simular movimento de água
      agua.rotation.z = Math.sin(time * 0.5) * 0.005;
    }
  });
}

// ========== LIMPAR ÁGUAS ==========
export function limparAguas() {
  aguasAtivas = [];
  console.log("💧 Águas limpas!");
}

// ========== OBTER ÁGUAS ATIVAS ==========
export function getAguas() {
  return aguasAtivas;
}