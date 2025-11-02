import * as THREE from "three";

export function verificarColisao(posicaoVeiculo, muretas, raioVeiculo = 1.2) {
  // Verificar colisão com cada mureta
  for (let mureta of muretas) {
    if (!mureta || !mureta.mesh) continue;

    const bbox = new THREE.Box3().setFromObject(mureta.mesh);
    const pontoVeiculo = new THREE.Vector3(
      posicaoVeiculo.x,
      posicaoVeiculo.y,
      posicaoVeiculo.z
    );
    // Encontra o ponto mais próximo dentro da caixa ao veículo
    const pontoMaisProximo = new THREE.Vector3();
    bbox.clampPoint(pontoVeiculo, pontoMaisProximo); // Calcula a distância do veículo até esse ponto

    const distancia = pontoVeiculo.distanceTo(pontoMaisProximo); //se a distância é menor que o raio do veículo

    if (distancia < raioVeiculo) {
      //COLIDIU
      const normal = new THREE.Vector3();

      if (mureta.tipo === "horizontal") {
        // Se o carro está "acima" da mureta, o normal aponta para "baixo" (-1)
        normal.z = posicaoVeiculo.z > mureta.posicao.z ? 1.0 : -1.0;
        normal.x = 0; // Garantir que é só Z
      } else if (mureta.tipo === "vertical") {
        // Mureta vertical. O normal é puramente em X.
        normal.x = posicaoVeiculo.x > mureta.posicao.x ? 1.0 : -1.0;
        normal.z = 0; // Garantir que é só X
      } else {
        // se não tiver tipo, usa a distância, mas pode ser menos preciso
        normal.subVectors(pontoVeiculo, pontoMaisProximo).normalize();
      }

      return {
        colidiu: true,
        mureta: mureta,
        normal: normal, // normal preciso
        distanciaPenetracao: raioVeiculo - distancia,
      };
    }
  }

  return { colidiu: false }; // Nenhuma colisão
}

export function resolverColisaoDeslizante(veiculo, colisao, state) {
  if (!colisao.colidiu) return state.velocidade; // Empurra o veículo para fora da mureta, direção do normal //  distanciaPenetracao, diz o quanto "entramos" na parede // pequeno buffer (0.01) para garantir que saia

  const forcaRepulsao = colisao.distanciaPenetracao + 0.01;
  veiculo.group.position.x += colisao.normal.x * forcaRepulsao;
  veiculo.group.position.z += colisao.normal.z * forcaRepulsao;
  veiculo.position.copy(veiculo.group.position);

  if (state.velocidade === 0) return 0; // Vetor para frente do veículo

  const vFrente = new THREE.Vector3(0, 0, 1);
  vFrente.applyQuaternion(veiculo.quaternion); // Pega a rotação atual do carro
  vFrente.normalize(); // O normal da mureta já vem de colisao.normal

  const vNormal = colisao.normal; // Calcula cos o ângulo entre frente e normal

  const dot = vFrente.dot(vNormal); // Se o ângulo for igual ou menor a 90°, não haverá retardo // se dot >= 0, não há retardo.

  if (dot >= 0) {
    // se afastando da parede ou andando paralelos.
    // aplica um leve atrito de "raspão"
    return state.velocidade * 0.98;
  } // Se dot < 0, estamos indo CONTRA a parede // dot vai de 0 (90°) a -1 (180°, batida de frente) // fator de redução de 0 (a 90°) a 1 (a 180°)

  const fatorReducao = Math.abs(dot); // (1.0 - fatorReducao) é a velocidade que "sobra"

  const atritoParede = 0.8; // Um fator de atrito extra
  let novaVelocidade = state.velocidade * (1.0 - fatorReducao) * atritoParede; // Retornamos a nova velocidade calculada

  return novaVelocidade;
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
export function criarZonaDeteccao(
  x,
  y,
  z,
  largura,
  altura,
  profundidade,
  nome = "zona",
  tipo = "geral"
) {
  const geometria = new THREE.BoxGeometry(largura, altura, profundidade);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
  });

  const zona = new THREE.Mesh(geometria, material);
  zona.position.set(x, y, z);
  zona.name = nome;
  zona.userData = {
    tipo: tipo,
    ativado: false,
    passagens: 0,
  };

  return {
    mesh: zona,
    tipo: tipo,
    nome: nome,
  };
}

// ========== DETECTAR COLISÃO ENTRE DOIS OBJETOS (veículo vs veículo) ==========
export function verificarColisaoEntreObjetos(
  objeto1,
  objeto2,
  raio1 = 1.2,
  raio2 = 1.2
) {
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
        z: dz / distancia,
      },
    };
  }

  return { colidiu: false };
}
