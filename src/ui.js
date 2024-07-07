import GUI from 'lil-gui'

export default function createUI(uniforms) {
  const gui = new GUI();

  const terrainFolder = gui.addFolder('Terrain');
  terrainFolder.add(uniforms.type, 'value', { simplex: 1, fractal: 2, ridgedFractal: 3 }).name('Type');
  // terrainFolder.add(uniforms.noiseFunction, 'value', { simplex: 1, Cubic: 2 }).name('NoiseFunction');
  terrainFolder.add(uniforms.amplitude, 'value', 0.1, 1.5).name('Amplitude');
  terrainFolder.add(uniforms.sharpness, 'value', 0, 5).name('Sharpness');
  terrainFolder.add(uniforms.offset, 'value', -2, 2).name('Offset');
  terrainFolder.add(uniforms.period, 'value', 0.1, 2).name('Period');
  terrainFolder.add(uniforms.persistence, 'value', 0, 1).name('Persistence');
  terrainFolder.add(uniforms.lacunarity, 'value', 1, 3).name('Lacunarity');
  terrainFolder.add(uniforms.octaves, 'value', 1, 8, 1).name('Octaves');

  const layersFolder = terrainFolder.addFolder('Layers').close();
  const layer1Folder = layersFolder.addFolder('Layer 1');
  layer1Folder.add(uniforms.color1.value, 'r', 0, 1).name('Red');
  layer1Folder.add(uniforms.color1.value, 'g', 0, 1).name('Green');
  layer1Folder.add(uniforms.color1.value, 'b', 0, 1).name('Blue');

  const layer2Folder = layersFolder.addFolder('Layer 2');
  layer2Folder.add(uniforms.transition2, 'value', 0, 3).name('Transition Point');
  layer2Folder.add(uniforms.blend12, 'value', 0, 1).name('Blend Factor (1->2)');
  layer2Folder.add(uniforms.color2.value, 'r', 0, 1).name('Red');
  layer2Folder.add(uniforms.color2.value, 'g', 0, 1).name('Green');
  layer2Folder.add(uniforms.color2.value, 'b', 0, 1).name('Blue');

  const layer3Folder = layersFolder.addFolder('Layer 3');
  layer3Folder.add(uniforms.transition3, 'value', 0, 3).name('Transition Point');
  layer3Folder.add(uniforms.blend23, 'value', 0, 1).name('Blend Factor (2->3)');
  layer3Folder.add(uniforms.color3.value, 'r', 0, 1).name('Red');
  layer3Folder.add(uniforms.color3.value, 'g', 0, 1).name('Green');
  layer3Folder.add(uniforms.color3.value, 'b', 0, 1).name('Blue');

  const layer4Folder = layersFolder.addFolder('Layer 4');
  layer4Folder.add(uniforms.transition4, 'value', 0, 3).name('Transition Point');
  layer4Folder.add(uniforms.blend34, 'value', 0, 1).name('Blend Factor (3->4)');
  layer4Folder.add(uniforms.color4.value, 'r', 0, 1).name('Red');
  layer4Folder.add(uniforms.color4.value, 'g', 0, 1).name('Green');
  layer4Folder.add(uniforms.color4.value, 'b', 0, 1).name('Blue');

  const layer5Folder = layersFolder.addFolder('Layer 5');
  layer5Folder.add(uniforms.transition5, 'value', 0, 3).name('Transition Point');
  layer5Folder.add(uniforms.blend45, 'value', 0, 1).name('Blend Factor (4->5)');
  layer5Folder.add(uniforms.color5.value, 'r', 0, 1).name('Red');
  layer5Folder.add(uniforms.color5.value, 'g', 0, 1).name('Green');
  layer5Folder.add(uniforms.color5.value, 'b', 0, 1).name('Blue');
  

  const lightingFolder = gui.addFolder('Lighting');  
  lightingFolder.add(uniforms.ambientIntensity, 'value', 0, 5).name('Ambient');
  lightingFolder.add(uniforms.diffuseIntensity, 'value', 0, 5).name('Diffuse');
  lightingFolder.add(uniforms.specularIntensity, 'value', 0, 5).name('Specular');
  lightingFolder.add(uniforms.shininess, 'value', 0, 25).name('Shininess');

  const lightDirFolder = lightingFolder.addFolder('Direction').close();
  lightDirFolder.add(uniforms.lightDirection.value, 'x', -1, 1).name('X');
  lightDirFolder.add(uniforms.lightDirection.value, 'y', -1, 1).name('Y');
  lightDirFolder.add(uniforms.lightDirection.value, 'z', -1, 1).name('Z');

  const lightColorFolder = lightingFolder.addFolder('Color').close();
  lightColorFolder.add(uniforms.lightColor.value, 'r', 0, 1).name('R');
  lightColorFolder.add(uniforms.lightColor.value, 'g', 0, 1).name('G');
  lightColorFolder.add(uniforms.lightColor.value, 'b', 0, 1).name('B');

  const bumpMapFolder = gui.addFolder('Bump Mapping');
  bumpMapFolder.add(uniforms.bumpStrength, 'value', 0, 1).name('Bump Strength');
  bumpMapFolder.add(uniforms.bumpOffset, 'value', 0.0001, 0.1).name('Bump Offset');

}