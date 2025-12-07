// veiculos/VeiculoIA.js
import { VeiculoBase } from "./VeiculoBase.js";
import { IAInimigo } from "./IAInimigo.js";

export class VeiculoIA extends VeiculoBase {
  constructor(scene, pista) {
    // IA: Cinza/Azul
    // Lambert (fosco): Base inferior, propulsor
    // Phong (brilho): Base superior, cabine, hélice
    const cores = {
      baseInferior: 0x1C1C1C,     // Cinza escuro (LAMBERT - fosco)
      baseSuperior: 0x00008B,     // Azul escuro (PHONG - brilho médio)
      cabine: 0x4169E1,           // Azul royal (PHONG - brilho ALTO!)
      propulsor: 0x00008B         // Azul escuro (LAMBERT - fosco)
    };
    
    super(scene, cores, "ia");
    this.ia = new IAInimigo(this, pista);
    console.log("🤖 Veículo da IA criado (Azul - Lambert + Phong)");
  }

  atualizar(deltaTime, jogador) {
    // Atualizar penalização
    this.atualizarPenalizacao(deltaTime);
    
    // IA controla o veículo
    this.ia.atualizar(deltaTime, jogador);
  }
}