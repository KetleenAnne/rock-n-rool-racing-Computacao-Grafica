import * as THREE from "three";

class SistemaCheckpoints {
  constructor() {
    this.scene = null; // Inicialmente null
    this.checkpoints = [];
    this.checkpointAtual = 0;
    this.todosCheckpointsColetados = false;
    this.grupoCheckpoints = new THREE.Group();
  }

  criarCheckpointVisual(poste1Pos, poste2Pos, numero) {
    const group = new THREE.Group();

    // Calcular centro e distância entre os postes
    const centroX = (poste1Pos.x + poste2Pos.x) / 2;
    const centroZ = (poste1Pos.z + poste2Pos.z) / 2;
    const largura = Math.sqrt(
      Math.pow(poste2Pos.x - poste1Pos.x, 2) + 
      Math.pow(poste2Pos.z - poste1Pos.z, 2)
    );
    
    // Calcular rotação da linha entre os postes
    const angulo = Math.atan2(
      poste2Pos.z - poste1Pos.z, 
      poste2Pos.x - poste1Pos.x
    );

    // ========== POSTES DO PORTAL ==========
    const posteGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const posteMat = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3,
    });

    const poste1 = new THREE.Mesh(posteGeo, posteMat);
    poste1.position.set(poste1Pos.x, 4, poste1Pos.z);
    poste1.castShadow = true;
    poste1.receiveShadow = true;

    const poste2 = new THREE.Mesh(posteGeo, posteMat);
    poste2.position.set(poste2Pos.x, 4, poste2Pos.z);
    poste2.castShadow = true;
    poste2.receiveShadow = true;

    group.add(poste1, poste2);

    // ========== BARRA SUPERIOR ==========
    const barraGeo = new THREE.BoxGeometry(largura, 0.5, 0.5);
    const barraMat = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3,
    });
    const barra = new THREE.Mesh(barraGeo, barraMat);
    barra.position.set(centroX, 8, centroZ);
    barra.rotation.y = angulo;
    barra.castShadow = true;
    barra.receiveShadow = true;
    group.add(barra);

    // ========== ZONA DE DETECÇÃO - LINHA ENTRE OS POSTES ==========
    const zonaGeo = new THREE.BoxGeometry(largura, 8, 2);
    const zonaMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.0, // Invisível no jogo (mude para 0.3 para debug)
    });
    const zona = new THREE.Mesh(zonaGeo, zonaMat);
    zona.position.set(centroX, 4, centroZ);
    zona.rotation.y = angulo;
    group.add(zona);

    // Dados do checkpoint
    const checkpointData = {
      mesh: zona, // Mesh para detecção de colisão
      group: group, // Grupo visual completo
      poste1: poste1Pos,
      poste2: poste2Pos,
      centro: { x: centroX, z: centroZ },
      numero: numero,
      coletado: false,
    };

    return checkpointData;
  }

  // Configurar checkpoints da pista
  setCheckpoints(configCheckpoints) {
    // Verificar se scene está definida
    if (!this.scene) {
      console.error("Scene não foi definida no SistemaCheckpoints!");
      return;
    }

    // Limpar checkpoints anteriores
    this.limparCheckpoints();

    // Criar novos checkpoints
    configCheckpoints.forEach((config, index) => {
      const cp = this.criarCheckpointVisual(
        config.poste1,
        config.poste2,
        index + 1
      );
      this.checkpoints.push(cp);
      this.grupoCheckpoints.add(cp.group);
    });

    // Adicionar grupo à cena
    this.scene.add(this.grupoCheckpoints);

    this.checkpointAtual = 0;
    this.todosCheckpointsColetados = false;
    this.atualizarVisibilidade();
  }

  // Verificar se o veículo passou pelo checkpoint
  verificarPassagem(posicaoVeiculo) {
    if (this.todosCheckpointsColetados) return { completo: true };

    const cpAtivo = this.checkpoints[this.checkpointAtual];
    if (!cpAtivo) return { completo: false };

    // Verificar colisão com a zona do checkpoint
    const bbox = new THREE.Box3().setFromObject(cpAtivo.mesh);
    const pontoVeiculo = new THREE.Vector3(
      posicaoVeiculo.x,
      posicaoVeiculo.y,
      posicaoVeiculo.z
    );

    if (bbox.containsPoint(pontoVeiculo) && !cpAtivo.coletado) {
      cpAtivo.coletado = true;
      this.checkpointAtual++;

      console.log(`✓ Checkpoint ${cpAtivo.numero} coletado!`);

      // Completou todos os checkpoints?
      if (this.checkpointAtual >= this.checkpoints.length) {
        this.todosCheckpointsColetados = true;
        console.log("✓ Todos os checkpoints coletados!");
        return { completo: true, ultimo: true };
      }

      this.atualizarVisibilidade();
      return {
        completo: false,
        proximo: this.checkpointAtual + 1,
        total: this.checkpoints.length,
      };
    }

    return { completo: this.todosCheckpointsColetados };
  }

  // Atualizar visibilidade dos checkpoints
  atualizarVisibilidade() {
    this.checkpoints.forEach((cp, index) => {
      const postes = cp.group.children.filter(
        (child) => child.geometry.type === "CylinderGeometry"
      );
      const barra = cp.group.children.find(
        (child) => child.geometry.type === "BoxGeometry"
      );

      if (index === this.checkpointAtual) {
        // ========== CHECKPOINT ATIVO - VERDE BRILHANTE ==========
        postes.forEach((poste) => {
          poste.material.color.set(0x00ff00);
          poste.material.emissive.set(0x00ff00);
          poste.material.emissiveIntensity = 0.5;
        });
        if (barra) {
          barra.material.color.set(0x00ff00);
          barra.material.emissive.set(0x00ff00);
          barra.material.emissiveIntensity = 0.5;
        }
        cp.group.visible = true;
      } else if (index < this.checkpointAtual) {
        // ========== JÁ COLETADO - CINZA ==========
        postes.forEach((poste) => {
          poste.material.color.set(0x444444);
          poste.material.emissive.set(0x000000);
          poste.material.emissiveIntensity = 0;
        });
        if (barra) {
          barra.material.color.set(0x444444);
          barra.material.emissive.set(0x000000);
          barra.material.emissiveIntensity = 0;
        }
        cp.group.visible = true;
      } else {
        // ========== PRÓXIMOS - INVISÍVEL ==========
        cp.group.visible = false;
      }
    });
  }

  // Resetar para nova volta
  reset() {
    this.checkpointAtual = 0;
    this.todosCheckpointsColetados = false;
    this.checkpoints.forEach((cp) => {
      cp.coletado = false;
    });
    this.atualizarVisibilidade();
    console.log("Checkpoints resetados para nova volta");
  }

  // Obter progresso atual
  getProgresso() {
    return {
      atual: this.checkpointAtual,
      total: this.checkpoints.length,
      completo: this.todosCheckpointsColetados,
    };
  }

  // Limpar checkpoints da cena
  limparCheckpoints() {
    if (this.scene && this.grupoCheckpoints) {
      this.scene.remove(this.grupoCheckpoints);
    }
    
    this.checkpoints.forEach((cp) => {
      this.grupoCheckpoints.remove(cp.group);
    });
    
    this.checkpoints = [];
    this.checkpointAtual = 0;
    this.todosCheckpointsColetados = false;
  }
}

// Instância única do sistema
const sistemaCheckpoints = new SistemaCheckpoints();

export default sistemaCheckpoints;