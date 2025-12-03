// FPS.js
let container = null;
let fpsElement = null;
let frames = 0;
let prevTime = performance.now();

export function setupFPSCounter() {
  container = document.createElement("div");
  container.style.cssText =
    "POSITION: fixed; TOP: 10px; LEFT: 10px; CURSOR: pointer; OPACITY: 0.9; Z-INDEX: 10000; BACKGROUND-COLOR: rgba(0,0,0,0.5); COLOR: lime; PADDING: 5px; FONT-FAMILY: monospace; FONT-WEIGHT: bold;";
  document.body.appendChild(container);

  fpsElement = document.createElement("div");
  fpsElement.innerHTML = "FPS: --";
  container.appendChild(fpsElement);
}

export function updateFPS() {
  frames++;
  const time = performance.now();

  // Atualiza a cada segundo
  if (time >= prevTime + 1000) {
    // fps = número de frames em 1 segundo
    const fps = Math.round((frames * 1000) / (time - prevTime));
    fpsElement.innerHTML = "FPS: " + fps;
    prevTime = time;
    frames = 0;
  }
}
export function removeFPSCounter() {
  if (container) {
    document.body.removeChild(container);
    container = null;
    fpsElement = null;
    frames = 0;
    prevTime = performance.now();
  }
}
