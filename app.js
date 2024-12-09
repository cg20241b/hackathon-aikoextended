import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// Init
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Webgl render
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Letter shaders
const letterMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPos: { value: new THREE.Vector3(0, 0, 3) }, // Posisi sumber cahaya lebih dekat
    baseColor: { value: new THREE.Vector3(0.0, 0.0, 1.0) }, // Warna Biru
    ambientIntensity: { value: 0.262 }, // 200 + 062
    cameraPos: { value: new THREE.Vector3() },
  },
  vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  fragmentShader: `
      uniform vec3 lightPos;
      uniform vec3 baseColor;
      uniform float ambientIntensity;
      uniform vec3 cameraPos;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        // Ambient
        vec3 ambient = baseColor * ambientIntensity;
        
        // Diffuse
        vec3 lightDir = normalize(lightPos - vPosition);
        float diff = max(dot(vNormal, lightDir), 0.0);
        vec3 diffuse = diff * baseColor;
        
        // Specular (Plastic)
        vec3 viewDir = normalize(cameraPos - vPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
        vec3 specular = vec3(0.5) * spec; // White specular for plastic
        
        gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
      }
    `,
});

// Number shaders
const numberMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightPos: { value: new THREE.Vector3(0, 0, 3) }, // Posisi sumber cahaya lebih dekat
    baseColor: { value: new THREE.Vector3(1.0, 1.0, 0.0) }, // Warna Kuning
    ambientIntensity: { value: 0.262 }, //
    cameraPos: { value: new THREE.Vector3() },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 lightPos;
    uniform vec3 baseColor;
    uniform float ambientIntensity;
    uniform vec3 cameraPos;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
    // Ambient
    vec3 ambient = baseColor * ambientIntensity;
    
    // Diffuse
    vec3 lightDir = normalize(lightPos - vPosition);
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse = diff * baseColor;
    
    // Specular (Metallic)
    vec3 viewDir = normalize(cameraPos - vPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
    vec3 specular = baseColor * spec; // Colored specular for metal
    
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
    }
  `,
});

// Add box and camera
const cubeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    glowColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
  },
  vertexShader: `
      varying vec3 vPosition;
      
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  fragmentShader: `
      uniform vec3 glowColor;
      varying vec3 vPosition;
      
      void main() {
        float intensity = 1.0 - length(vPosition) * 0.5;
        gl_FragColor = vec4(glowColor * intensity, 1.0);
      }
    `,
});

var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
var cube = new THREE.Mesh(geometry, cubeMaterial);
scene.add(cube);
camera.position.z = 5;

// Load font from CDN
const loader = new FontLoader();
const fontUrl = './fonts/Poppins_Regular.json';

loader.load(fontUrl, function (font) {
  const letterGeometry = new TextGeometry("P", {
    font: font,
    size: 1,
    height: 0.2,
  });
  const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
  letterMesh.position.x = -2;
  scene.add(letterMesh);

  const numberGeometry = new TextGeometry("2", {
    font: font,
    size: 1,
    height: 0.2,
  });
  const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
  numberMesh.position.x = 2;
  scene.add(numberMesh);
});

// Record keyboard
const keyState = {};
document.addEventListener("keydown", (e) => (keyState[e.key] = true));
document.addEventListener("keyup", (e) => (keyState[e.key] = false));

// Animation loop
var animate = function () {
  requestAnimationFrame(animate);

  // Update cube position
  if (keyState["w"]) cube.position.y += 0.05;
  if (keyState["s"]) cube.position.y -= 0.05;
  if (keyState["a"]) camera.position.x -= 0.05;
  if (keyState["d"]) camera.position.x += 0.05;

  // Update renders based on positions
  letterMaterial.uniforms.lightPos.value.copy(cube.position);
  numberMaterial.uniforms.lightPos.value.copy(cube.position);
  letterMaterial.uniforms.cameraPos.value.copy(camera.position);
  numberMaterial.uniforms.cameraPos.value.copy(camera.position);

  renderer.render(scene, camera);
};

// Resize window handling (update cameras)
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
animate();
