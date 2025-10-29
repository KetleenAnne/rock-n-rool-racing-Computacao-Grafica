import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";
import { criarSegmentoMureta, criarLinhaLargada } from "./Muretas.js";

const TAMANHO_BLOCO = 2;

// Verificar se uma posiÃ§Ã£o jÃ¡ estÃ¡ ocupada
function posicaoOcupada(x, z, ocupadas) {
  return ocupadas.some((pos) => pos.x === x && pos.z === z);
}

// ========== PISTA 1 - OVAL RETANGULAR 70x68 ==========
function criarMuretasPista1() {
  const segmentos = [];
  const ocupadas = [];

  const largura = 70;
  const altura = 68;
  const ilhaInicioX = 12;
  const ilhaFimX = 58;
  const ilhaInicioZ = 12;
  const ilhaFimZ = 56;

  // BORDA SUPERIOR (z=0, x: 0â†’69)
  const superior = [];
  for (let x = 0; x < largura; x++) {
    if (!posicaoOcupada(x, 0, ocupadas)) {
      superior.push({ x, z: 0 });
      ocupadas.push({ x, z: 0 });
    }
  }
  if (superior.length > 0) {
    segmentos.push({ posicoes: superior, orientacao: "horizontal" });
  }

  // BORDA DIREITA (x=69, z: 0â†’67)
  const direita = [];
  for (let z = 0; z < altura; z++) {
    if (!posicaoOcupada(largura - 1, z, ocupadas)) {
      direita.push({ x: largura - 1, z });
      ocupadas.push({ x: largura - 1, z });
    }
  }
  if (direita.length > 0) {
    segmentos.push({ posicoes: direita, orientacao: "vertical" });
  }

  // BORDA INFERIOR (z=67, x: 69â†’0)
  const inferior = [];
  for (let x = largura - 1; x >= 0; x--) {
    if (!posicaoOcupada(x, altura - 1, ocupadas)) {
      inferior.push({ x, z: altura - 1 });
      ocupadas.push({ x, z: altura - 1 });
    }
  }
  if (inferior.length > 0) {
    segmentos.push({ posicoes: inferior, orientacao: "horizontal" });
  }

  // BORDA ESQUERDA (x=0, z: 67â†’0)
  const esquerda = [];
  for (let z = altura - 1; z >= 0; z--) {
    if (!posicaoOcupada(0, z, ocupadas)) {
      esquerda.push({ x: 0, z });
      ocupadas.push({ x: 0, z });
    }
  }
  if (esquerda.length > 0) {
    segmentos.push({ posicoes: esquerda, orientacao: "vertical" });
  }

  // ILHA INTERNA - SUPERIOR
  const ilhaSup = [];
  for (let x = ilhaInicioX; x <= ilhaFimX; x++) {
    if (!posicaoOcupada(x, ilhaInicioZ, ocupadas)) {
      ilhaSup.push({ x, z: ilhaInicioZ });
      ocupadas.push({ x, z: ilhaInicioZ });
    }
  }
  if (ilhaSup.length > 0) {
    segmentos.push({ posicoes: ilhaSup, orientacao: "horizontal" });
  }

  // ILHA INTERNA - DIREITA
  const ilhaDir = [];
  for (let z = ilhaInicioZ; z <= ilhaFimZ; z++) {
    if (!posicaoOcupada(ilhaFimX, z, ocupadas)) {
      ilhaDir.push({ x: ilhaFimX, z });
      ocupadas.push({ x: ilhaFimX, z });
    }
  }
  if (ilhaDir.length > 0) {
    segmentos.push({ posicoes: ilhaDir, orientacao: "vertical" });
  }

  // ILHA INTERNA - INFERIOR
  const ilhaInf = [];
  for (let x = ilhaFimX; x >= ilhaInicioX; x--) {
    if (!posicaoOcupada(x, ilhaFimZ, ocupadas)) {
      ilhaInf.push({ x, z: ilhaFimZ });
      ocupadas.push({ x, z: ilhaFimZ });
    }
  }
  if (ilhaInf.length > 0) {
    segmentos.push({ posicoes: ilhaInf, orientacao: "horizontal" });
  }

  // ILHA INTERNA - ESQUERDA
  const ilhaEsq = [];
  for (let z = ilhaFimZ; z >= ilhaInicioZ; z--) {
    if (!posicaoOcupada(ilhaInicioX, z, ocupadas)) {
      ilhaEsq.push({ x: ilhaInicioX, z });
      ocupadas.push({ x: ilhaInicioX, z });
    }
  }
  if (ilhaEsq.length > 0) {
    segmentos.push({ posicoes: ilhaEsq, orientacao: "vertical" });
  }

  return segmentos;
}

