import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import createUI from './ui';
import planetVertexShader from './shaders/planet/vertex.glsl'
import planetFragmentShader from './shaders/planet/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'
import fieryVertexShader from './shaders/fiery/vertex.glsl'
import fieryFragmentShader from './shaders/fiery/fragment.glsl'
import generalPurposeVertex from './shaders/fiery/generalPurposeVertex.glsl'
import simpleTunnelFragement from './shaders/fiery/simpleTunnelFragement.glsl'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import  BuildPlanetFromTraits  from './traits.js';



var tuniform = {
  iGlobalTime:    { type: 'f', value: 0.1 },
  iChannel0:  { type: 't', value: THREE.ImageUtils.loadTexture( 'textures/tex1.jpg') },
  iChannel1:  { type: 't', value: THREE.ImageUtils.loadTexture( 'textures/inf.jpg' ) },
};

tuniform.iChannel0.value.wrapS = tuniform.iChannel0.value.wrapT = THREE.RepeatWrapping;
tuniform.iChannel1.value.wrapS = tuniform.iChannel1.value.wrapT = THREE.RepeatWrapping;


var mat = new THREE.ShaderMaterial( {
  uniforms: generalPurposeVertex,
  vertexShader: generalPurposeVertex,
  fragmentShader: simpleTunnelFragement,            
  side:THREE.DoubleSide
} );

var tobject = new THREE.Mesh( new THREE.PlaneGeometry(700, 394,1,1), mat);
this.scene.add(this.tobject);
tuniform.iGlobalTime.value += clock.getDelta();

/**
 * Earth
 */
const earthParameters = {}
earthParameters.atmosphereDayColor = '#00aaff'
earthParameters.atmosphereTwilightColor = '#ff6600'

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
  color6: { value: new THREE.Color(0.636, 0.762, 0.902) },
  transition2: { value: 0.071 },
  transition3: { value: 0.215 },
  transition4: { value: 0.372 },
  transition5: { value: 1.2 },
  transition6: { value: 2.16 },
  blend12: { value: 0.152 },
  blend23: { value: 0.152 },
  blend34: { value: 0.104 },
  blend45: { value: 0.168 },
  blend56: { value: 0.403 },
  atmosphere: false
}
// List of global traits the user has typed out 
let globalTraits = []

class Scene {
  constructor(){
    this.clock = new THREE.Clock(true);
    this.canvas = document.querySelector('canvas.webgl')
    
    this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true
      })
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.2;
    this.camera.position.z = 50;

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);

    this.composer.addPass(this.renderPass);

    this.bloomPass = new UnrealBloomPass();
    this.bloomPass.threshold = 0;
    this.bloomPass.strength = 0.2;
    this.bloomPass.radius = 0.5;
    this.composer.addPass(this.bloomPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);


    this.material = new THREE.ShaderMaterial({
      uniforms: planetParams,
      vertexShader: planetVertexShader,
      fragmentShader: planetFragmentShader,
    });

    // Atmosphere
    this.atmosphereMaterial = new THREE.ShaderMaterial({
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


    this.planet = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), this.material);
    this.planet.geometry.computeTangents();
    this.scene.add(this.planet);

    this.atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), this.atmosphereMaterial);
    this.atmosphere.scale.set(22.04, 22.04, 22.04)
    
    
    // Events
    window.addEventListener('resize', () => {
      // Resize camera aspect ratio and renderer size to the new window size
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.getElementById ("submitEntry").addEventListener ("click", onSubmitInput, false);
    var input = document.getElementById('in_entry');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            onSubmitInput(); 
        }
    });

    createUI(planetParams, this.bloomPass);
    console.log('done');
  }

  /**
   * Special case function  , does not have access to 'this' qualifier 
   *  after returning from requestAnimaionFrame
   */
  animate() {
    requestAnimationFrame(scene.animate);
    scene.controls.update();
    scene.composer.render();
  }

  remove_atmosphere(){
    this.scene.remove(this.atmosphere)
  }

  add_atmosphere(){
    this.scene.add(this.atmosphere)
  }

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
      
       // Apply new Transform
       let newBasePlanetParams = BuildPlanetFromTraits(globalTraits);
       applyTraitsToPlanetParams(newBasePlanetParams)
       updateLayers()
      
  } catch (e){
    console.log(e);
  }
}

function applyTraitsToPlanetParams(newBasePlanetParams){
  for (const key in newBasePlanetParams) {
    if (newBasePlanetParams.hasOwnProperty(key) && planetParams[key].hasOwnProperty("value")) { 
      planetParams[key]["value"] = newBasePlanetParams[key]["value"]
    }  else {
      planetParams[key] = newBasePlanetParams[key]
    }
  }
}

function updateLayers(){ 
  if (planetParams.atmosphere == true){
    scene.add_atmosphere()
  } else if (planetParams.atmosphere == false) {
    scene.remove_atmosphere()
  }
}

let scene = new Scene();
scene.animate();