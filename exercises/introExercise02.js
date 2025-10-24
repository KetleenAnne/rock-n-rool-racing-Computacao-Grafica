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

// create a cube
let cubeGeometry = createCube(4.0, 0.0, 2.0, 0.0);
// create a sphere
let sphere = createSphere(3, -7.0, 3.0, 7.0);
//create cylinder
let cylinder = createCylinder(2, 8.0, 8.0, 4.0);

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

function createCylinder(radiusTop, height, positionX, positionY, positionZ) {
  // create a cylinder
  let cylinderGeometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusTop,
    height,
    32
  );
  let cylinderMaterial = setDefaultMaterial("rgba(255, 0, 234, 1)");
  let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  // position the cylinder
  cylinder.position.set(positionX, positionY, positionZ);
  // add the cylinder to the scene
  scene.add(cylinder);
  return cylinder;
}
