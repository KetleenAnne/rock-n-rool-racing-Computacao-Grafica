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

let spacing = 6;
let min = -spacing; // initial position

for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    createCube(2, min + spacing * i, 1, min + spacing * j);
  }
}

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

function createSphere(radius, positionX, positionY, positionZ) {
  // create a sphere
  let sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  let sphereMaterial = setDefaultMaterial("rgba(0, 255, 234, 1)");
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  // position the sphere
  sphere.position.set(positionX, positionY, positionZ);
  // add the sphere to the scene
  scene.add(sphere);
}
