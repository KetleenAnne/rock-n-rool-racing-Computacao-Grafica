import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";

// Array para armazenar os jumps criados
let jumpsAtuais = [];

// ========== BLOCOS DE CHÃO DA PISTA 3 ==========
// Define exatamente onde estão os blocos de chão (cada bloco é 20x20)
const BLOCOS_CHAO_PISTA3 = [
  // PRIMEIRO QUADRADO - SÓ A BORDA (forma um quadrado oco)
  
  // BORDA SUL (z = 60)
  { x: -50, z: 60 }, { x: -30, z: 60 }, { x: -10, z: 60 }, { x: 10, z: 60 }, { x: 30, z: 60 }, { x: 50, z: 60 },
  
  // BORDA NORTE (z = -60) - PULA x = -10 (buraco)
  { x: -50, z: -60 }, { x: -30, z: -60 }, { x: 10, z: -60 }, { x: 30, z: -60 }, { x: 50, z: -60 },
  
  // BORDA ESQUERDA (x = -50, z de -40 a 40)
  { x: -50, z: -40 }, { x: -50, z: -20 }, { x: -50, z: 0 }, { x: -50, z: 20 }, { x: -50, z: 40 },
  
  // BORDA DIREITA (x = 50, z de -40 a 40)
  { x: 50, z: -40 }, { x: 50, z: -20 }, { x: 50, z: 0 }, { x: 50, z: 20 }, { x: 50, z: 40 },
  
  // SEGUNDO QUADRADO (5x6 blocos completos)
  
  // LINHA SUL (z = -60)
  { x: -150, z: -60 }, { x: -130, z: -60 }, { x: -110, z: -60 }, { x: -90, z: -60 }, { x: -70, z: -60 },
  
  // LINHA z = -80
  { x: -150, z: -80 }, { x: -130, z: -80 }, { x: -110, z: -80 }, { x: -90, z: -80 }, { x: -70, z: -80 },
  
  // LINHA z = -100
  { x: -150, z: -100 }, { x: -130, z: -100 }, { x: -110, z: -100 }, { x: -90, z: -100 }, { x: -70, z: -100 },
  
  // LINHA z = -120
  { x: -150, z: -120 }, { x: -130, z: -120 }, { x: -110, z: -120 }, { x: -90, z: -120 }, { x: -70, z: -120 },
  
  // LINHA z = -140
  { x: -150, z: -140 }, { x: -130, z: -140 }, { x: -110, z: -140 }, { x: -90, z: -140 }, { x: -70, z: -140 },
  
  // LINHA z = -160
  { x: -150, z: -160 }, { x: -130, z: -160 }, { x: -110, z: -160 }, { x: -90, z: -160 }, { x: -70, z: -160 },
  
  // LINHA NORTE (z = -180)
  { x: -150, z: -180 }, { x: -130, z: -180 }, { x: -110, z: -180 }, { x: -90, z: -180 }, { x: -70, z: -180 },
];

// Variável para controlar qual pista está ativa
let pistaAtivaAtual = null;

// ========== DEFINIR PISTA ATIVA ==========
export function setPistaAtiva(numeroPista) {
  pistaAtivaAtual = numeroPista;
  console.log(`🏁 Pista ativa definida: ${numeroPista}`);
}

const LIMITES_PISTA = {
  minX: -160,  // Limite esquerdo (segundo quadrado)
  maxX: 60,    // Limite direito (primeiro quadrado)
  minZ: -190,  // Limite norte (segundo quadrado)
  maxZ: 70     // Limite sul (primeiro quadrado)
};

