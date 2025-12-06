import * as THREE from "three";

// Checa colisão do Carro  vs Muretas
export function verificarColisao(posicaoVeiculo, muretas, raioVeiculo = 0.6) {
  for (let mureta of muretas) {
    if (!mureta || !mureta.mesh) continue; // Pula mureta inválida

    // Pega a 'caixa' da mureta
    const bbox = new THREE.Box3().setFromObject(mureta.mesh);
    const pontoVeiculo = new THREE.Vector3(
      posicaoVeiculo.x,
      posicaoVeiculo.y,
      posicaoVeiculo.z
    );

    //acha o ponto na BORDA da caixa mais perto do carro
    const pontoMaisProximo = new THREE.Vector3();
    bbox.clampPoint(pontoVeiculo, pontoMaisProximo);

    // Mede a distância do carro até esse ponto
    const distancia = pontoVeiculo.distanceTo(pontoMaisProximo);

    // Se a distância for menor que o raio do carro, BATEU
    if (distancia < raioVeiculo) {
      // 'Normal' = direção pra empurrar o carro pra fora
      const normal = new THREE.Vector3();

      if (mureta.tipo === "horizontal") {
        // Mureta horizontal -> empurra só no eixo Z
        normal.z = posicaoVeiculo.z > mureta.posicao.z ? 1.0 : -1.0;
      } else if (mureta.tipo === "vertical") {
        // Mureta vertical -> empurra só no eixo X
        normal.x = posicaoVeiculo.x > mureta.posicao.x ? 1.0 : -1.0;
      } else {
        // Muretas de canto (sem tipo) -> calcula a normal
        normal.subVectors(pontoVeiculo, pontoMaisProximo).normalize();
      }

      // Retorna as infos da batida
      return {
        colidiu: true,
        mureta: mureta,
        normal: normal, // Direção do empurrão
        distanciaPenetracao: raioVeiculo - distancia, // O quanto o carro "entrou"
      };
    }
  }

  return { colidiu: false }; // Sem colisão
}

// --- Física de "Deslizar" na Parede ---
export function resolverColisaoDeslizante(veiculo, colisao, state) {
  if (!colisao.colidiu) return state.velocidade;

  // Empurra o carro pra fora da parede (pra não ficar preso)
  const forcaRepulsao = colisao.distanciaPenetracao + 0.01; // 0.01 é uma folga
  veiculo.group.position.x += colisao.normal.x * forcaRepulsao;
  veiculo.group.position.z += colisao.normal.z * forcaRepulsao;
  veiculo.position.copy(veiculo.group.position); // Atualiza a posição

  if (state.velocidade === 0) return 0; // Se tá parado, não faz nada

  // --- Lógica de Redução de Velocidade ---

  // Pega o vetor "pra frente" do carro
  const vFrente = new THREE.Vector3(0, 0, 1);
  vFrente.applyQuaternion(veiculo.quaternion); // Gira pra direção certa

  // 'Normal' da parede
  const vNormal = colisao.normal;

  // Gira a NORMAL 90 graus para achar a DIREÇÃO da mureta (vMureta)
  // (x, z) -> (z, -x)
  const vMureta = new THREE.Vector3(vNormal.z, 0, -vNormal.x);

  // Produto Escalar (dot) entre a FRENTE do carro e a DIREÇÃO da mureta
  // Math.abs() porque não importa o lado (tipo: vMureta (0,0,1) ou (0,0,-1))
  const fatorDeslize = Math.abs(vFrente.dot(vMureta));
  const atritoParede = 0.999999; //ajustar

  // A nova velocidade é a velocidade antiga * a proporção de deslize * atrito
  let novaVelocidade = state.velocidade * fatorDeslize * atritoParede;
  if (state.velocidade < 0 && novaVelocidade > 0) {
    novaVelocidade = state.velocidade; // Mantém a vel de ré
  }

  return novaVelocidade; // Retorna a nova velocidade (mais lenta)
}

// ========== VERIFICAR COLISÃO COM ZONA (linha de chegada) ==========
export function verificarColisaoZona(posicaoVeiculo, zona, raioVeiculo = 0.6) {
  if (!zona || !zona.mesh) return false;

  const bbox = new THREE.Box3().setFromObject(zona.mesh);
  const pontoVeiculo = new THREE.Vector3(
    posicaoVeiculo.x,
    posicaoVeiculo.y,
    posicaoVeiculo.z
  );

  // "Incha" a caixa da zona (pra facilitar a detecção)
  bbox.expandByScalar(raioVeiculo);

  // Verifica se o PONTO do veículo tá dentro da caixa "inchada"
  return bbox.containsPoint(pontoVeiculo);
}

// ========== CRIAR ZONA DE DETECÇÃO INVISÍVEL ==========
// Usamos isso pra checkpoints ou linha de chegada
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
    color: 0x00ff00, // Verde (bom pra debug)
    transparent: true,
    opacity: 0.0, // Fica invisível no jogo
    side: THREE.DoubleSide,
  });

  const zona = new THREE.Mesh(geometria, material);
  zona.position.set(x, y, z);
  zona.name = nome;

  // 'userData' guarda infos extras (ex: se já passamos aqui)
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

// ========== COLISÃO Carro vs Carro ==========
// Colisão simples de Círculo vs Círculo (ignora altura)
export function verificarColisaoEntreObjetos(
  objeto1,
  objeto2,
  raio1 = 0.6,
  raio2 = 0.6
) {
  const pos1 = objeto1.position;
  const pos2 = objeto2.position;

  // Distância só no X e Z
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;

  // Pitágoras
  const distancia = Math.sqrt(dx * dx + dz * dz);

  const raioTotal = raio1 + raio2; // Soma dos raios

  if (distancia < raioTotal) {
    // Se a distância for menor que a soma, bateu
    return {
      colidiu: true,
      distancia: distancia,
      normal: {
        // Direção da batida
        x: dx / distancia,
        z: dz / distancia,
      },
    };
  }

  return { colidiu: false };
}
