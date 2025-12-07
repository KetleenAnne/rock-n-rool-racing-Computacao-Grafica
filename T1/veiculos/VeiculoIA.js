// veiculos/VeiculoIA.js
import { VeiculoBase } from "./VeiculoBase.js";
import { IAInimigo } from "./IAInimigo.js";

export class VeiculoIA extends VeiculoBase {
  constructor(scene, pista) {
    // Cores da IA (materiais LAMBERT - fosco)
// IA: Base Lambert + Cabine Phong (destaque)
    const cores = {
      baseInferior: 0x1C1C1C,     // Cinza escuro (LAMBERT - fosco)
      baseSuperior: 0x00008B,     // Azul escuro (LAMBERT - fosco)
      cabine: 0x4169E1,           // Azul royal (PHONG - brilho DESTACA!)
      propulsor: 0x00008B,        // Azul escuro (LAMBERT)
      usarPhongCabine: true       // Apenas cabine com brilho
    };
    
    super(scene, cores, "ia");
    this.ia = new IAInimigo(this, pista);
    console.log("Veículo da IA criado (Lambert + Phong na cabine)");
  }

  atualizar(deltaTime, jogador) {
    // Atualizar penalização
    this.atualizarPenalizacao(deltaTime);
    
    // IA controla o veículo
    this.ia.atualizar(deltaTime, jogador);
  }
}