// Configurações dos checkpoints para cada pista
// Formato: { poste1: {x, z}, poste2: {x, z} }
// A zona de detecção será uma linha entre os dois postes

// ========== PISTA 1 - OVAL ==========
// 4 checkpoints ao longo do circuito oval
export const CHECKPOINTS_PISTA1 = [
  { poste1: { x: -79, z: 111}, poste2: { x: -79, z: 89 } },      // CP1 - Curva Sul esquerda inferior - Saida da Largada
  { poste1: { x: -102, z: -88 }, poste2: { x: -78, z: -88 } },   // CP2 - Curva Esquerda Superior
  { poste1: { x: 79, z: -112 }, poste2: { x: 79, z: -88 } },     // CP3 - Curva Direita Superior
  { poste1: { x: 102, z: 88 }, poste2: { x: 79, z: 88 } },       // CP4 - Curva Sul direita inferior
];

// ========== PISTA 2 - FORMATO L ==========
// 6 checkpoints seguindo o formato L
export const CHECKPOINTS_PISTA2 = [ //(30,70)
  { poste1: { x: -78, z: 82 }, poste2: { x: -78, z: 58 } },          // CP1 - Curva Sul esquerda inferior - Saida da Largada
  { poste1: { x: -102, z: -117 }, poste2: { x: -78, z: -117 } },     // CP2 - Curva Esquerda Superior
  { poste1: { x: -3, z: -40 }, poste2: { x: 23, z: -40 } },          // CP3 - Antes Curva L
  { poste1: { x: 70, z: 83 }, poste2: { x: 70, z: 57 } },            // CP4 - Antes Linha de Chegada
];

// ========== PISTA 3 - DOIS QUADRADOS ==========
// 4 checkpoints distribuídos pelos dois quadrados
export const CHECKPOINTS_PISTA3 = [
  { poste1: { x: -75, z: 111 }, poste2: { x: -75, z: 89 } },             // CP1 - Curva Sul esquerda inferior - Saida da Largada
  { poste1: { x: -102, z: -285 }, poste2: { x: -78, z: -285 } },         // CP2 - Direita Superior do segundo quadrado
  { poste1: { x: -257, z: -120 }, poste2: { x: -283, z: -120 } },        // CP3 - Esquerda Inferior do segundo quadrado
  { poste1: { x: 40, z: -112 }, poste2: { x: 40, z: -88 } },             // CP4 - Volta pro primeiro
];

// Função helper para adicionar checkpoints facilmente
export function adicionarCheckpoint(listaPista, poste1, poste2) {
  listaPista.push({ poste1, poste2 });
}

// Exemplo de uso:
// adicionarCheckpoint(CHECKPOINTS_PISTA1, { x: 0, z: 60 }, { x: 20, z: 60 });