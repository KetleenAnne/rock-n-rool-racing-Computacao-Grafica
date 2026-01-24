// veiculos/VeiculoJogador.js
import { VeiculoBase } from "./VeiculoBase.js";

export class VeiculoJogador extends VeiculoBase {
  constructor(scene) {
    const cores = {
      baseInferior: 0x8B0000,     // Vermelho escuro (LAMBERT - fosco)
      baseSuperior: 0xB22222,     // Vermelho (LAMBERT - fosco)
      cabine: 0xFF4500,           // Laranja (PHONG - brilho DESTACA!)
      propulsor: 0x8B0000,        // Vermelho escuro (LAMBERT)
      usarPhongCabine: true       // Apenas cabine com brilho
    };
    
    super(scene, cores, "jogador");
    console.log("Veículo do jogador criado (Lambert + Phong na cabine)");
  }
}