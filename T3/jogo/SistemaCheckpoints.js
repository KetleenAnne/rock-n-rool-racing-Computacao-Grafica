import * as THREE from "three";

class SistemaCheckpoints {
  constructor() {
    this.scene = null;
    this.checkpoints = [];
    this.checkpointAtual = 0;
    this.todosCheckpointsColetados = false;
    this.grupoCheckpoints = new THREE.Group();

    // Carrega a textura
    const loader = new THREE.TextureLoader();
    const baseTex = loader.load("assets/texturas/objetos/checkpoint.jpg");
    baseTex.colorSpace = THREE.SRGBColorSpace;

    // ========== TEXTURA POSTES (Vertical) ==========
    // Necessário para a textura não ficar esticada e borrada no poste alto
    this.texPoste = baseTex.clone();
    this.texPoste.wrapS = THREE.RepeatWrapping;
    this.texPoste.wrapT = THREE.RepeatWrapping;
    this.texPoste.repeat.set(1, 3); // Repete 3x na altura

    // ========== TEXTURA BARRA (Horizontal) ==========
    this.texBarra = baseTex.clone();
    this.texBarra.wrapS = THREE.RepeatWrapping;
    this.texBarra.wrapT = THREE.RepeatWrapping;
    this.texBarra.repeat.set(1, 1); // Repete 1x na largura
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

    // ========== CONFIGURAÇÃO DE MATERIAIS ==========

    // ATIVO: Menos "neon", mais textura
    const matAtivoPoste = new THREE.MeshPhongMaterial({
      color: 0xffffff, // Base branca para mostrar a cor real da imagem
      map: this.texPoste,
      emissive: 0x004400, // Verde ESCURO
      emissiveIntensity: 0.5,
      specular: 0x222222, // Reflexo baixo para não ofuscar
      shininess: 30,
    });

    const matAtivoBarra = matAtivoPoste.clone();
    matAtivoBarra.map = this.texBarra; // Usa o mapa horizontal

    // Cinza claro (não preto) para ver a textura desligada
    const matInativoPoste = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa, // Cinza CLARO
      map: this.texPoste,
      emissive: 0x000000, // Sem luz própria
      specular: 0x111111,
      shininess: 10,
    });

    const matInativoBarra = matInativoPoste.clone();
    matInativoBarra.map = this.texBarra;

    // ========== POSTES ==========
    const alturaPoste = 28;
    const posteGeo = new THREE.CylinderGeometry(0.5, 0.5, alturaPoste, 16);

    // Começa com material INATIVO (será trocado no update)
    const poste1 = new THREE.Mesh(posteGeo, matInativoPoste.clone());
    poste1.position.set(poste1Pos.x, -6.1, poste1Pos.z);
    poste1.castShadow = true;
    poste1.receiveShadow = true;

    const poste2 = new THREE.Mesh(posteGeo, matInativoPoste.clone());
    poste2.position.set(poste2Pos.x, -6.1, poste2Pos.z);
    poste2.castShadow = true;
    poste2.receiveShadow = true;

    group.add(poste1, poste2);

    // ========== BARRA ==========
    const barraGeo = new THREE.BoxGeometry(largura, 0.8, 0.8);
    const barra = new THREE.Mesh(barraGeo, matInativoBarra.clone());
    barra.position.set(centroX, 7.9, centroZ);
    barra.rotation.y = angulo;
    barra.castShadow = true;
    barra.receiveShadow = true;
    group.add(barra);

    // ========== ZONA INVISÍVEL ==========
    const zonaGeo = new THREE.BoxGeometry(largura, alturaPoste, 2);
    const zona = new THREE.Mesh(
      zonaGeo,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    zona.position.set(centroX, -6.1, centroZ);
    zona.rotation.y = angulo;
    group.add(zona);

    return {
      mesh: zona,
      group: group,
      poste1: poste1,
      poste2: poste2,
      barra: barra,
      // materiais para troca rápida
      matAtivoPoste: matAtivoPoste,
      matAtivoBarra: matAtivoBarra,
      matInativoPoste: matInativoPoste,
      matInativoBarra: matInativoBarra,
      numero: numero,
      coletado: false,
    };
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
        this.atualizarVisibilidade();
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

  atualizarVisibilidade() {
    this.checkpoints.forEach((cp, index) => {
      //  Troca os materiais inteiros em vez de mudar cor (seguro para texturas)

      if (index === this.checkpointAtual) {
        // === ATIVO (Verde Suave) ===
        cp.poste1.material = cp.matAtivoPoste;
        cp.poste2.material = cp.matAtivoPoste;
        cp.barra.material = cp.matAtivoBarra;
        cp.group.visible = true;
      } else if (index < this.checkpointAtual) {
        // === JÁ PASSOU (Cinza Claro) ===
        cp.poste1.material = cp.matInativoPoste;
        cp.poste2.material = cp.matInativoPoste;
        cp.barra.material = cp.matInativoBarra;
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
    if (this.scene && this.grupoCheckpoints)
      this.scene.remove(this.grupoCheckpoints);
    this.checkpoints.forEach((cp) => this.grupoCheckpoints.remove(cp.group));
    this.checkpoints = [];
    this.checkpointAtual = 0;
    this.todosCheckpointsColetados = false;
  }
}

const sistemaCheckpoints = new SistemaCheckpoints();
export default sistemaCheckpoints;
