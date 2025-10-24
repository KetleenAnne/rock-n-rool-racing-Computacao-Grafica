import * as THREE from "three";
import { initRenderer } from "../../libs/util/util.js";
import { setupScene } from "./setup/Scene.js";
import { setupCamera } from "./setup/Camera.js";
import { startLoop } from "./setup/Loop.js";
import { addControls } from "./jogo/Teclas.js";

let scene = new THREE.Scene();

let renderer = initRenderer();
let camera = setupCamera();

setupScene(scene);
addControls(camera, renderer);
startLoop(renderer, scene, camera);
