import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";
import {
  criarMuretasPista1,
  criarMuretasPista2,
  criarMuretasPista3,
  criarLinhaLargada,
} from "./Muretas.js";
import {
  criarArvoresPista1,
  criarArvoresPista2,
  criarArvoresPista3,
} from "./Arvores.js";
import { criarAguaPista2, limparAguas } from "./Agua.js";
import { criarJumpsPista3, limparJumps } from "./Jump.js";
import {
  criarMurosPista1,
  criarMurosPista2,
  criarMurosPista3,
} from "./MuroLateral.js";

// Posições iniciais dos veículos
const POSICAO_INICIAL_PISTA_1 = {
  x: 0,
  y: 0.3,
  z: 100,
  rot: -Math.PI / 2,
};

const POSICAO_INICIAL_PISTA_2 = {
  x: 30,
  y: 0.3,
  z: 70,
  rot: -Math.PI / 2,
};

const POSICAO_INICIAL_PISTA_3 = {
  x: 0,
  y: 0.3,
  z: 60,
  rot: -Math.PI / 2,
};

let pistaAtual = null;
let muretasAtuais = [];

// ========== TEXTURAS ==========
const textureLoader = new THREE.TextureLoader();

function carregarTextura(caminho, repX, repY) {
  const tex = textureLoader.load(caminho);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping; // Permite repetir na horizontal
  tex.wrapT = THREE.RepeatWrapping; // Permite repetir na vertical
  tex.repeat.set(repX, repY); // Quantas vezes repete
  return tex;
}

// ========== PISTA 1 - OVAL ==========
export function criarPista1(scene) {
  console.log("Criando Pista 1...");
  limparPistaAtual(scene);

  const group = new THREE.Group();

  try {
    // GRAMA
    // Repetimos 15x15 vezes para a textura ficar detalhada e não um borrão gigante
    const texGrama = carregarTextura("assets/texturas/pista/grama.jpg", 5, 5);
    const materialGrama = new THREE.MeshLambertMaterial({ map: texGrama });

    const grama = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      materialGrama // Usa a textura
    );
    grama.rotation.x = -Math.PI / 2;
    grama.position.set(0, -20.1, 0); // mudança do plano verde, descendo ele para dar altura de -0.1 para -20.1
    grama.receiveShadow = true;
    group.add(grama);

    // BLOCOS DA PISTA ASFALTO
    // repetição 1x1 por bloco de 20 metros
    const texAsfalto = carregarTextura(
      "assets/texturas/pista/asfalto.jpg",
      1,
      1
    );
    const materialPista = new THREE.MeshLambertMaterial({ map: texAsfalto });

    const cubeGeometry = new THREE.BoxGeometry(20, 0.1, 20);
    const altura = 0.0;
    const inicio = -90;
    const fim = 90;

    // Criação do chão da pista
    for (let x = inicio; x <= fim; x += 20) {
      // parte inferior (sul) - pula x=0 para colocar a linha de chegada
      if (x !== 0) {
        let bloco = new THREE.Mesh(cubeGeometry, materialPista);
        bloco.position.set(x, altura, 100);
        bloco.receiveShadow = true;
        group.add(bloco);
      }

      // parte superior (norte)
      let blocoTopo = new THREE.Mesh(cubeGeometry, materialPista);
      blocoTopo.position.set(x, altura, -100);
      blocoTopo.receiveShadow = true;
      group.add(blocoTopo);
    }

    for (let z = -80; z <= 80; z += 20) {
      // esquerda
      let blocoE = new THREE.Mesh(cubeGeometry, materialPista);
      blocoE.position.set(-90, altura, z);
      blocoE.receiveShadow = true;
      group.add(blocoE);

      // direita
      let blocoD = new THREE.Mesh(cubeGeometry, materialPista);
      blocoD.position.set(90, altura, z);
      blocoD.receiveShadow = true;
      group.add(blocoD);
    }

    // Linha de largada
    const linha = criarLinhaLargada(0, 100);
    group.add(linha);

    // Criar muretas
    const muretas = criarMuretasPista1(group);
    muretasAtuais = muretas;
    const muros = criarMurosPista1(group);

    criarArvoresPista1(group);

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
    // GRAMA DE FUNDO (ALTERADO PARA AREIA)
    const texGrama = carregarTextura("assets/texturas/pista/areia.jpg", 5, 5);
    const grama = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshLambertMaterial({ map: texGrama })
    );
    grama.rotation.x = -Math.PI / 2;
    grama.position.set(0, -20.1, 0); // mudança do plano verde, descendo ele para dar altura de -0.1 para -20.1
    grama.receiveShadow = true;
    group.add(grama);

    // BLOCOS CINZAS DA PISTA
    const texAsfalto = carregarTextura(
      "assets/texturas/pista/asfalto.jpg",
      1,
      1
    );
    const materialPista = new THREE.MeshLambertMaterial({ map: texAsfalto });
    const cubeGeometry = new THREE.BoxGeometry(20, 0.01, 20);

    const altura = 0.0;
    const offsetX = -110;
    const offsetZ = 50;

    // BLOCOS CINZAS - PAREDE SUL (horizontal)
    for (let x = 1; x <= 10; x++) {
      let bloco = new THREE.Mesh(cubeGeometry, materialPista);
      bloco.position.set(x * 20 + offsetX, altura, 20.0 + offsetZ);
      bloco.receiveShadow = true;
      bloco.castShadow = true;
      group.add(bloco);
    }

    // BLOCOS CINZAS - PAREDE ESQUERDA (vertical)
    for (let z = 0; z >= -9; z--) {
      let bloco = new THREE.Mesh(cubeGeometry, materialPista);
      bloco.position.set(20.0 + offsetX, altura, z * 20 + offsetZ);
      bloco.receiveShadow = true;
      bloco.castShadow = true;
      group.add(bloco);
    }

    // BLOCOS CINZAS - TOPO (horizontal)
    for (let x = 2; x <= 6; x++) {
      let bloco = new THREE.Mesh(cubeGeometry, materialPista);
      bloco.position.set(x * 20 + offsetX, altura, -180.0 + offsetZ);
      bloco.receiveShadow = true;
      bloco.castShadow = true;
      group.add(bloco);
    }

    // BLOCOS CINZAS - continuação TOPO (vertical)
    for (let z = -1.5; z >= -5.5; z -= 1) {
      let bloco = new THREE.Mesh(cubeGeometry, materialPista);
      bloco.position.set(10, altura, z * 20);
      bloco.receiveShadow = true;
      bloco.castShadow = true;
      group.add(bloco);
    }

    // BLOCOS CINZAS - LESTE (horizontal e vertical)
    for (let x = 6; x <= 10; x++) {
      let bloco = new THREE.Mesh(cubeGeometry, materialPista);
      bloco.position.set(x * 20 + offsetX, altura, -60.0 + offsetZ);
      bloco.receiveShadow = true;
      bloco.castShadow = true;
      group.add(bloco);
    }

    for (let z = -3; z <= 0; z++) {
      let bloco = new THREE.Mesh(cubeGeometry, materialPista);
      bloco.position.set(200.0 + offsetX, altura, z * 20 + offsetZ);
      bloco.receiveShadow = true;
      bloco.castShadow = true;
      group.add(bloco);
    }

    // Linha de largada
    const linha = criarLinhaLargada(30, 70);
    group.add(linha);

    // Criar muretas
    const muretas = criarMuretasPista2(group);
    muretasAtuais = muretas;
    const muros = criarMurosPista2(group);

    //Cria Arvores
    criarArvoresPista2(group);
    criarAguaPista2(group);

    scene.add(group);
    pistaAtual = group;

    console.log("Pista 2 criada com sucesso! Formato L");
    return POSICAO_INICIAL_PISTA_2;
  } catch (error) {
    console.error("Erro ao criar Pista 2:", error);
    return POSICAO_INICIAL_PISTA_2;
  }
}