// ========== CRIAR JUMPS DA PISTA 3 ==========
export function criarJumpsPista3(scene) {
  console.log("Criando jumps da Pista 3...");
  
  // Limpa jumps anteriores antes de criar novos
  limparJumps(scene);

  const jumps = [];

  // Geometria e material dos jumps (visual de rampa)
  const retanguloGeo = new THREE.PlaneGeometry(3, 6);
  const materialJump = new THREE.MeshLambertMaterial({ 
    color: 0xFFAA00, // Laranja para destacar
    side: THREE.DoubleSide 
  });

  // ========== JUMP 1 - Esquerdo ==========
  const jump1 = new THREE.Mesh(retanguloGeo, materialJump);
  jump1.position.set(-21.55, 0.1, -60);
  jump1.rotation.x = -Math.PI / 2;
  jump1.name = "jump1";
  scene.add(jump1);
  
  jumps.push({
    mesh: jump1,
    posicao: { x: -21.55, y: 0.1, z: -60 },
    nome: "jump1",
    direcaoSalto: new THREE.Vector3(0, 0, -1) // Salto para norte (z negativo)
  });

  // ========== JUMP 2 - Direito ==========
  const jump2 = new THREE.Mesh(retanguloGeo, materialJump);
  jump2.position.set(1.55, 0.1, -60);
  jump2.rotation.x = -Math.PI / 2;
  jump2.name = "jump2";
  scene.add(jump2);
  
  jumps.push({
    mesh: jump2,
    posicao: { x: 1.55, y: 0.1, z: -60 },
    nome: "jump2",
    direcaoSalto: new THREE.Vector3(0, 0, -1) // Salto para norte (z negativo)
  });

  jumpsAtuais = jumps;
  console.log(`${jumps.length} jumps criados na Pista 3`);
  
  return jumps;
}

// ========== VERIFICAR COLISÃO COM JUMP ==========
export function verificarColisaoJump(posicaoVeiculo, raioVeiculo = 1.5, veiculo = null) {
  // Se o veículo está no ar, não ativa jump (evita ativar ao cair)
  if (veiculo && veiculo.dadosSalto && veiculo.dadosSalto.estaNoAr) {
    return { ativado: false };
  }

  // Se está em cooldown, não verifica colisão
  if (veiculo && veiculo.dadosSalto && veiculo.dadosSalto.cooldownRestante > 0) {
    return { ativado: false };
  }

  for (let jump of jumpsAtuais) {
    if (!jump || !jump.mesh) continue;

    const posJump = jump.posicao;
    
    // Calcula distância entre veículo e jump (só X e Z)
    const dx = posicaoVeiculo.x - posJump.x;
    const dz = posicaoVeiculo.z - posJump.z;
    const distancia = Math.sqrt(dx * dx + dz * dz);

    // Raio de ativação do jump AUMENTADO para detectar melhor
    const raioAtivacao = 4.0;  // ← MUDOU DE 2.5 PARA 4.0

    // Se está próximo o suficiente, ativou o jump
    if (distancia < raioAtivacao) {
      return {
        ativado: true,
        jump: jump,
        distancia: distancia
      };
    }
  }

  return { ativado: false };
}

// ========== APLICAR EFEITO DE JUMP COM FÍSICA PARABÓLICA ==========
export function aplicarEfeitoJump(veiculo, velocidadeAtual) {
  if (!veiculo || !veiculo.group) return;

  // Inicializa propriedades de salto se não existirem
  if (!veiculo.dadosSalto) {
    veiculo.dadosSalto = {
      velocidadeVertical: 0,
      velocidadeHorizontal: new THREE.Vector3(0, 0, 0),
      estaNoAr: false,
      tempoNoAr: 0,
      cooldownRestante: 0 // Tempo de cooldown em segundos
    };
  }

  // Se já está no ar, não ativa outro salto
  if (veiculo.dadosSalto.estaNoAr) return;

  // Se está em cooldown, não ativa outro salto
  if (veiculo.dadosSalto.cooldownRestante > 0) {
    console.log(`⏳ Jump em cooldown! Aguarde ${veiculo.dadosSalto.cooldownRestante.toFixed(1)}s`);
    return;
  }

  // Pega a direção para onde o veículo está olhando
  const direcaoVeiculo = new THREE.Vector3(0, 0, 1);
  direcaoVeiculo.applyQuaternion(veiculo.quaternion);
  direcaoVeiculo.normalize();

  // Calcula velocidade horizontal baseada na velocidade atual do veículo
  // A velocidade mínima garante que mesmo parado dê um pequeno salto
  const velocidadeMinima = 20;
  const velocidadeHorizontal = Math.max(Math.abs(velocidadeAtual), velocidadeMinima);
  
  // Armazena a velocidade horizontal (mantém a direção e velocidade)
  veiculo.dadosSalto.velocidadeHorizontal.copy(direcaoVeiculo).multiplyScalar(velocidadeHorizontal);

  // Velocidade vertical inicial (impulso para cima)
  // Ajustado para criar uma parábola adequada
  const impulsoVertical = 20;
  veiculo.dadosSalto.velocidadeVertical = impulsoVertical;

  // Marca que está no ar
  veiculo.dadosSalto.estaNoAr = true;
  veiculo.dadosSalto.tempoNoAr = 0;
  veiculo.dadosSalto.cooldownRestante = 3; // Define cooldown de 4 segundos
  
  console.log(`🚀 JUMP ATIVADO!`);
  console.log(`   Velocidade horizontal: ${velocidadeHorizontal.toFixed(2)}`);
  console.log(`   Impulso vertical: ${impulsoVertical}`);
  console.log(`   Direção: (${direcaoVeiculo.x.toFixed(2)}, ${direcaoVeiculo.z.toFixed(2)})`);
}