// ========== PISTA 2 - FORMATO "L" 42x70 ==========
function criarMuretasPista2() {
  const segmentos = [];
  const ocupadas = [];

  // DimensÃµes baseadas na imagem
  const larguraTotal = 42;
  const alturaTotal = 70;
  const divisaoX = 28; // Onde termina a parte vertical do L
  const divisaoZ = 42; // Onde comeÃ§a a extensÃ£o horizontal

  // Ilha interna
  const ilhaInicioX = 7;
  const ilhaFimX = 35;
  const ilhaInicioZ = 7;
  const ilhaFimZ = 63;
  const ilhaDivisaoX = 21; // DivisÃ£o da ilha em L
  const ilhaDivisaoZ = 48; // Onde comeÃ§a extensÃ£o da ilha

  // BORDA EXTERNA - PARTE SUPERIOR (z=0, x: 0â†’27)
  const superiorEsq = [];
  for (let x = 0; x <= divisaoX; x++) {
    if (!posicaoOcupada(x, 0, ocupadas)) {
      superiorEsq.push({ x, z: 0 });
      ocupadas.push({ x, z: 0 });
    }
  }
  if (superiorEsq.length > 0) {
    segmentos.push({ posicoes: superiorEsq, orientacao: "horizontal" });
  }

  // BORDA DIREITA DA PARTE VERTICAL (x=27, z: 0â†’41)
  const direitaVertical = [];
  for (let z = 0; z <= divisaoZ; z++) {
    if (!posicaoOcupada(divisaoX, z, ocupadas)) {
      direitaVertical.push({ x: divisaoX, z });
      ocupadas.push({ x: divisaoX, z });
    }
  }
  if (direitaVertical.length > 0) {
    segmentos.push({ posicoes: direitaVertical, orientacao: "vertical" });
  }

  // CONEXÃƒO HORIZONTAL (z=41, x: 27â†’41)
  const conexaoHorizontal = [];
  for (let x = divisaoX; x < larguraTotal; x++) {
    if (!posicaoOcupada(x, divisaoZ, ocupadas)) {
      conexaoHorizontal.push({ x, z: divisaoZ });
      ocupadas.push({ x, z: divisaoZ });
    }
  }
  if (conexaoHorizontal.length > 0) {
    segmentos.push({ posicoes: conexaoHorizontal, orientacao: "horizontal" });
  }

  // BORDA DIREITA DA EXTENSÃƒO (x=41, z: 41â†’69)
  const direitaExtensao = [];
  for (let z = divisaoZ; z < alturaTotal; z++) {
    if (!posicaoOcupada(larguraTotal - 1, z, ocupadas)) {
      direitaExtensao.push({ x: larguraTotal - 1, z });
      ocupadas.push({ x: larguraTotal - 1, z });
    }
  }
  if (direitaExtensao.length > 0) {
    segmentos.push({ posicoes: direitaExtensao, orientacao: "vertical" });
  }

  // BORDA INFERIOR (z=69, x: 41â†’0)
  const inferior = [];
  for (let x = larguraTotal - 1; x >= 0; x--) {
    if (!posicaoOcupada(x, alturaTotal - 1, ocupadas)) {
      inferior.push({ x, z: alturaTotal - 1 });
      ocupadas.push({ x, z: alturaTotal - 1 });
    }
  }
  if (inferior.length > 0) {
    segmentos.push({ posicoes: inferior, orientacao: "horizontal" });
  }

  // BORDA ESQUERDA (x=0, z: 69â†’0)
  const esquerda = [];
  for (let z = alturaTotal - 1; z >= 0; z--) {
    if (!posicaoOcupada(0, z, ocupadas)) {
      esquerda.push({ x: 0, z });
      ocupadas.push({ x: 0, z });
    }
  }
  if (esquerda.length > 0) {
    segmentos.push({ posicoes: esquerda, orientacao: "vertical" });
  }

  // ILHA INTERNA EM FORMATO "L"

  // ILHA - SUPERIOR (z=7, x: 7â†’21)
  const ilhaSuperior = [];
  for (let x = ilhaInicioX; x <= ilhaDivisaoX; x++) {
    if (!posicaoOcupada(x, ilhaInicioZ, ocupadas)) {
      ilhaSuperior.push({ x, z: ilhaInicioZ });
      ocupadas.push({ x, z: ilhaInicioZ });
    }
  }
  if (ilhaSuperior.length > 0) {
    segmentos.push({ posicoes: ilhaSuperior, orientacao: "horizontal" });
  }

  // ILHA - DIREITA DA PARTE VERTICAL (x=21, z: 7â†’47)
  const ilhaDireitaVertical = [];
  for (let z = ilhaInicioZ; z <= ilhaDivisaoZ; z++) {
    if (!posicaoOcupada(ilhaDivisaoX, z, ocupadas)) {
      ilhaDireitaVertical.push({ x: ilhaDivisaoX, z });
      ocupadas.push({ x: ilhaDivisaoX, z });
    }
  }
  if (ilhaDireitaVertical.length > 0) {
    segmentos.push({ posicoes: ilhaDireitaVertical, orientacao: "vertical" });
  }

  // ILHA - CONEXÃƒO HORIZONTAL (z=47, x: 21â†’35)
  const ilhaConexao = [];
  for (let x = ilhaDivisaoX; x <= ilhaFimX; x++) {
    if (!posicaoOcupada(x, ilhaDivisaoZ, ocupadas)) {
      ilhaConexao.push({ x, z: ilhaDivisaoZ });
      ocupadas.push({ x, z: ilhaDivisaoZ });
    }
  }
  if (ilhaConexao.length > 0) {
    segmentos.push({ posicoes: ilhaConexao, orientacao: "horizontal" });
  }

  // ILHA - DIREITA DA EXTENSÃƒO (x=35, z: 47â†’63)
  const ilhaDireitaExtensao = [];
  for (let z = ilhaDivisaoZ; z <= ilhaFimZ; z++) {
    if (!posicaoOcupada(ilhaFimX, z, ocupadas)) {
      ilhaDireitaExtensao.push({ x: ilhaFimX, z });
      ocupadas.push({ x: ilhaFimX, z });
    }
  }
  if (ilhaDireitaExtensao.length > 0) {
    segmentos.push({ posicoes: ilhaDireitaExtensao, orientacao: "vertical" });
  }

  // ILHA - INFERIOR (z=63, x: 35â†’7)
  const ilhaInferior = [];
  for (let x = ilhaFimX; x >= ilhaInicioX; x--) {
    if (!posicaoOcupada(x, ilhaFimZ, ocupadas)) {
      ilhaInferior.push({ x, z: ilhaFimZ });
      ocupadas.push({ x, z: ilhaFimZ });
    }
  }
  if (ilhaInferior.length > 0) {
    segmentos.push({ posicoes: ilhaInferior, orientacao: "horizontal" });
  }

  // ILHA - ESQUERDA (x=7, z: 63â†’7)
  const ilhaEsquerda = [];
  for (let z = ilhaFimZ; z >= ilhaInicioZ; z--) {
    if (!posicaoOcupada(ilhaInicioX, z, ocupadas)) {
      ilhaEsquerda.push({ x: ilhaInicioX, z });
      ocupadas.push({ x: ilhaInicioX, z });
    }
  }
  if (ilhaEsquerda.length > 0) {
    segmentos.push({ posicoes: ilhaEsquerda, orientacao: "vertical" });
  }

  return segmentos;
}

