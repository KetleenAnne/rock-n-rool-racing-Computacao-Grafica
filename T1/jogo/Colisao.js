import * as THREE from "three";

// ========== VERIFICAR COLISÃO COM MURETAS ==========
export function verificarColisao(posicaoVeiculo, muretas, raioVeiculo = 1.2) {
  // Verificar colisão com cada mureta
  for (let mureta of muretas) {
    if (!mureta || !mureta.mesh) continue;
    
    // Criar bounding box da mureta
    const bbox = new THREE.Box3().setFromObject(mureta.mesh);
    
    // Criar ponto de posição do veículo
    const pontoVeiculo = new THREE.Vector3(
      posicaoVeiculo.x, 
      posicaoVeiculo.y, 
      posicaoVeiculo.z
    );
    
    // Expandir bounding box pelo raio do veículo
    bbox.expandByScalar(raioVeiculo);
    
    // Verificar se o ponto do veículo está dentro da bbox expandida
    if (bbox.containsPoint(pontoVeiculo)) {
      // Calcular vetor normal de colisão
      const centro = new THREE.Vector3();
      bbox.getCenter(centro);
      
      const dx = posicaoVeiculo.x - centro.x;
      const dz = posicaoVeiculo.z - centro.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      // Retornar informações da colisão
      return {
        colidiu: true,
        mureta: mureta,
        normal: { 
          x: dist > 0 ? dx / dist : 0, 
          z: dist > 0 ? dz / dist : 0 
        },
        distancia: dist,
        centro: centro
      };
    }
  }
  
  // Nenhuma colisão detectada
  return { 
    colidiu: false,
    mureta: null,
    normal: null,
    distancia: 0
  };
}

// ========== RESOLVER COLISÃO (aplicar física de repulsão) ==========
export function resolverColisao(veiculo, colisao, velocidade) {
  if (!colisao.colidiu) return velocidade;
  
  // Aplicar força de repulsão baseada no normal da colisão
  const forcaRepulsao = 0.8;
  
  veiculo.group.position.x += colisao.normal.x * forcaRepulsao;
  veiculo.group.position.z += colisao.normal.z * forcaRepulsao;
  
  veiculo.position.copy(veiculo.group.position);
  
  // Reduzir velocidade ao colidir (efeito de impacto)
  return velocidade * 0.3;
}

// ========== VERIFICAR COLISÃO COM ZONA (linha de chegada, checkpoints, etc) ==========
export function verificarColisaoZona(posicaoVeiculo, zona, raioVeiculo = 1.2) {
  if (!zona || !zona.mesh) return false;
  
  const bbox = new THREE.Box3().setFromObject(zona.mesh);
  const pontoVeiculo = new THREE.Vector3(
    posicaoVeiculo.x, 
    posicaoVeiculo.y, 
    posicaoVeiculo.z
  );
  
  bbox.expandByScalar(raioVeiculo);
  
  return bbox.containsPoint(pontoVeiculo);
}

// ========== CRIAR ZONA DE DETECÇÃO INVISÍVEL ==========
export function criarZonaDeteccao(x, y, z, largura, altura, profundidade, nome = "zona", tipo = "geral") {
  const geometria = new THREE.BoxGeometry(largura, altura, profundidade);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00FF00,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  
  const zona = new THREE.Mesh(geometria, material);
  zona.position.set(x, y, z);
  zona.name = nome;
  zona.userData = {
    tipo: tipo,
    ativado: false,
    passagens: 0
  };
  
  return {
    mesh: zona,
    tipo: tipo,
    nome: nome
  };
}

// ========== DETECTAR COLISÃO ENTRE DOIS OBJETOS (veículo vs veículo) ==========
export function verificarColisaoEntreObjetos(objeto1, objeto2, raio1 = 1.2, raio2 = 1.2) {
  const pos1 = objeto1.position;
  const pos2 = objeto2.position;
  
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  const distancia = Math.sqrt(dx * dx + dz * dz);
  
  const raioTotal = raio1 + raio2;
  
  if (distancia < raioTotal) {
    return {
      colidiu: true,
      distancia: distancia,
      normal: {
        x: dx / distancia,
        z: dz / distancia
      }
    };
  }
  
  return { colidiu: false };
}

// ========== APLICAR EFEITO DE RICOCHETE (bounce) ==========
export function aplicarRicochete(veiculo, colisao, velocidadeAtual) {
  if (!colisao.colidiu) return;
  
  // Calcular ângulo de incidência
  const anguloVeiculo = veiculo.rotation.y;
  const anguloNormal = Math.atan2(colisao.normal.z, colisao.normal.x);
  
  // Refletir o ângulo
  const novoAngulo = 2 * anguloNormal - anguloVeiculo;
  
  // Aplicar nova rotação suavemente
  const fatorSuavizacao = 0.3;
  veiculo.group.rotation.y += (novoAngulo - anguloVeiculo) * fatorSuavizacao;
  veiculo.rotation.copy(veiculo.group.rotation);
  veiculo.quaternion.copy(veiculo.group.quaternion);
}