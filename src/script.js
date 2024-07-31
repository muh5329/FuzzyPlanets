import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import createUI from './ui';
import planetVertexShader from './shaders/planet/vertex.glsl'
import planetFragmentShader from './shaders/planet/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BuildPlanetFromTraits } from ' ./traits.js'
window.onload = () => loadScene();
const planetParams = {
  type: { value: 2 },
  radius: { value: 20.0 },
  amplitude: { value: 1.19 },
  sharpness: { value: 2.6 },
  offset: { value: -0.016 },
  period: { value: 0.6 },
  persistence: { value: 0.484 },
  lacunarity: { value: 1.8 },
  octaves: { value: 10 },
  undulation: { value: 0.0 },
  ambientIntensity: { value: 0.02 },
  diffuseIntensity: { value: 1 },
  specularIntensity: { value: 2 },
  shininess: { value: 10 },
  lightDirection: { value: new THREE.Vector3(1, 1, 1) },
  lightColor: { value: new THREE.Color(0xffffff) },
  bumpStrength: { value: 1.0 },
  bumpOffset: { value: 0.001 },
  color1: { value: new THREE.Color(0.014, 0.117, 0.279) },
  color2: { value: new THREE.Color(0.080, 0.527, 0.351) },
  color3: { value: new THREE.Color(0.620, 0.516, 0.372) },
  color4: { value: new THREE.Color(0.149, 0.254, 0.084) },
  color5: { value: new THREE.Color(0.150, 0.150, 0.150) },
  transition2: { value: 0.071 },
  transition3: { value: 0.215 },
  transition4: { value: 0.372 },
  transition5: { value: 1.2 },
  blend12: { value: 0.152 },
  blend23: { value: 0.152 },
  blend34: { value: 0.104 },
  blend45: { value: 0.168 }
}

// List of global traits the user has typed out 
let globalTraits = []

/**
 * Earth
 */
const earthParameters = {}
earthParameters.atmosphereDayColor = '#00aaff'
earthParameters.atmosphereTwilightColor = '#ff6600'


function loadScene() {
  console.log('loading scene');
  const clock = new THREE.Clock(true);
  const canvas = document.querySelector('canvas.webgl')
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
  renderer.setSize(window.innerWidth, window.innerHeight);


  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.2;
  camera.position.z = 50;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);

  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass();
  bloomPass.threshold = 0;
  bloomPass.strength = 0.2;
  bloomPass.radius = 0.5;
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);


  const material = new THREE.ShaderMaterial({
    uniforms: planetParams,
    vertexShader: planetVertexShader,
    fragmentShader: planetFragmentShader,
  });

  // Atmosphere
  const atmosphereMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms:
    {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor))
    }
  })


  const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), material);
  planet.geometry.computeTangents();
  scene.add(planet);

  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), atmosphereMaterial);
  atmosphere.scale.set(22.04, 22.04, 22.04)
  scene.add(atmosphere)


  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
  }

  // Events
  window.addEventListener('resize', () => {
    // Resize camera aspect ratio and renderer size to the new window size
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  document.getElementById ("submitEntry").addEventListener ("click", onSubmitInput, false);
  var input = document.getElementById('in_entry');
  input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          e.preventDefault(); // Prevent default form submission
          onSubmitInput(); 
      }
  });


  createUI(planetParams, bloomPass);
  animate();

  console.log('done');
}


export function onSubmitInput(e){
  try{

       // Get the text from the input field
       var text = document.getElementById("in_entry").value.trim();
            
       if (text === "") {
           alert("Please enter some text.");
           return;
       }
       
       // Create a new div element
       var newDiv = document.createElement("div");
       newDiv.classList.add("row");
       newDiv.textContent = text;
       
       // Append the new div to the target container
       var targetContainer = document.getElementById("leftEntries");
       globalTraits.push(text)
       if (targetContainer.children.length >= 6) {
          targetContainer.removeChild(targetContainer.children[1]);
          globalTraits.shift()
       }
       targetContainer.appendChild(newDiv);

       // Clear the input field
       document.getElementById("in_entry").value = "";
        

  } catch (e){
    console.log(e);
  }
}
