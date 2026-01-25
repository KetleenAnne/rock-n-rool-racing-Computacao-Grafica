import * as THREE from "three";

export class AudioManager {
  constructor(camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);

    this.loader = new THREE.AudioLoader();
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
        console.log(`Áudio "${nome}" carregado com sucesso!`);
      },
      undefined,
      (error) => {
        console.error(`Erro ao carregar "${nome}" de "${caminho}":`, error);
      }
    );

    return audio;
  }

  desbloquear() {
    if (this.listener.context.state === "suspended") {
      this.listener.context.resume().then(() => {
        console.log("🔊 Contexto de áudio desbloqueado!");
        this.desbloqueado = true;
      });
    } else {
      this.desbloqueado = true;
    }
  }

  tocar(nome) {
    const som = this.sons[nome];
    if (!som) {
      console.warn(`Som "${nome}" não encontrado`);
      return;
    }

    if (!som.buffer) {
      console.warn(`Som "${nome}" ainda não foi carregado`);
      return;
    }

    if (som.isPlaying) {
      som.stop();
    }

    this.desbloquear();
    som.play();
    console.log(`Tocando: ${nome}`);
  }

  parar(nome) {
    const som = this.sons[nome];
    if (som && som.isPlaying) {
      som.stop();
      console.log(`Parado: ${nome}`);
    }
  }

  tocarInicioCorrida() {
    this.toggleStart = !this.toggleStart;
    const nomeSom = this.toggleStart ? "start1" : "start2";
    console.log(`Tocando início da corrida: ${nomeSom}`);
    this.tocar(nomeSom);
  }

  tocarMusica(nome) {
    console.log(`🎵 Tentando tocar música: ${nome}`);
    
    // Parar música atual se existir
    if (this.musicaAtual && this.musicaAtual.isPlaying) {
      this.musicaAtual.stop();
      console.log("Música anterior parada");
    }

    const novaMusica = this.sons[nome];
    
    if (!novaMusica) {
      console.warn(`Música "${nome}" não encontrada`);
      return;
    }

    if (!novaMusica.buffer) {
      console.warn(`Música "${nome}" ainda não foi carregada`);
      return;
    }

    this.musicaAtual = novaMusica;

    if (this.musicaLigada) {
      this.desbloquear();
      this.musicaAtual.play();
      console.log(`Música "${nome}" tocando!`);
    }
  }

  toggleMusica() {
    this.musicaLigada = !this.musicaLigada;
    console.log(`🎵 Música ${this.musicaLigada ? "LIGADA" : "DESLIGADA"}`);

    if (!this.musicaAtual) {
      console.warn(" Nenhuma música carregada para toggle");
      return;
    }

    if (this.musicaLigada && this.musicaAtual.buffer) {
      this.desbloquear();
      if (!this.musicaAtual.isPlaying) {
        this.musicaAtual.play();
      }
    } else if (this.musicaAtual.isPlaying) {
      this.musicaAtual.stop();
    }
  }
}