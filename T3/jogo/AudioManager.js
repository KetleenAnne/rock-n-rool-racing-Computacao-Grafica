import * as THREE from "three";

export class AudioManager {
  constructor(camera, loadingManager = null) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);

    // O LoadingManager monitora o progresso do download dos sons
    this.loader = new THREE.AudioLoader(loadingManager);
    
    this.sons = {};
    this.musicaAtual = null;
    this.musicaLigada = true;
    this.toggleStart = false;
    this.desbloqueado = false;
  }

  carregar(nome, caminho, loop = false, volume = 0.5) {
    const audio = new THREE.Audio(this.listener);

    this.loader.load(
      caminho,
      (buffer) => {
        audio.setBuffer(buffer);
        audio.setLoop(loop);
        audio.setVolume(volume);
        this.sons[nome] = audio;
      },
      undefined,
      (error) => {
        console.error(`Erro ao carregar áudio "${nome}":`, error);
      }
    );

    return audio;
  }

  // Método crucial para navegadores modernos
  desbloquear() {
    if (this.listener.context.state === "suspended") {
      this.listener.context.resume().then(() => {
        console.log("🔊 Contexto de áudio ativado!");
        this.desbloqueado = true;
      });
    } else {
      this.desbloqueado = true;
    }
  }

  tocar(nome) {
    const som = this.sons[nome];
    if (!som) {
      console.warn(`Som "${nome}" não registrado.`);
      return;
    }

    if (!som.buffer) return; // Ainda não carregou

    if (som.isPlaying) {
      som.stop();
    }

    this.desbloquear(); // Tenta desbloquear sempre que tocar um efeito
    som.play();
  }

  parar(nome) {
    const som = this.sons[nome];
    if (som && som.isPlaying) {
      som.stop();
    }
  }

  tocarInicioCorrida() {
    this.toggleStart = !this.toggleStart;
    const nomeSom = this.toggleStart ? "start1" : "start2";
    this.tocar(nomeSom);
  }

  tocarMusica(nome) {
    // Para a música anterior
    if (this.musicaAtual && this.musicaAtual.isPlaying) {
      this.musicaAtual.stop();
    }

    const novaMusica = this.sons[nome];
    
    if (!novaMusica || !novaMusica.buffer) {
      console.warn(`Música "${nome}" não pronta.`);
      return;
    }

    this.musicaAtual = novaMusica;

    if (this.musicaLigada) {
      this.desbloquear();
      this.musicaAtual.play();
    }
  }

  toggleMusica() {
    this.musicaLigada = !this.musicaLigada;

    if (!this.musicaAtual) return;

    if (this.musicaLigada) {
      this.desbloquear();
      if (!this.musicaAtual.isPlaying && this.musicaAtual.buffer) {
        this.musicaAtual.play();
      }
    } else {
      if (this.musicaAtual.isPlaying) {
        this.musicaAtual.stop();
      }
    }
  }
}