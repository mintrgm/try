import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const video = document.createElement('video');
video.src = 'stars.mp4';  // Replace with your video path
video.autoplay = true;     // Ensure the video auto-plays
video.loop = true;         // Make sure it loops
video.muted = true;        // Ensure the video is muted for autoplay
video.play();              // Play the video

// Create a video texture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter; // Prevent video pixelation
videoTexture.magFilter = THREE.LinearFilter; // Prevent video pixelation
videoTexture.format = THREE.RGBFormat; // RGB format

// Set the video as the background of the scene
scene.background = videoTexture;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(17, -1, 13); // Set the position (x, y, z)

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// Add a single directional light
const light = new THREE.DirectionalLight(0xffffff, 1); // White light with full intensity
light.position.set(10, 10, 10); // Position the light source
light.castShadow = true; // Enable shadows from the light
scene.add(light);

// Load 3D model
const loader = new GLTFLoader().setPath('public/level_3d/');
loader.load('level3d.gltf', (gltf) => {
  const mesh = gltf.scene;
  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mesh.position.set(-4, -2, -5);
  scene.add(mesh);

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

// Window resize event listener
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function to animate camera movement
function zoomInToStore() {
  const targetPosition = new THREE.Vector3(-4, -2, -5); // Position of the store's interior
  const zoomTarget = new THREE.Vector3(0, 1, 0); // The target camera is looking at (the center of the store)

  const duration = 2; // Duration of the zoom in seconds
  const initialPosition = camera.position.clone();

  let startTime = null;

  function animateZoom(time) {
    if (!startTime) startTime = time;
    const elapsedTime = (time - startTime) / 1000; // Time in seconds

    if (elapsedTime < duration) {
      const progress = elapsedTime / duration;

      // Smoothly move camera from initial position to the target position
      camera.position.lerpVectors(initialPosition, targetPosition, progress);

      // Smoothly update the controls
      controls.target.lerp(zoomTarget, progress);
      controls.update();

      requestAnimationFrame(animateZoom);
    } else {
      // Ensure the camera reaches the target position exactly
      camera.position.copy(targetPosition);
      controls.target.copy(zoomTarget);
    }
  }

  requestAnimationFrame(animateZoom);
}

// Event listener for the "Explore" button click
document.getElementById('exploreButton').addEventListener('click', () => {
  zoomInToStore();
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