// ========== ATUALIZAR FÍSICA DO JUMP - MOVIMENTO PARABÓLICO ==========
export function atualizarFisicaJump(veiculo, deltaTime) {
  if (!veiculo || !veiculo.group) return;

  // Inicializa dadosSalto se não existir
  if (!veiculo.dadosSalto) {
    veiculo.dadosSalto = {
      velocidadeVertical: 0,
      velocidadeHorizontal: new THREE.Vector3(0, 0, 0),
      estaNoAr: false,
      tempoNoAr: 0,
      cooldownRestante: 0
    };
    return;
  }

  // Atualiza cooldown (diminui o tempo a cada frame)
  if (veiculo.dadosSalto.cooldownRestante > 0) {
    veiculo.dadosSalto.cooldownRestante -= deltaTime;
    if (veiculo.dadosSalto.cooldownRestante < 0) {
      veiculo.dadosSalto.cooldownRestante = 0;
    }
  }

  const gravidade = -28; // Gravidade (negativa = puxa pra baixo)
  const alturaChao = 0.3; // Altura normal do veículo no chão

  // Se está no ar, aplica física parabólica
  if (veiculo.dadosSalto.estaNoAr) {
    veiculo.dadosSalto.tempoNoAr += deltaTime;

    // ========== MOVIMENTO VERTICAL (eixo Y) - Parábola ==========
    // Aplica gravidade à velocidade vertical
    veiculo.dadosSalto.velocidadeVertical += gravidade * deltaTime;
    
    // Atualiza posição Y
    veiculo.group.position.y += veiculo.dadosSalto.velocidadeVertical * deltaTime;
    veiculo.position.y = veiculo.group.position.y;

    // ========== MOVIMENTO HORIZONTAL (eixos X e Z) - Mantém velocidade ==========
    // Move o veículo na direção horizontal com a velocidade armazenada
    const deslocamentoHorizontal = veiculo.dadosSalto.velocidadeHorizontal.clone().multiplyScalar(deltaTime);
    veiculo.group.position.x += deslocamentoHorizontal.x;
    veiculo.group.position.z += deslocamentoHorizontal.z;
    veiculo.position.copy(veiculo.group.position);

    // --- CORREÇÃO AQUI: RESISTÊNCIA DO AR INDEPENDENTE DE FRAME RATE ---
    // Em vez de multiplyScalar(0.995) fixo, usamos Math.pow para ajustar ao tempo decorrido.
    // 0.95 significa que o carro mantém 95% da velocidade após 1 segundo no ar.
    const resistenciaPorSegundo = 0.95; 
    const fatorFrame = Math.pow(resistenciaPorSegundo, deltaTime);
    veiculo.dadosSalto.velocidadeHorizontal.multiplyScalar(fatorFrame);

    // ========== VERIFICAR ATERRISSAGEM ==========
    if (veiculo.group.position.y <= alturaChao) {
      // Aterrissou!
      veiculo.group.position.y = alturaChao;
      veiculo.position.y = alturaChao;
      veiculo.dadosSalto.velocidadeVertical = 0;
      veiculo.dadosSalto.velocidadeHorizontal.set(0, 0, 0);
      veiculo.dadosSalto.estaNoAr = false;
      
      // Reduz a velocidade do veículo ao aterrissar
      if (veiculo.velocidadeAtual) {
        veiculo.velocidadeAtual *= 0.6;
        console.log(`   Velocidade após aterrissagem: ${veiculo.velocidadeAtual.toFixed(2)}`);
      }
      
      veiculo.dadosSalto.tempoNoAr = 0;
    }
  }
}

