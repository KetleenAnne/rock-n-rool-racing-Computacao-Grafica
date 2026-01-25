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
  }

  carregar(nome, caminho, loop = false, volume = 0.5) {
    const audio = new THREE.Audio(this.listener);

    this.loader.load(caminho, buffer => {
      audio.setBuffer(buffer);
      audio.setLoop(loop);
      audio.setVolume(volume);
    });

    this.sons[nome] = audio;
  }

  tocar(nome) {
    const som = this.sons[nome];
    if (som && !som.isPlaying) {
      som.play();
    }
  }

  parar(nome) {
    const som = this.sons[nome];
    if (som && som.isPlaying) {
      som.stop();
    }
  }

  tocarInicioCorrida() {
    this.toggleStart = !this.toggleStart;
    this.tocar(this.toggleStart ? "start1" : "start2");
  }

  tocarMusica(nome) {
    if (this.musicaAtual) {
      this.musicaAtual.stop();
    }

    this.musicaAtual = this.sons[nome];

    if (this.musicaLigada && this.musicaAtual) {
      this.musicaAtual.play();
    }
  }

  toggleMusica() {
    this.musicaLigada = !this.musicaLigada;

    if (!this.musicaAtual) return;

    if (this.musicaLigada) {
      this.musicaAtual.play();
    } else {
      this.musicaAtual.stop();
    }
  }
}
