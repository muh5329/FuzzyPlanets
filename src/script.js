import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
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




