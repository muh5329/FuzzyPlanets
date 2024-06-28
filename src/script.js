import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import planetVertexShader from './shaders/planet/vertex.glsl'
import planetFragmentShader from './shaders/planet/fragment.glsl'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import MarchingCubes from './marching_cubes/marching-cubes.js'


const ISO_LEVEL = 0;

const WIDTH = 60;
const HEIGHT = WIDTH;
const DEPTH = WIDTH;
let globalSetup = {};
class Terrain {
    constructor(width, height, depth, sampleSize) {
        this.xMax = Math.floor(width / (2 * sampleSize));
        this.yMax = Math.floor(height / (2 * sampleSize));
        this.zMax = Math.floor(depth / (2 * sampleSize));
        this.sampleSize = sampleSize;

        this.xMax2 = 2 * this.xMax;
        this.yMax2 = 2 * this.yMax;
        this.zMax2 = 2 * this.zMax;
        this.fieldBuffer = new Float32Array((this.xMax + 1) * (this.yMax + 1) * (this.zMax + 1) * 8);

        // noise values
        this.numOctaves = 4;
        this.lacunarity = 2;
        this.persistence = 0.5;
        this.noiseScale = 2;
        this.noiseWeight = 7;
        this.floorOffset = 5;
        this.weightMultiplier = 3.6;
        this.simplex = new SimplexNoise();

        // graphics
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.marchingCubes = new MarchingCubes(this.xMax, this.yMax, this.zMax, sampleSize);

        // generate mesh geometry
        this.generateHeightField();
        this.marchingCubes.generateMesh(this.geometry, ISO_LEVEL, this);
    }

    setField(i, j, k, amt) {
        this.fieldBuffer[i * this.xMax2 * this.zMax2 + k * this.zMax2 + j] = amt;
    }

    getField(i, j, k) {
        return this.fieldBuffer[i * this.xMax2 * this.zMax2 + k * this.zMax2 + j];
    }

    getMesh() {
        return this.mesh;
    }

    makeShape(brushSize, point, multiplier) {
        for (let x = -brushSize - 2; x <= brushSize + 2; x++) {
            for (let y = -brushSize - 2; y <= brushSize + 2; y++) {
                for (let z = -brushSize - 2; z <= brushSize + 2; z++) {
                    let distance = this.#sphereDistance(point.clone(), new THREE.Vector3(point.x + x, point.y + y, point.z + z), brushSize);
                    if (distance < 0) {
                        let xi = Math.round(point.x + x) + this.xMax;
                        let yi = Math.round(point.y + y) + this.yMax;
                        let zi = Math.round(point.z + z) + this.zMax;

                        this.setField(xi, yi, zi, this.getField(xi, yi, zi) - distance * multiplier);
                    }
                }
            }
        }
        this.regenerateMesh();
    }

    regenerateMesh() {
        this.marchingCubes.generateMesh(this.geometry, ISO_LEVEL, this);
    }

    generateHeightField() {
        for (let i = -this.xMax; i < this.xMax + 1; i++) {
            let x = i * this.sampleSize;
            for (let j = -this.yMax; j < this.yMax + 1; j++) {
                let y = j * this.sampleSize;
                for (let k = -this.zMax; k < this.zMax + 1; k++) {
                    let z = k * this.sampleSize;
                    this.setField(i + this.xMax, j + this.yMax, k + this.zMax, this.#heightValue(x, y, z));
                }
            }
        }
    }

    #heightValue(x, y, z) {
        let offsetNoise = 1;
        let noise = 0;

        let frequency = this.noiseScale / 100;
        let amplitude = 1;
        let weight = 1;
        for (var j = 0; j < this.numOctaves; j++) {
            let n = this.simplex.noise3D(
                (x + offsetNoise) * frequency,
                (y + offsetNoise) * frequency,
                (z + offsetNoise) * frequency,
            );
            let v = 1 - Math.abs(n);
            v = v * v * weight;
            weight = Math.max(Math.min(v * this.weightMultiplier, 1), 0);
            noise += v * amplitude;
            amplitude *= this.persistence;
            frequency *= this.lacunarity;
        }

        let finalVal = -(y + this.floorOffset) + noise * this.noiseWeight;

        return -finalVal;
    }

