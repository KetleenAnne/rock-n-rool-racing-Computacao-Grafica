// veiculos/VeiculoJogador.js
import { VeiculoBase } from "./VeiculoBase.js";

export class VeiculoJogador extends VeiculoBase {
  constructor(scene) {
    // Cores do jogador (materiais PHONG - com brilho)
    const cores = {
      baseInferior: 0x000000,     // Preto
      baseSuperior: 0x8B0000,     // Vermelho escuro
      cabine: 0xFF4500,           // Laranja-vermelho (DESTACA!)
      propulsor: 0x8B0000
    };
    
    super(scene, cores, true); // true = usar Phong (brilho)
    
    console.log("Veículo do jogador criado (Phong)");
  }

  // Métodos específicos do jogador serao adicionados aqui
}