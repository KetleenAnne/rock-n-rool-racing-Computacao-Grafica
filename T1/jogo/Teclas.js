import { OrbitControls } from "../../build/jsm/controls/OrbitControls.js";
import { onWindowResize, InfoBox } from "../../libs/util/util.js";

export function addControls(camera, renderer) {
  const orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

  window.addEventListener(
    "resize",
    () => onWindowResize(camera, renderer),
    false
  );

  //  Caixa de informações
  const controls = new InfoBox();
  controls.add("Rock'n Roll Racing 3D - T1");
  controls.addParagraph();
  controls.add("Use o mouse para interagir:");
  controls.add("* Botão esquerdo: rotaciona");
  controls.add("* Botão direito: movimenta (pan)");
  controls.add("* Scroll: zoom in/out");
  controls.show();

  return orbit;
}
