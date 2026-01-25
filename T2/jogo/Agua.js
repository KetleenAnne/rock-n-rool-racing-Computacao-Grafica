import * as THREE from "three";

let aguasAtivas = [];

export function criarAguaPista2(group) {
  const materialAgua = new THREE.MeshPhongMaterial({
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.7,
    shininess: 100,
    side: THREE.DoubleSide,
  });

  // 64x32 segmentos para permitir a deformação da malha
  const aguaGeometry = new THREE.PlaneGeometry(67, 20, 64, 32);
  const agua = new THREE.Mesh(aguaGeometry, materialAgua);
  
  agua.position.set(-36, 0.25, -130); 
  agua.rotation.x = -Math.PI / 2;
  agua.receiveShadow = true;

  agua.userData = {
    offsetY: 0.5,
    impactoPonto: new THREE.Vector2(0, 0),
    forcaAtual: 0,
    alvoForca: 0
  };

  group.add(agua);
  aguasAtivas.push(agua);
  return agua;
}

export function atualizarAguas(time, carro) {
  aguasAtivas.forEach((agua) => {
    const posAttribute = agua.geometry.attributes.position;
    const localCarPos = new THREE.Vector3();

    if (carro) {
      agua.worldToLocal(localCarPos.copy(carro.position));
      const estaSobreAgua = Math.abs(localCarPos.x) < 33.5 && Math.abs(localCarPos.y) < 10;
      
      // Suaviza a entrada e saída da força da onda
      agua.userData.alvoForca = estaSobreAgua ? 0.6 : 0;
      agua.userData.forcaAtual = THREE.MathUtils.lerp(agua.userData.forcaAtual, agua.userData.alvoForca, 0.05);

      if (estaSobreAgua) {
        agua.userData.impactoPonto.set(localCarPos.x, localCarPos.y);
      }
    }

    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);
      const dist = Math.sqrt(Math.pow(x - agua.userData.impactoPonto.x, 2) + Math.pow(y - agua.userData.impactoPonto.y, 2));

      // Onda que se propaga do ponto de impacto
      const onda = Math.sin(dist * 0.4 - time * 4) * (1 / (dist + 1));
      const z = onda * agua.userData.forcaAtual;
      
      posAttribute.setZ(i, z + Math.sin(x * 0.1 + time) * 0.05);
    }
    posAttribute.needsUpdate = true;
  });
}

export function limparAguas() {
  aguasAtivas = [];
}

export function getAguas() {
  return aguasAtivas;
}