// PosiÃ§Ãµes iniciais NA linha de largada (parte inferior central)
const POSICAO_INICIAL_PISTA_1 = {
  x: 69,
  y: 0.3,
  z: 128,
  rot: Math.PI / 2,
};

const POSICAO_INICIAL_PISTA_2 = {
  x: 27,
  y: 0.3,
  z: 136,
  rot: Math.PI / 2,
};

let pistaAtual = null;
let muretasAtuais = [];

export function criarPista1(scene) {
  console.log("Criando Pista 1 (70x68)...");
  limparPistaAtual(scene);

  const group = new THREE.Group();

  try {
    // Calcular centro: (largura-1)/2 * TAMANHO_BLOCO
    const centroX = ((70 - 1) / 2) * TAMANHO_BLOCO; // 69
    const centroZ = ((68 - 1) / 2) * TAMANHO_BLOCO; // 67

    // Grama
    const grama = new THREE.Mesh(
      new THREE.PlaneGeometry(170, 160),
      setDefaultMaterial("green")
    );
    grama.rotation.x = -Math.PI / 2;
    grama.position.set(centroX, -0.1, centroZ);
    group.add(grama);

    // Pista cinza (70x68 blocos = 140x136 unidades)
    const pista = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 136),
      setDefaultMaterial("gray")
    );
    pista.rotation.x = -Math.PI / 2;
    pista.position.set(centroX, 0, centroZ);
    group.add(pista);

    // Ilha verde central
    const ilhaCentroX = ((12 + 58) / 2) * TAMANHO_BLOCO; // 70
    const ilhaCentroZ = ((12 + 56) / 2) * TAMANHO_BLOCO; // 68
    const ilhaLargura = (58 - 12 + 1) * TAMANHO_BLOCO; // 94
    const ilhaAltura = (56 - 12 + 1) * TAMANHO_BLOCO; // 90

    const ilha = new THREE.Mesh(
      new THREE.PlaneGeometry(ilhaLargura, ilhaAltura),
      setDefaultMaterial("darkgreen")
    );
    ilha.rotation.x = -Math.PI / 2;
    ilha.position.set(ilhaCentroX, 0.05, ilhaCentroZ);
    group.add(ilha);

    // Linha de largada VERTICAL (parte inferior central)
    const linha = criarLinhaLargada(centroX, 118, 32);
    group.add(linha);

    // Criar muretas
    const segmentos = criarMuretasPista1();
    segmentos.forEach((seg) => {
      const mureta = criarSegmentoMureta(
        seg.posicoes,
        TAMANHO_BLOCO,
        seg.orientacao
      );
      group.add(mureta.mesh);
      muretasAtuais.push(mureta);
    });

    scene.add(group);
    pistaAtual = group;

    console.log("Pista 1 criada com sucesso! Centro:", centroX, centroZ);
    return POSICAO_INICIAL_PISTA_1;
  } catch (error) {
    console.error("Erro ao criar Pista 1:", error);
    return POSICAO_INICIAL_PISTA_1;
  }
}

