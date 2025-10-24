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
var s1 = createSphere();
s1.position.y = 0.2;
scene.add(s1);

var c1 = createCylinder();
s1.add(c1);

var s2 = createSphere();
c1.add(s2);

var c2 = createCylinder();
s2.add(c2);

var s3 = createSphere();
c2.add(s3);

var c3 = createCylinder();
s3.add(c3);

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
  let sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  let sphereMaterial = setDefaultMaterial("rgba(0, 255, 234, 1)");
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  return sphere;
}

function createCylinder(where) {
  // create a cylinder
  let cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.0, 25);
  let cylinder = new THREE.Mesh(cylinderGeometry, material);
  return cylinder;
}