// ========== VERIFICAR SE VEÍCULO ESTÁ NO AR ==========
export function estaNoAr(veiculo) {
  if (!veiculo || !veiculo.dadosSalto) return false;
  return veiculo.dadosSalto.estaNoAr;
}

// ========== LIMPAR JUMPS ==========
export function limparJumps(scene) {
  for (let jump of jumpsAtuais) {
    if (jump && jump.mesh) {
      scene.remove(jump.mesh);
      if (jump.mesh.geometry) jump.mesh.geometry.dispose();
      if (jump.mesh.material) jump.mesh.material.dispose();
    }
  }
  jumpsAtuais = [];
}

// ========== GETTER PARA JUMPS ATUAIS ==========
export function getJumps() {
  return jumpsAtuais;
}

// ========== SISTEMA DE QUEDA LIVRE ==========

// Zona de queda (buraco na pista 3)
const ZONA_QUEDA = {
  x: -10,  // Centro X do buraco
  z: -60,  // Centro Z do buraco
  raio: 10, // Raio de detecção (área do buraco)
  profundidadeRespawn: -19, // Y onde o veículo respawna
  posicaoRespawn: { x: -150, y: 0.3, z: -60 } // Posição de reaparecimento
};

// ========== VERIFICAR SE ESTÁ NA ZONA DE QUEDA ==========
export function verificarZonaQueda(posicaoVeiculo) {
  if (pistaAtivaAtual !== 3) {
    return false; // Nas outras pistas, nunca ativa queda
  }
  // Calcula distância do veículo ao centro do buraco (só X e Z)
  const dx = posicaoVeiculo.x - ZONA_QUEDA.x;
  const dz = posicaoVeiculo.z - ZONA_QUEDA.z;
  const distancia = Math.sqrt(dx * dx + dz * dz);

  // Verifica se está dentro da área do buraco
  return !esChaoDaPista(posicaoVeiculo);
}

// ========== INICIAR QUEDA LIVRE ==========
export function iniciarQuedaLivre(veiculo) {
  if (!veiculo || !veiculo.group) return;

  // Inicializa dados de queda se não existirem
  if (!veiculo.dadosQueda) {
    veiculo.dadosQueda = {
      estaCaindo: false,
      velocidadeQueda: 0
    };
  }

  // Se já está caindo ou no ar (jump), não inicia nova queda
  if (veiculo.dadosQueda.estaCaindo) return;
  if (veiculo.dadosSalto && veiculo.dadosSalto.estaNoAr) return;

  // Inicia a queda
  veiculo.dadosQueda.estaCaindo = true;
  veiculo.dadosQueda.velocidadeQueda = 0;

  console.log(`💀 CAINDO NO BURACO! Veículo: ${veiculo.name || 'Desconhecido'}`);
}

