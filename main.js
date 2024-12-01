import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a2a); // Deep blue for nighttime

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(20, 10, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Lush Green Floor
const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30), // Smaller ground
  new THREE.MeshStandardMaterial({ color: 0x003300 }) // Dark green for nighttime
);
grass.rotation.x = -Math.PI / 2;
scene.add(grass);

// Dim Nighttime Lights
const ambientLight = new THREE.AmbientLight(0x404080, 0.2); // Dim cool light
scene.add(ambientLight);

const moonlight = new THREE.DirectionalLight(0x9999ff, 0.5); // Soft moonlight
moonlight.position.set(-10, 20, -10);
scene.add(moonlight);

// Load Big Tree Model
const loader = new GLTFLoader();
let treePosition = { x: 0, y: 0, z: 0 };

loader.load(
  'https://trystan211.github.io/ite18_dexter_act3/low-poly_game-ready_spruce_tree.glb', // Replace with an actual tree model URL
  (gltf) => {
    const tree = gltf.scene;
    tree.position.set(treePosition.x, treePosition.y, treePosition.z);
    tree.scale.set(3, 3, 3); // Scale the tree appropriately
    scene.add(tree);
  },
  undefined,
  (error) => console.error('Error loading tree model:', error)
);

// Small Black Stones (For Raycasting)
const stones = [];
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 30 - 15; // Adjusted to match smaller ground
  const z = Math.random() * 30 - 15;

  const stone = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 0.5, 16, 16),
    stoneMaterial
  );
  stone.position.set(x, 0.2, z);
  stone.castShadow = true; // Enable shadows for stones
  stones.push(stone);
  scene.add(stone);
}

// Add Fireflies
const fireflyCount = 100;
const fireflies = [];
const minDistanceFromTree = 5; // Minimum distance fireflies spawn from the tree

for (let i = 0; i < fireflyCount; i++) {
  let x, z;

  // Ensure fireflies are not too close to the tree
  do {
    x = Math.random() * 30 - 15;
    z = Math.random() * 30 - 15;
  } while (Math.sqrt((x - treePosition.x) ** 2 + (z - treePosition.z) ** 2) < minDistanceFromTree);

  const light = new THREE.PointLight(0xffff33, 0.5, 10); // Bright yellow light
  light.position.set(x, Math.random() * 5 + 2, z);
  fireflies.push(light);
  scene.add(light);
}

// Raycasting Setup
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onPointerClick() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(stones);

  if (intersects.length > 0) {
    // Change color of the intersected stone
    const stone = intersects[0].object;
    stone.material.color.set(0xff0000); // Red color

    // Revert the stone color back after 2 seconds
    setTimeout(() => {
      stone.material.color.set(0x333333); // Original color
    }, 2000);
  }
}

window.addEventListener('mousemove', onPointerMove);
window.addEventListener('click', onPointerClick);

// Animation Loop
const clock = new THREE.Clock();

const animate = () => {
  // Animate fireflies
  fireflies.forEach((light) => {
    const time = clock.getElapsedTime();
    light.position.x += Math.sin(time * Math.random()) * 0.1;
    light.position.y += Math.cos(time * Math.random()) * 0.1;
    light.position.z += Math.sin(time * Math.random()) * 0.1;
  });

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

