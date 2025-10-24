export function startLoop(renderer, scene, camera) {
  render();
  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}
