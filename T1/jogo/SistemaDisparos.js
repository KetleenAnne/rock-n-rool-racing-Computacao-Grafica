// jogo/SistemaDisparos.js
import * as THREE from "three";

export class SistemaDisparos {
  constructor(scene) {
    this.scene = scene;
    this.projeteis = [];
    this.velocidadeProjetil = 80.0;
  }

  criarDisparo(veiculo) {
    if (!veiculo.gastarDisparo()) {
      return null; // Sem munição
    }

    // Criar esfera vermelha com brilho (Phong)
    const geo = new THREE.SphereGeometry(0.3, 16, 16);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Posição inicial (na frente do veículo)
    const direcao = veiculo.getDirecaoFrente();
    mesh.position.copy(veiculo.position);
    mesh.position.y += 0.5;
    mesh.position.add(direcao.multiplyScalar(2)); // 2 unidades à frente

    this.scene.add(mesh);

    // Criar objeto projétil
    const projetil = {
      mesh: mesh,
      direcao: veiculo.getDirecaoFrente().clone(),
      dono: veiculo,
      ativo: true,
    };

    this.projeteis.push(projetil);

    console.log(
      `Disparo criado! Munição restante: ${veiculo.disparosDisponiveis}`
    );
    return projetil;
  }

  atualizar(deltaTime, veiculos, muretas) {
    for (let i = this.projeteis.length - 1; i >= 0; i--) {
      const proj = this.projeteis[i];

      if (!proj.ativo) continue;

      // Mover projétil
      const movimento = proj.direcao
        .clone()
        .multiplyScalar(this.velocidadeProjetil * deltaTime);
      proj.mesh.position.add(movimento);

      let colidiu = false;

      // Verificar colisão com veículos
      for (let veiculo of veiculos) {
        if (veiculo === proj.dono) continue;

        const distancia = proj.mesh.position.distanceTo(veiculo.position);
        if (distancia < 1.5) {
          veiculo.aplicarDano();
          this.removerProjetil(i);
          colidiu = true;
          break;
        }
      }

      if (colidiu) continue;

      // ========== VERIFICAÇÃO DE COLISÃO MELHORADA ==========
      if (proj.ativo) {
        const posProj = proj.mesh.position;
        
        for (let mureta of muretas) {
          if (!mureta || !mureta.mesh) continue;
          
          // MÉTODO 1: BoundingBox expandida
          if (!mureta.boundingBox) {
            mureta.boundingBox = new THREE.Box3().setFromObject(mureta.mesh);
            mureta.boundingBox.expandByScalar(0.8); // Aumentei para 0.8
          }
          
          if (mureta.boundingBox.containsPoint(posProj)) {
            this.removerProjetil(i);
            colidiu = true;
            break;
          }
          
          // MÉTODO 2: Distância do centro (fallback para pontas)
          if (!colidiu && mureta.posicao) {
            const distMureta = Math.sqrt(
              Math.pow(posProj.x - mureta.posicao.x, 2) + 
              Math.pow(posProj.z - mureta.posicao.z, 2)
            );
            
            // Se muito perto do centro da mureta, remove
            if (distMureta < 2.0) { // Raio de 2 unidades
              this.removerProjetil(i);
              colidiu = true;
              break;
            }
          }
        }
      }

      if (colidiu) continue;

      // Remover se muito longe
      if (proj.ativo && proj.mesh.position.length() > 200) {
        this.removerProjetil(i);
      }
    }
  }

  removerProjetil(index) {
    const proj = this.projeteis[index];
    if (proj && proj.mesh) {
      this.scene.remove(proj.mesh);
      proj.mesh.geometry.dispose();
      proj.mesh.material.dispose();
    }
    this.projeteis.splice(index, 1);
  }

  limparTodos() {
    for (let i = this.projeteis.length - 1; i >= 0; i--) {
      this.removerProjetil(i);
    }
  }
}