// ========== ATUALIZAR FÍSICA DE QUEDA ==========
export function atualizarQuedaLivre(veiculo, deltaTime) {
  if (!veiculo || !veiculo.group) return;

  // Inicializa dadosQueda se não existir
  if (!veiculo.dadosQueda) {
    veiculo.dadosQueda = {
      estaCaindo: false,
      velocidadeQueda: 0
    };
    return;
  }

  // Se não está caindo, não faz nada
  if (!veiculo.dadosQueda.estaCaindo) return;

  const gravidadeQueda = -25; // Gravidade da queda (negativa)
  const velocidadeRotacao = 2.0; // Velocidade de rotação durante a queda

  // Aplica gravidade à velocidade de queda
  veiculo.dadosQueda.velocidadeQueda += gravidadeQueda * deltaTime;

  // Atualiza posição Y (cai)
  veiculo.group.position.y += veiculo.dadosQueda.velocidadeQueda * deltaTime;
  veiculo.position.y = veiculo.group.position.y;

  // Aplica rotação suave durante a queda (efeito visual)
  //if (veiculo.group) {
    //veiculo.group.rotation.x += velocidadeRotacao * deltaTime;
    //veiculo.group.rotation.z += velocidadeRotacao * 0.5 * deltaTime;
  //}

  // ========== ROTAÇÃO PARA FRENTE (Mergulho) ==========
  // Criamos um vetor que representa o eixo lateral (X local do veículo)
  const eixoLateral = new THREE.Vector3(1, 0, 0); 
  // Aplicamos a rotação local para que ele sempre "mergulhe" de frente, 
  // independente de para onde o carro estava virado.
  veiculo.group.rotateOnAxis(eixoLateral, velocidadeRotacao * deltaTime);

  // ========== VERIFICAR RESPAWN ==========
  if (veiculo.group.position.y <= ZONA_QUEDA.profundidadeRespawn) {
    respawnarVeiculo(veiculo);
  }
}

// ========== RESPAWNAR VEÍCULO ==========
function respawnarVeiculo(veiculo) {
  if (!veiculo || !veiculo.group) return;

  console.log(`🔄 RESPAWNANDO veículo em (${ZONA_QUEDA.posicaoRespawn.x}, ${ZONA_QUEDA.posicaoRespawn.z})`);

  // Reposiciona o veículo
  veiculo.group.position.set(
    ZONA_QUEDA.posicaoRespawn.x,
    ZONA_QUEDA.posicaoRespawn.y,
    ZONA_QUEDA.posicaoRespawn.z
  );
  veiculo.position.copy(veiculo.group.position);

  // Reseta rotação - DIREÇÃO OPOSTA (Math.PI / 2 ao invés de -Math.PI / 2)
  veiculo.group.rotation.set(0, Math.PI / 2, 0);
  veiculo.rotation.set(0, Math.PI / 2, 0);

  // ZERA A VELOCIDADE (importante para não bugar)
  veiculo.velocidadeAtual = 0;
  
  // Reseta estado de queda
  veiculo.dadosQueda.estaCaindo = false;
  veiculo.dadosQueda.velocidadeQueda = 0;

  // Reseta estado de salto (se existir)
  if (veiculo.dadosSalto) {
    veiculo.dadosSalto.estaNoAr = false;
    veiculo.dadosSalto.velocidadeVertical = 0;
    veiculo.dadosSalto.velocidadeHorizontal.set(0, 0, 0);
  }

  console.log(`✅ Veículo respawnado! Velocidade zerada.`);
}

// ========== VERIFICAR SE ESTÁ CAINDO ==========
export function estaCaindo(veiculo) {
  if (!veiculo || !veiculo.dadosQueda) return false;
  return veiculo.dadosQueda.estaCaindo;
}

// ========== VERIFICAR SE É CHÃO DA PISTA ==========
export function esChaoDaPista(posicaoVeiculo) {
  // ⚠️ SÓ FUNCIONA NA PISTA 3
  if (pistaAtivaAtual !== 3) {
    return true; // Nas outras pistas, sempre considera chão válido
  }

  // Verifica se o veículo está em cima de algum bloco de chão
  // Cada bloco tem 20x20, então verificamos se está a ±10 do centro
  for (let bloco of BLOCOS_CHAO_PISTA3) {
    const dentroBlocoX = Math.abs(posicaoVeiculo.x - bloco.x) <= 10;
    const dentroBlocoZ = Math.abs(posicaoVeiculo.z - bloco.z) <= 10;
    
    if (dentroBlocoX && dentroBlocoZ) {
      return true; // Está em cima de um bloco = é chão válido
    }
  }

  // Não está em cima de nenhum bloco = não é chão
  return false;
}