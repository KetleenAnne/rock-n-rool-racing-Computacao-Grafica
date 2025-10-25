import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";

const ALTURA_MURETA = 0.8;
const ESPESSURA_MURETA = 0.3;
const TAMANHO_QUADRADO = 0.4;

// Criar segmentos de muretas com padrÃ£o xadrez
export function criarSegmentoMureta(posicoes, tamanhoBloco, orientacao = 'horizontal') {
  const group = new THREE.Group();
  
  if (posicoes.length === 0) return group;
  
  // Calcular comprimento total do segmento
  const comprimento = posicoes.length * tamanhoBloco;
  
  // Determinar dimensÃµes baseado na orientaÃ§Ã£o
  const largura = orientacao === 'horizontal' ? comprimento : ESPESSURA_MURETA;
  const profundidade = orientacao === 'horizontal' ? ESPESSURA_MURETA : comprimento;
  
  // Calcular posiÃ§Ã£o central do segmento
  const primeiraPos = posicoes[0];
  const ultimaPos = posicoes[posicoes.length - 1];
  const centroX = ((primeiraPos.x + ultimaPos.x) / 2) * tamanhoBloco;
  const centroZ = ((primeiraPos.z + ultimaPos.z) / 2) * tamanhoBloco;
  
  // Criar padrÃ£o xadrez
  const numQuadradosComprimento = Math.ceil(
    (orientacao === 'horizontal' ? largura : profundidade) / TAMANHO_QUADRADO
  );
  const numQuadradosAltura = Math.ceil(ALTURA_MURETA / TAMANHO_QUADRADO);
  
  for (let h = 0; h < numQuadradosAltura; h++) {
    for (let c = 0; c < numQuadradosComprimento; c++) {
      // PadrÃ£o xadrez
      const cor = (h + c) % 2 === 0 ? "red" : "white";
      
      const geometria = new THREE.BoxGeometry(
        orientacao === 'horizontal' ? TAMANHO_QUADRADO : ESPESSURA_MURETA,
        TAMANHO_QUADRADO,
        orientacao === 'horizontal' ? ESPESSURA_MURETA : TAMANHO_QUADRADO
      );
      
      const material = setDefaultMaterial(cor);
      const quadrado = new THREE.Mesh(geometria, material);
      
      // Posicionar quadrado
      if (orientacao === 'horizontal') {
        const posX = (c * TAMANHO_QUADRADO) - (largura / 2) + (TAMANHO_QUADRADO / 2);
        quadrado.position.set(posX, (h * TAMANHO_QUADRADO) + (TAMANHO_QUADRADO / 2), 0);
      } else {
        const posZ = (c * TAMANHO_QUADRADO) - (profundidade / 2) + (TAMANHO_QUADRADO / 2);
        quadrado.position.set(0, (h * TAMANHO_QUADRADO) + (TAMANHO_QUADRADO / 2), posZ);
      }
      
      group.add(quadrado);
    }
  }
  
  group.position.set(centroX, 0, centroZ);
  
  return {
    mesh: group,
    posicoes: posicoes,
    orientacao: orientacao
  };
}

// Linha de largada VERTICAL (perpendicular ao sentido da corrida)
export function criarLinhaLargada(x, z, profundidade = 2) {
  const group = new THREE.Group();
  const tamanhoQuadrado = 1.0;
  const numColunas = profundidade; // Profundidade da linha (ao longo do eixo Z)
  const numLinhas = 8; // Largura da linha (ao longo do eixo X)
  
  for (let col = 0; col < numColunas; col++) {
    for (let lin = 0; lin < numLinhas; lin++) {
      const geometria = new THREE.PlaneGeometry(
        tamanhoQuadrado * 0.95, 
        tamanhoQuadrado * 0.95
      );
      
      // PadrÃ£o xadrez
      const cor = (col + lin) % 2 === 0 ? "white" : "black";
      const material = setDefaultMaterial(cor);
      
      const quadrado = new THREE.Mesh(geometria, material);
      quadrado.rotation.x = -Math.PI / 2;
      
      // Posicionar VERTICALMENTE (linha perpendicular ao movimento)
      // Linha ao longo do eixo X, profundidade no eixo Z
      quadrado.position.set(
        x - (numLinhas * tamanhoQuadrado / 2) + (lin * tamanhoQuadrado) + (tamanhoQuadrado / 2),
        0.02,
        z - (profundidade * tamanhoQuadrado / 2) + (col * tamanhoQuadrado) + (tamanhoQuadrado / 2)
      );
      
      group.add(quadrado);
    }
  }
  
  return group;
}

export function verificarColisao(posicaoVeiculo, muretas, raioVeiculo = 0.8) {
  for (let mureta of muretas) {
    if (!mureta.mesh || !mureta.posicoes) continue;
    
    const bbox = new THREE.Box3().setFromObject(mureta.mesh);
    const pontoVeiculo = new THREE.Vector3(posicaoVeiculo.x, posicaoVeiculo.y, posicaoVeiculo.z);
    
    bbox.expandByScalar(raioVeiculo);
    
    if (bbox.containsPoint(pontoVeiculo)) {
      const centro = new THREE.Vector3();
      bbox.getCenter(centro);
      
      const dx = posicaoVeiculo.x - centro.x;
      const dz = posicaoVeiculo.z - centro.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      return {
        colidiu: true,
        mureta: mureta,
        normal: { 
          x: dist > 0 ? dx / dist : 0, 
          z: dist > 0 ? dz / dist : 0 
        }
      };
    }
  }
  
  return { colidiu: false };
}