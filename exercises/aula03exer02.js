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

// create Sphere

for (let i = 0; i < 12; i++) {
  var sphere = createSphere();
  sphere.position.y = 0.5;
  // sphere.position.x = Math.sin((i * 30 * Math.PI) / 180) * 6;
  // sphere.position.z = Math.cos((i * 30 * Math.PI) / 180) * 6;
  sphere.rotateY((i * 30 * Math.PI) / 180);
  // sphere.rotateZ((i * 30 * Math.PI) / 180);
  sphere.translateX(6);
}

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

function createSphere() {
  // create a sphere
  let sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  let sphereMaterial = setDefaultMaterial("rgba(0, 255, 234, 1)");
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  // position the sphere
  // sphere.position.set(positionX, positionY, positionZ);
  // add the sphere to the scene
  scene.add(sphere);
  return sphere;
}
