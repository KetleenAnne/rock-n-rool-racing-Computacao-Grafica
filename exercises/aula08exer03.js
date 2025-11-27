import * as THREE from "three";
import Stats from "../build/jsm/libs/stats.module.js";
import GUI from "../libs/util/dat.gui.module.js";
import { TrackballControls } from "../build/jsm/controls/TrackballControls.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  createGroundPlane,
  onWindowResize,
} from "../libs/util/util.js";

import { CSG } from "../libs/other/CSGMesh.js";
var scene = new THREE.Scene();
var stats = new Stats(); // para mostrar FPS information
var renderer = initRenderer(); // View function in util/utils
renderer.setClearColor("rgb(30, 30, 40)");

// Inicializa a câmera
var camera = initCamera(new THREE.Vector3(4, -8, 8));
camera.up.set(0, 0, 1);

window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

// Variável Global para a Luz  para mover a luz via GUI)
let light = initDefaultBasicLight(
  scene,
  true,
  new THREE.Vector3(12, -15, 20),
  28,
  1024
);
var groundPlane = createGroundPlane(20, 20); // width and height (x, y)
groundPlane.receiveShadow = true; // Permite que o plano receba sombras
scene.add(groundPlane);

// Show axes
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

var trackballControls = new TrackballControls(camera, renderer.domElement);

// Variável para a caneca
let mesh1;

buildObjects();
buildInterface();
render();

// Função auxiliar para atualizar a matriz do objeto -----------necessário para CSG
function updateObject(mesh) {
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
}

function buildObjects() {
  let auxMat = new THREE.Matrix4();
  let csgObject, canecaCSG, cilindroCorpoCSG, cilindroFuroCSG, alcaCSG;

  // Material Brilhante
  const materialCaneca = new THREE.MeshPhongMaterial({
    color: "lightblue",
    specular: "rgb(255, 255, 255)",
    shininess: 100,
    side: THREE.DoubleSide,
  });

  //  Corpo da Caneca (Cilindro Maior)
  const alturaCorpo = 3.0;
  const raioCorpo = 1.0;
  let cilindroCorpoMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(raioCorpo, raioCorpo, alturaCorpo, 32)
  );

  // Rotação: O cilindro nasce com Y vertical. Precisamos rotacioná-lo para que Z seja vertical.
  cilindroCorpoMesh.rotateX(THREE.MathUtils.degToRad(90));

  // Posição Z: A base do cilindro deve estar em Z=0. O centro do cilindro deve estar em Z = altura/2.
  cilindroCorpoMesh.position.set(0, 0, alturaCorpo / 2);
  updateObject(cilindroCorpoMesh);
  cilindroCorpoCSG = CSG.fromMesh(cilindroCorpoMesh);

  //  Furo (Cilindro Menor)
  const raioFuro = raioCorpo * 0.9;
  let cilindroFuroMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(raioFuro, raioFuro, alturaCorpo + 0.05, 32)
  );

  // Rotação: Igual ao corpo
  cilindroFuroMesh.rotateX(THREE.MathUtils.degToRad(90));

  // Posição Z: mais alto para garantir o corte da borda superior.
  cilindroFuroMesh.position.set(0, 0, alturaCorpo / 2 + 0.025);
  updateObject(cilindroFuroMesh);
  cilindroFuroCSG = CSG.fromMesh(cilindroFuroMesh);

  // Subtrair para criar o corpo oco
  canecaCSG = cilindroCorpoCSG.subtract(cilindroFuroCSG);

  // Alça (Torus)
  const raioExternoAlca = 0.5;
  const tuboAlca = 0.15;
  let alcaMesh = new THREE.Mesh(
    new THREE.TorusGeometry(raioExternoAlca, tuboAlca, 32, 32)
  );

  // Rotação: O Torus nasce no plano XY. Rotacionamos para o plano XZ (vertical).
  alcaMesh.rotateX(THREE.MathUtils.degToRad(90));
  alcaMesh.rotateY(THREE.MathUtils.degToRad(90));

  // Posição: Deslocamento no eixo Y (lateral) e Z (altura).
  const offsetAlcaY = raioCorpo + tuboAlca; // Ajustado para encostar
  const offsetAlcaZ = alturaCorpo / 2;

  alcaMesh.position.set(0, offsetAlcaY, offsetAlcaZ);
  updateObject(alcaMesh);
  alcaCSG = CSG.fromMesh(alcaMesh);

  //  União para finalizar a Caneca
  csgObject = canecaCSG.union(alcaCSG);

  // Converter para Mesh e Adicionar à Cena
  mesh1 = CSG.toMesh(csgObject, auxMat);
  mesh1.material = materialCaneca;
  mesh1.castShadow = true;
  mesh1.receiveShadow = true;
  // Rotação para melhor visualização
  // mesh1.rotation.z = THREE.MathUtils.degToRad(45);
  scene.add(mesh1);
}

function buildInterface() {
  var controls = new (function () {
    this.wire = false;
    // Posição inicial da luz para os controles:
    this.lightX = light.position.x;
    this.lightY = light.position.y;
    this.lightZ = light.position.z;

    this.onWireframeMode = function () {
      mesh1.material.wireframe = this.wire;
    };

    this.updateLightPosition = function () {
      light.position.set(this.lightX, this.lightY, this.lightZ);
      // Mostrar a posição da luz em relação à câmera
      console.log(
        `Light Position: X=${this.lightX}, Y=${this.lightY}, Z=${this.lightZ}`
      );
    };
  })();

  // GUI interface
  var gui = new GUI();

  // Controles de luz para posicionar o brilho especular
  let lightFolder = gui.addFolder("Controle de Luz (Brilho)");
  lightFolder
    .add(controls, "lightX", -20, 20)
    .name("Posição X")
    .onChange(function (e) {
      controls.updateLightPosition();
    });
  lightFolder
    .add(controls, "lightY", -20, 20)
    .name("Posição Y")
    .onChange(function (e) {
      controls.updateLightPosition();
    });
  lightFolder
    .add(controls, "lightZ", -20, 50)
    .name("Posição Z")
    .onChange(function (e) {
      controls.updateLightPosition();
    });
  lightFolder.open(); // Abre a pasta de controle de luz

  // Controle de Wireframe
  gui
    .add(controls, "wire", false)
    .name("Wireframe")
    .onChange(function (e) {
      controls.onWireframeMode();
    });
}

function render() {
  stats.update(); // Update FPS
  trackballControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