// ========== PISTA 3 ==========
export function criarPista3(scene) {
  console.log("Criando Pista 3...");
  limparPistaAtual(scene);

  const group = new THREE.Group();

  try {
    // GRAMA (ALTERADO PARA PEDRA)
    const texGrama = carregarTextura("assets/texturas/pista/hell.jpg", 5, 5);
    const grama = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshLambertMaterial({ map: texGrama })
    );
    grama.rotation.x = -Math.PI / 2;
    grama.position.set(0, -20.1, 0);
    grama.receiveShadow = true;
    group.add(grama);

    // Linha de largada - Ajustada para z=60
    const linha = criarLinhaLargada(0, 60);
    group.add(linha);

    // Criar blocos, muretas e túnel
    const elementosPista3 = criarMuretasPista3(group);
    muretasAtuais = elementosPista3;
    const muros = criarMurosPista3(group);

    // Cria Árvores
    criarArvoresPista3(group);

    // CRIA JUMPS
    criarJumpsPista3(scene);
    console.log("✅ Jumps adicionados à Pista 3");

    // create a cube
    //let cubeGeometry = new THREE.BoxGeometry(5, 5, 5, 5);
    //let materialTeste = setDefaultMaterial();
    //let cubeTESTE = new THREE.Mesh(cubeGeometry, materialTeste);
    // position the cube
    //cubeTESTE.position.set(-15, 0.1, -60);
    // add the cube to the scene
    //scene.add(cubeTESTE);

    scene.add(group);
    pistaAtual = group;

    console.log("Pista 3 criada com sucesso!");
    return POSICAO_INICIAL_PISTA_3;
  } catch (error) {
    console.error("Erro ao criar Pista 3:", error);
    return POSICAO_INICIAL_PISTA_3;
  }
}

function limparPistaAtual(scene) {
  if (pistaAtual) {
    scene.remove(pistaAtual);
    pistaAtual = null;
  }
  muretasAtuais = [];
  limparAguas();
  limparJumps(scene);
}

export function getMuretas() {
  return muretasAtuais;
}
