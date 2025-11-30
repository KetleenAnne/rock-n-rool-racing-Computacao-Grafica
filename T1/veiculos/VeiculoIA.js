// veiculos/VeiculoIA.js
import { VeiculoBase } from "./VeiculoBase.js";
import { IAInimigo } from "./IAInimigo.js";

export class VeiculoIA extends VeiculoBase {
  constructor(scene, pista) {
    // Cores da IA (materiais LAMBERT - fosco)
    const cores = {
      baseInferior: 0x1C1C1C,     // Cinza escuro
      baseSuperior: 0x00008B,     // Azul escuro
      cabine: 0x4169E1,           // Azul royal (DESTACA!)
      propulsor: 0x00008B
    };
    
    super(scene, cores, false); // false = usar Lambert (fosco)
    
    // Criar controlador de IA
    this.ia = new IAInimigo(this, pista);
    
    console.log("Veículo da IA criado (Lambert)");
  }

  atualizar(deltaTime, jogador) {
    // Atualizar penalização
    this.atualizarPenalizacao(deltaTime);
    
    // IA controla o veículo
    this.ia.atualizar(deltaTime, jogador);
  }
}