export function criarPista2(scene) {
  console.log("Criando Pista 2 (42x70) - Formato L...");
  limparPistaAtual(scene);

  const group = new THREE.Group();

  try {
    // DimensÃµes do formato L
    const divisaoX = 28; // Limite da parte vertical
    const divisaoZ = 42; // InÃ­cio da extensÃ£o horizontal
    const larguraTotal = 42;
    const alturaTotal = 70;

    // GRAMA DE FUNDO
    const grama = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 180),
      setDefaultMaterial("green")
    );
    grama.rotation.x = -Math.PI / 2;
    grama.position.set(41, -0.1, 69);
    group.add(grama);

    // PARTE VERTICAL DO "L" (0-28 em X, 0-70 em Z)
    // Centro: x = 14*TAMANHO_BLOCO = 28, z = 35*TAMANHO_BLOCO = 70
    const pistaVertical = new THREE.Mesh(
      new THREE.PlaneGeometry(
        (divisaoX + 1) * TAMANHO_BLOCO, // 29 blocos = 58 unidades
        alturaTotal * TAMANHO_BLOCO // 70 blocos = 140 unidades
      ),
      setDefaultMaterial("gray")
    );
    pistaVertical.rotation.x = -Math.PI / 2;
    pistaVertical.position.set(28, 0, 69);
    group.add(pistaVertical);

    // EXTENSÃƒO HORIZONTAL DO "L" (28-41 em X, 42-69 em Z)
    // Centro: x = (28+41)/2*TAMANHO_BLOCO = 69, z = (42+69)/2*TAMANHO_BLOCO = 111
    const pistaHorizontal = new THREE.Mesh(
      new THREE.PlaneGeometry(
        (larguraTotal - divisaoX) * TAMANHO_BLOCO, // 14 blocos = 28 unidades
        (alturaTotal - divisaoZ) * TAMANHO_BLOCO // 28 blocos = 56 unidades
      ),
      setDefaultMaterial("gray")
    );
    pistaHorizontal.rotation.x = -Math.PI / 2;
    pistaHorizontal.position.set(69, 0, 111);
    group.add(pistaHorizontal);

    // ILHA VERDE CENTRAL (formato L tambÃ©m)
    // Ilha parte vertical (7-21 em X, 7-63 em Z)
    const ilhaVertical = new THREE.Mesh(
      new THREE.PlaneGeometry(
        (21 - 7 + 1) * TAMANHO_BLOCO, // 15 blocos = 30 unidades
        (63 - 7 + 1) * TAMANHO_BLOCO // 57 blocos = 114 unidades
      ),
      setDefaultMaterial("darkgreen")
    );
    ilhaVertical.rotation.x = -Math.PI / 2;
    ilhaVertical.position.set(28, 0.05, 70);
    group.add(ilhaVertical);

    // Ilha extensÃ£o horizontal (21-35 em X, 48-63 em Z)
    const ilhaHorizontal = new THREE.Mesh(
      new THREE.PlaneGeometry(
        (35 - 21 + 1) * TAMANHO_BLOCO, // 15 blocos = 30 unidades
        (63 - 48 + 1) * TAMANHO_BLOCO // 16 blocos = 32 unidades
      ),
      setDefaultMaterial("darkgreen")
    );
    ilhaHorizontal.rotation.x = -Math.PI / 2;
    ilhaHorizontal.position.set(56, 0.05, 111);
    group.add(ilhaHorizontal);

    // Linha de largada VERTICAL (parte inferior)
    const linha = criarLinhaLargada(48, 132, 11);
    group.add(linha);

    // Criar muretas
    const segmentos = criarMuretasPista2();
    segmentos.forEach((seg) => {
      const mureta = criarSegmentoMureta(
        seg.posicoes,
        TAMANHO_BLOCO,
        seg.orientacao
      );
      group.add(mureta.mesh);
      muretasAtuais.push(mureta);
    });

    scene.add(group);
    pistaAtual = group;

    console.log("Pista 2 criada com sucesso! Formato L");
    return POSICAO_INICIAL_PISTA_2;
  } catch (error) {
    console.error("Erro ao criar Pista 2:", error);
    return POSICAO_INICIAL_PISTA_2;
  }
}

function limparPistaAtual(scene) {
  if (pistaAtual) {
    scene.remove(pistaAtual);
    pistaAtual = null;
  }
  muretasAtuais = [];
}

export function getMuretas() {
  return muretasAtuais;
}

export { TAMANHO_BLOCO };
