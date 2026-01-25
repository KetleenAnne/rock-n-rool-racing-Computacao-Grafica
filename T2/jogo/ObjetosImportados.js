import * as THREE from "three";
import { GLTFLoader } from "../../build/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
let objetosAtivos = [];

/**
 * Carrega um objeto, posiciona na pista e adiciona ao sistema de colisão
 */
function carregarObjetoNaPista(caminho, escala, posicoes, group, arrayColisao) {
  loader.load(
    caminho,
    function (gltf) {
      const modelo = gltf.scene;

      // Habilita sombras
      modelo.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      posicoes.forEach((pos) => {
        const clone = modelo.clone();

        // Configuração visual
        clone.scale.set(escala, escala, escala);

        // Posição
        const alturaY = pos.y !== undefined ? pos.y : 0.05;
        clone.position.set(pos.x, alturaY, pos.z);

        clone.rotation.y = Math.random() * Math.PI * 2; // Rotação aleatória

        group.add(clone);
        objetosAtivos.push(clone);

        // === FÍSICA ===
        // Adiciona ao array de 'muretas' para o Loop.js calcular colisão e reduzir velocidade
        if (arrayColisao) {
          arrayColisao.push({
            mesh: clone,
            tipo: "obstaculo", // Tipo genérico, a física usa o BoundingBox
            posicao: { x: pos.x, z: pos.z },
          });
        }
      });
    },
    null,
    function (error) {
      console.error("Erro ao carregar objeto:", caminho, error);
    }
  );
}

// ========== CONFIGURAÇÃO PISTA 1 (Pneu e Cone) ==========
export function carregarObjetosPista1(group, arrayColisao) {
  // Objeto 1: Pneus
  carregarObjetoNaPista(
    "assets/texturas/objetos/pneu.glb",
    1.5, // Escala
    [
      { x: 10, z: 100 },
      { x: -10, z: -100 },
      { x: 90, z: 0 },
    ],
    group,
    arrayColisao
  );

  // Objeto 2: Cones
  carregarObjetoNaPista(
    "assets/texturas/objetos/cone.glb",
    2.5,
    [
      { x: -20, z: 100 },
      { x: 20, z: -100 },
      { x: -90, z: 0 },
    ],
    group,
    arrayColisao
  );
}

// ========== CONFIGURAÇÃO PISTA 2 (Palmeira e Barril) ==========
export function carregarObjetosPista2(group, arrayColisao) {
  // Objeto 3: Palmeiras
  carregarObjetoNaPista(
    "assets/texturas/objetos/palmeira.glb",
    0.15,
    [
      { x: -90, z: 70 },
      { x: 50, z: 70 },
      { x: 10, z: 0 },
    ],
    group,
    arrayColisao
  );

  // Objeto 4: Barris
  carregarObjetoNaPista(
    "assets/texturas/objetos/barril.glb",
    3.0,
    [
      { x: -50, z: 70 },
      { x: 10, z: -80 },
      { x: 50, z: 70 },
    ],
    group,
    arrayColisao
  );
}

// ========== CONFIGURAÇÃO PISTA 3 (Rocha e Caixa) ==========
export function carregarObjetosPista3(group, arrayColisao) {
  // Objeto 5: Rochas
  carregarObjetoNaPista(
    "assets/texturas/objetos/pedra.glb",
    3.0,
    [
      { x: -10, z: 60 }, // Reta Sul (no asfalto)
      { x: 50, z: 0 }, // Reta Leste (no asfalto)
      { x: 30, z: -60 }, // Reta Norte (no asfalto)
    ],
    group,
    arrayColisao
  );

  // Objeto 6: Caixas
  carregarObjetoNaPista(
    "assets/texturas/objetos/caixa.glb",
    1.5,
    [
      { x: -50, y: 0.1, z: 0 },
      { x: 30, y: 0.1, z: 60 },
      { x: -30, y: 0.1, z: -60 },
    ],
    group,
    arrayColisao
  );
}

export function limparObjetosImportados() {
  //   limpamos a referência do array
  objetosAtivos = [];
}
