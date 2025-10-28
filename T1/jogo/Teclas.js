import { OrbitControls } from "../../build/jsm/controls/OrbitControls.js";
import { onWindowResize, InfoBox } from "../../libs/util/util.js";
import { criarPista1, criarPista2 } from "./Pista.js";

let pistaAtualNum = 1;

export function addControls(camera, renderer, scene, veiculo) {
  const orbit = new OrbitControls(camera, renderer.domElement);

  // Centralizar controles na Pista 1 (70x68)
  orbit.target.set(69, 0, 67);
  orbit.update();

  window.addEventListener(
    "resize",
    () => onWindowResize(camera, renderer),
    false
  );

  // Controle de troca de pistas
  window.addEventListener("keydown", (event) => {
    if (event.key === "1" && pistaAtualNum !== 1) {
      pistaAtualNum = 1;
      const posInicial = criarPista1(scene);
      resetarVeiculo(veiculo, posInicial);

      // Recentralizar camera na Pista 1
      orbit.target.set(69, 0, 67);
      camera.position.set(69, 50, 140);
      orbit.update();

      console.log("Pista 1 carregada");
    } else if (event.key === "2" && pistaAtualNum !== 2) {
      pistaAtualNum = 2;
      const posInicial = criarPista2(scene);
      resetarVeiculo(veiculo, posInicial);

      // Recentralizar camera na Pista 2
      orbit.target.set(41, 0, 35);
      camera.position.set(41, 35, 90);
      orbit.update();
    }
  });

  // Caixa de informações
  const controls = new InfoBox();
  controls.add("Rock'n Roll Racing 3D - T1");
  controls.addParagraph();
  controls.add("Use o mouse para interagir:");
  controls.add("* BotÃ£o esquerdo: rotaciona");
  controls.add("* BotÃ£o direito: movimenta (pan)");
  controls.add("* Scroll: zoom in/out");
  controls.addParagraph();
  controls.add("Trocar pistas:");
  controls.add("* Tecla 1: Pista 1 (70x68)");
  controls.add("* Tecla 2: Pista 2 (42x36)");
  controls.show();

  return orbit;
}

function resetarVeiculo(veiculo, posicao) {
  if (veiculo && veiculo.position) {
    veiculo.position.set(posicao.x, posicao.y, posicao.z);
    veiculo.rotation.y = 0; // Resetar rotação
  }
}

export function getPistaAtual() {
  return pistaAtualNum;
}
