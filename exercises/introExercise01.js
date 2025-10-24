import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
  createGroundPlaneXZ,
} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(20, 20);
scene.add(plane);

let cube1 = createCube(2, 5.0, 1.0, 0.0);
let cube2 = createCube(3, 9.0, 1.5, 7.0);
// create a cube
let cubeGeometry = createCube(4.0, 0.0, 2.0, 0.0);

//constrols
addControls();

render();
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}

function addControls() {
  // Use this to show information onscreen
  let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();
}

function createCube(size, positionX, positionY, positionZ) {
  // create a cube
  let cubeGeometry = new THREE.BoxGeometry(size, size, size);
  let cube = new THREE.Mesh(cubeGeometry, material);
  // position the cube
  cube.position.set(positionX, positionY, positionZ);
  // add the cube to the scene
  scene.add(cube);
}
