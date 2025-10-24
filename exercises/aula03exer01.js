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

defineAxes(scene, 12);
definePlane();

// create a cube
var boxGeometry = new THREE.BoxGeometry(11, 0.3, 6);
var cube = createCube(boxGeometry, 0.0, 3.0, 0.0);
defineAxes(cube, 9);

//create cylinder
var cylinder01 = createCylinder(5, -1.5, -2.5, cube);
var cylinder02 = createCylinder(-5, -1.5, -2.5, cube);
var cylinder03 = createCylinder(5, -1.5, 2.5, cube);
var cylinder04 = createCylinder(-5, -1.5, 2.5, cube);

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

function defineAxes(where, size) {
  // Show axes (parameter is size of each axis)
  let axesHelper = new THREE.AxesHelper(size);
  where.add(axesHelper);
}

function definePlane() {
  // create the ground plane
  let plane = createGroundPlaneXZ(20, 20);
  scene.add(plane);
}

function createCube(boxGeometry, positionX, positionY, positionZ) {
  let cube = new THREE.Mesh(boxGeometry, material);
  // position the cube
  cube.position.set(positionX, positionY, positionZ);
  // add the cube to the scene
  scene.add(cube);
  return cube;
}

function createCylinder(positionX, positionY, positionZ, where) {
  // create a cylinder
  let cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 32);
  let cylinder = new THREE.Mesh(cylinderGeometry, material);
  // cube.add(cylinder);

  // position the cylinder
  cylinder.position.set(positionX, positionY, positionZ);
  // add the cylinder to the scene
  where.add(cylinder);
  return cylinder;
}
