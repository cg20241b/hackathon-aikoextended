// Import necessary modules from Three.js
import * as THREE from './node_modules/three/build/three.module.js';
import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube setup (light source)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 0, 0);

// Font loader for text meshes
const fontLoader = new FontLoader();

// Define your favorite color and complementary color
const alphabetColor = new THREE.Color(0x3498db); // Example color for the alphabet
const digitColor = new THREE.Color(0xe74c3c); // Complementary color for the digit

// Ambient intensity calculation from student ID (last 3 digits are assumed to be 456 for example)
const ambientIntensity = 0.656; // Example, using "456" -> ambientIntensity = 0.656

// Load font and create 3D text meshes for the alphabet and digit
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
  // Alphabet Text Mesh (example with 'A')
  const alphabetGeometry = new TextGeometry('A', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const alphabetMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ambientIntensity: { value: ambientIntensity },
      lightPosition: { value: cube.position }, // Light position is the cube's position
    },
    vertexShader: `
      uniform vec3 lightPosition;
      varying vec3 vLightWeighting;
      void main() {
        vec3 transformedNormal = normalize(normalMatrix * normal);
        vec3 lightDirection = normalize(lightPosition - vec3(modelViewMatrix * vec4(position, 1.0)));
        vLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float ambientIntensity;
      varying vec3 vLightWeighting;
      void main() {
        vec3 diffuseColor = vec3(0.8, 0.4, 0.1); // Base color
        vec3 specularColor = vec3(1.0, 1.0, 1.0); // Specular highlight color
        vec3 ambient = ambientIntensity * diffuseColor;
        vec3 diffuse = vLightWeighting * diffuseColor;
        vec3 specular = pow(vLightWeighting, 16.0) * specularColor; // Shiny highlight
        gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
      }
    `,
  });
  const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
  alphabetMesh.position.set(-3, 1, 0);
  scene.add(alphabetMesh);

  // Digit Text Mesh (example with '2')
  const digitGeometry = new TextGeometry('2', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const digitMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ambientIntensity: { value: ambientIntensity },
      lightPosition: { value: cube.position }, // Light position is the cube's position
    },
    vertexShader: `
      uniform vec3 lightPosition;
      varying vec3 vLightWeighting;
      void main() {
        vec3 transformedNormal = normalize(normalMatrix * normal);
        vec3 lightDirection = normalize(lightPosition - vec3(modelViewMatrix * vec4(position, 1.0)));
        vLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float ambientIntensity;
      varying vec3 vLightWeighting;
      void main() {
        vec3 diffuseColor = vec3(0.8, 0.4, 0.1); // Base color
        vec3 specularColor = vec3(0.9, 0.9, 0.9); // Specular highlight color (Metallic)
        vec3 ambient = ambientIntensity * diffuseColor;
        vec3 diffuse = vLightWeighting * diffuseColor;
        vec3 specular = pow(vLightWeighting, 16.0) * specularColor; // Shiny highlight
        gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
      }
    `,
  });
  const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
  digitMesh.position.set(3, 1, 0);
  scene.add(digitMesh);
});

// Camera and cube movement logic
camera.position.z = 5;

// Event listener for key press to move the camera
document.addEventListener('keydown', (event) => {
  if (event.key === 'a') {
    camera.position.x -= 0.1; // Move camera left
  }
  if (event.key === 'd') {
    camera.position.x += 0.1; // Move camera right
  }
  if (event.key === 'w') {
    cube.position.y += 0.1; // Move cube up
  }
  if (event.key === 's') {
    cube.position.y -= 0.1; // Move cube down
  }
});

// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube for some animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Update light position for shaders
  scene.children.forEach(child => {
    if (child.isMesh && child.material.uniforms) {
      child.material.uniforms.lightPosition.value = cube.position;
    }
  });

  renderer.render(scene, camera);
}

animate();
