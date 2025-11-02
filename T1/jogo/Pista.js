import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";
import { criarMuretasPista1, criarMuretasPista2, criarLinhaLargada } from "./Muretas.js";

// Posições iniciais dos veículos
const POSICAO_INICIAL_PISTA_1 = {
  x: 0,
  y: 0.3,
  z: 50,
  rot: -Math.PI / 2,
};

const POSICAO_INICIAL_PISTA_2 = {
  x: 15,
  y: 0.3,
  z: 35,
  rot: -Math.PI / 2,
};

let pistaAtual = null;
let muretasAtuais = [];

// ========== PISTA 1 - OVAL ==========
export function criarPista1(scene) {
  console.log("Criando Pista 1...");
  limparPistaAtual(scene);

  const group = new THREE.Group();

  try {
    // GRAMA DE FUNDO
    const corPista = "green";
    const grama = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      setDefaultMaterial(corPista)
    );
    grama.rotation.x = -Math.PI / 2;
    grama.position.set(0, -0.1, 0);
    group.add(grama);

    // BLOCOS CINZAS DA PISTA (10x10)
    const materialBloco = new THREE.MeshLambertMaterial({ color: "gray" });
    const cubeGeometry = new THREE.BoxGeometry(10, 0.1, 10);
    const altura = 0.0;
    const inicio = -45;
    const fim = 45;

    // Criação do chão da pista
    for (let x = inicio; x <= fim; x += 10) {
      // parte inferior (sul) - pula x=0 para colocar a linha de chegada
      if (x !== 0) {
        let bloco = new THREE.Mesh(cubeGeometry, materialBloco);
        bloco.position.set(x, altura, 50);
        group.add(bloco);
      }
      
      // parte superior (norte)
      let blocoTopo = new THREE.Mesh(cubeGeometry, materialBloco);
      blocoTopo.position.set(x, altura, -50);
      group.add(blocoTopo);
    }

    for (let z = -40; z <= 40; z += 10) {
      // esquerda
      let blocoE = new THREE.Mesh(cubeGeometry, materialBloco);
      blocoE.position.set(-45, altura, z);
      group.add(blocoE);
      
      // direita
      let blocoD = new THREE.Mesh(cubeGeometry, materialBloco);
      blocoD.position.set(45, altura, z);
      group.add(blocoD);
    }

    // Linha de largada
    const linha = criarLinhaLargada(0, 50);
    group.add(linha);

    // Criar muretas
    const muretas = criarMuretasPista1(group);
    muretasAtuais = muretas;

    scene.add(group);
    pistaAtual = group;

    console.log("Pista 1 criada com sucesso!");
    return POSICAO_INICIAL_PISTA_1;
  } catch (error) {
    console.error("Erro ao criar Pista 1:", error);
    return POSICAO_INICIAL_PISTA_1;
  }
}

// ========== PISTA 2 - FORMATO "L" ==========
export function criarPista2(scene) {
  console.log("Criando Pista 2 - Formato L...");
  limparPistaAtual(scene);

  const group = new THREE.Group();

  try {
    // GRAMA DE FUNDO
    const corPista = "green";
    const grama = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      setDefaultMaterial(corPista)
    );
    grama.rotation.x = -Math.PI / 2;
    grama.position.set(0, -0.1, 0);
    group.add(grama);

    // BLOCOS CINZAS DA PISTA (10x10)
    const cubeGeometry = new THREE.BoxGeometry(10, 0.01, 10);
    const materialBloco = new THREE.MeshPhongMaterial({ color: "Peru" });
    const altura = 0.0;
    const offsetX = -55;
    const offsetZ = 25;

    // BLOCOS CINZAS - PAREDE SUL (horizontal)
    for (let x = 1; x <= 10; x++) {
      let bloco = new THREE.Mesh(cubeGeometry, materialBloco);
      bloco.position.set((x * 10) + offsetX, altura, 10.0 + offsetZ);
      group.add(bloco);
    }

    // BLOCOS CINZAS - PAREDE ESQUERDA (vertical)
    for (let z = 0; z >= -9; z--) {
      let bloco = new THREE.Mesh(cubeGeometry, materialBloco);
      bloco.position.set(10.0 + offsetX, altura, (z * 10) + offsetZ);
      group.add(bloco);
    }

    // BLOCOS CINZAS - TOPO (horizontal)
    for (let x = 2; x <= 6; x++) {
      let bloco = new THREE.Mesh(cubeGeometry, materialBloco);
      bloco.position.set((x * 10) + offsetX, altura, -90.0 + offsetZ);
      group.add(bloco);
    }

    // BLOCOS CINZAS - continuação TOPO (vertical)
    for (let z = -1.5; z >= -5.5; z -= 1) {
      let bloco = new THREE.Mesh(cubeGeometry, materialBloco);
      bloco.position.set(5, altura, (z * 10));
      group.add(bloco);
    }

    // BLOCOS CINZAS - LESTE (horizontal e vertical)
    for (let x = 6; x <= 10; x++) {
      let bloco = new THREE.Mesh(cubeGeometry, materialBloco);
      bloco.position.set((x * 10) + offsetX, altura, -30.0 + offsetZ);
      group.add(bloco);
    }

    for (let z = -3; z <= 0; z++) {
      let bloco = new THREE.Mesh(cubeGeometry, materialBloco);
      bloco.position.set(100.0 + offsetX, altura, (z * 10) + offsetZ);
      group.add(bloco);
    }

    // Linha de largada
    const linha = criarLinhaLargada(15, 35);
    group.add(linha);

    // Criar muretas
    const muretas = criarMuretasPista2(group);
    muretasAtuais = muretas;

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