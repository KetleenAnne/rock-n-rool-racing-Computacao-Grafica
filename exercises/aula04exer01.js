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
import GUI from "../libs/util/dat.gui.module.js";
import Stats from "../build/jsm/libs/stats.module.js";
import { TrackballControls } from "../build/jsm/controls/TrackballControls.js";

var stats = new Stats();
let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
var trackballControls = new TrackballControls(camera, renderer.domElement);
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

// controls for the animation
var animateSphere1 = false;
var animateSphere2 = false;
var reset = false;

// positions
var initialPosition1 = [4, 0.4, 9];
var initialPosition2 = [-4, 0.4, 9];

var finalPosition1 = [4, 0.4, -9];
var finalPosition2 = [-4, 0.4, -9];

// create a sphere
var sphere1 = createSphere(
  initialPosition1[0],
  initialPosition1[1],
  initialPosition1[2]
);
var sphere2 = createSphere(
  initialPosition2[0],
  initialPosition2[1],
  initialPosition2[2]
);

addControls();
buildInterface();
render();

function render() {
  stats.update(); // Update FPS
  trackballControls.update();
  moveSpheres();
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}

function moveSpheres() {
  if (animateSphere1) {
    lerpSpere(sphere1, finalPosition1, 0.05);
  }
  if (animateSphere2) {
    lerpSpere(sphere2, finalPosition2, 0.01);
  }
}

function lerpSpere(sphere, destination, alpha) {
  sphere.position.lerp(
    new THREE.Vector3(destination[0], destination[1], destination[2]),
    alpha
  );
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

function createSphere(positionX, positionY, positionZ) {
  // create a sphere
  let sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  let sphereMaterial = setDefaultMaterial("rgba(0, 255, 234, 1)");
  let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  // position the sphere
  sphere.position.set(positionX, positionY, positionZ);
  // add the sphere to the scene
  scene.add(sphere);
  return sphere;
}

function buildInterface() {
  var controls = new (function () {
    this.onAnimateSphere1 = function () {
      animateSphere1 = !animateSphere1;
      //resetSpheres = false;
    };

    this.onAnimateSphere2 = function () {
      animateSphere2 = !animateSphere2;
      // resetSpheres = false;
    };

    this.onReset = function () {
      reset = true;
      animateSphere1 = false;
      animateSphere2 = false;
      sphere1.position.set(
        initialPosition1[0],
        initialPosition1[1],
        initialPosition1[2]
      );
      sphere2.position.set(
        initialPosition2[0],
        initialPosition2[1],
        initialPosition2[2]
      );
    };
  })();

  // GUI interface
  var gui = new GUI();
  gui.add(controls, "onAnimateSphere1", true).name("Animate Sphere 1");
  gui.add(controls, "onAnimateSphere2", true).name("Animate Sphere 2");
  gui.add(controls, "onReset", false).name("Reset Spheres");
}
