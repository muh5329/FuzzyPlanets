import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import createUI from './ui';
import planetVertexShader from './shaders/planet/vertex.glsl'
import planetFragmentShader from './shaders/planet/fragment.glsl'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

window.onload = () => setup();

let globalSetup = {};

const setup = () =>{

    /**
     * Base
     */
    // Canvas
    const canvas = document.querySelector('canvas.webgl')
    // Scene
    const scene = new THREE.Scene()
    // Loaders
    const textureLoader = new THREE.TextureLoader()
    const uniforms = {
        //Generic planet uniforms
        uStrength: new THREE.Uniform(2.0),
        uPositionFrequency: new THREE.Uniform(0.2),
        uWarpFrequency: new THREE.Uniform(5),
        uWarpStrength: new THREE.Uniform(0.5),
        uNoiseMinValue: new THREE.Uniform(0.00001),
        uOceans:new THREE.Uniform(true),
        //Vertex Uniforms
        uTime: new  THREE.Uniform(0),
        type: new  THREE.Uniform(2),
        noiseFunction: new  THREE.Uniform(1),
        radius: new  THREE.Uniform(20.0),
        amplitude: new  THREE.Uniform(1.19),
        sharpness: new  THREE.Uniform(2.6),
        offset: new  THREE.Uniform(-0.016),
        period: new  THREE.Uniform(0.6),
        persistence: new  THREE.Uniform(0.484),
        lacunarity: new  THREE.Uniform(1.8),
        octaves: new  THREE.Uniform(10),
        bumpOffset: new  THREE.Uniform(0.001),
        bumpStrength: new  THREE.Uniform(1.0),
        // Fragment Uniforms
        // LayersColors
        color1: new  THREE.Uniform(new THREE.Color(0.014, 0.117, 0.279)),
        color2: new  THREE.Uniform(new THREE.Color(0.080, 0.527, 0.351)),
        color3: new  THREE.Uniform(new THREE.Color(0.620, 0.516, 0.372)),
        color4: new  THREE.Uniform(new THREE.Color(0.149, 0.254, 0.084)),
        color5: new  THREE.Uniform(new THREE.Color(0.150, 0.150, 0.150)),
        //Transitions
        transition2: new  THREE.Uniform(0.071 ),
        transition3: new  THREE.Uniform(0.215),
        transition4: new  THREE.Uniform(0.372 ),
        transition5: new  THREE.Uniform(1.2),
        //Blending 
        blend12: new  THREE.Uniform(0.152),
        blend23: new  THREE.Uniform(0.152),
        blend34: new  THREE.Uniform(0.104),
        blend45: new  THREE.Uniform(0.168),
        //Bump
        bumpStrength: new  THREE.Uniform(1.0),
        bumpOffset: new  THREE.Uniform(0.001),
        // Lights
        ambientIntensity: new  THREE.Uniform(0.02),
        diffuseIntensity: new  THREE.Uniform(1),
        specularIntensity: new  THREE.Uniform( 2),
        shininess: new  THREE.Uniform(10),
        lightDirection: new  THREE.Uniform(new THREE.Vector3(1, 1, 1)),
        lightColor: new  THREE.Uniform(new THREE.Color(0.150, 0.150, 0.150))
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


    const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white 
    scene.add(ambientLight)


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

    createUI(uniforms);
    const draw = () =>{

        const renderer = globalSetup["renderer"]
        const clock = globalSetup["clock"]
        const window = globalSetup["window"] 
        const scene  = globalSetup["scene"] 
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

    draw()
    
}