    #sphereDistance = (spherePos, point, radius) => {
        return spherePos.distanceTo(point) - radius;
    }
}



 function setup ()  {

    /**
     * Base
     */
    // Debug
    const gui = new GUI()
    // Canvas
    const canvas = document.querySelector('canvas.webgl')
    // Scene
    const scene = new THREE.Scene()
    // Loaders
    const textureLoader = new THREE.TextureLoader()
    const uniforms = {
        uTime: new  THREE.Uniform(0),
        uStrength: new THREE.Uniform(2.0),
        uPositionFrequency: new THREE.Uniform(0.2),
        uWarpFrequency: new THREE.Uniform(5),
        uWarpStrength: new THREE.Uniform(0.5),
        uNoiseMinValue: new THREE.Uniform(0.00001),
        uOceans:new THREE.Uniform(true),
    }
    /**
     * Planet
     */
    // Mesh
    let planetGeometry = new THREE.IcosahedronGeometry(2.5, 50)
    planetGeometry = mergeVertices(planetGeometry)
    planetGeometry.computeTangents()
    const planetMaterial = new CustomShaderMaterial({
        // CSM
        baseMaterial: THREE.MeshStandardMaterial,
        silent: true,
        vertexShader: planetVertexShader,
        fragmentShader: planetFragmentShader,
        uniforms,
        // MeshStandardMaterial
        metalness: 0,
        roughness: 0.5,
        color: '#85d534'
    })

    const planetDepthMaterial = new CustomShaderMaterial({
        // CSM
        baseMaterial: THREE.MeshStandardMaterial,
        silent: true,
        vertexShader: planetVertexShader,
        fragmentShader: planetFragmentShader,
        // MeshDepthMaterial
        depthPacking: THREE.RGBADepthPacking
    })

    const planet = new THREE.Mesh(planetGeometry, planetMaterial)
    planet.customDepthMaterial = planetDepthMaterial
    scene.add(planet)
    gui.add(uniforms.uPositionFrequency, 'value', 0, 1, 0.001).name('uPositionFrequency')
    gui.add(uniforms.uStrength, 'value', 0, 10, 0.001).name('uStrength')


    gui.add(uniforms.uWarpFrequency, 'value', 0, 10, 0.001).name('uWarpFrequency')
    gui.add(uniforms.uWarpStrength, 'value', 0, 1, 0.001).name('uWarpStrength')
    gui.add(uniforms.uNoiseMinValue, 'value', 0.0000001, 1, 0.000001).name('uNoiseMinValue')
    


    var planetProperties = {
        haveOcean: true,
    }

    gui.add( planetProperties, 'haveOcean' ).onChange( ()  => uniforms.uOceans = planetProperties.haveOcean ) 	// checkbox

    // // add terrain
    // const terrain = new Terrain(WIDTH, HEIGHT, DEPTH, 1);
    // scene.add(terrain.getMesh());


    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.far = 15
    directionalLight.shadow.normalBias = 0.05
    directionalLight.position.set(0.25, 2, - 2.25)
    scene.add(directionalLight)


    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: Math.min(window.devicePixelRatio, 2)
    }

    window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
        sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(sizes.pixelRatio)
    })

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 12
    camera.position.y = 5
    camera.position.z = 4
    scene.add(camera)

    // Controls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
    renderer.setClearColor('#000011')

    /**
     * Animate
     */
    const clock = new THREE.Clock()
    
    // Globals setup
    globalSetup["renderer"] = renderer;
    globalSetup["clock"] = clock;
    globalSetup["window"] = window;
    globalSetup["scene"] = scene;
    globalSetup["camera"] = camera;
    globalSetup["controls"] = controls;
    console.log(globalSetup)
    
}
const draw = () =>{

    const renderer = globalSetup["renderer"]
    const clock = globalSetup["clock"]
    const  window = globalSetup["window"] 
    const  scene  = globalSetup["scene"] 
    const camera = globalSetup["camera"] 
    const controls = globalSetup["controls"] 
    const elapsedTime = clock.getElapsedTime()

    //earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call draw again on the next frame
    window.requestAnimationFrame(draw)
}
setup()
draw()
