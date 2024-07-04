attribute vec4 tangent;

uniform float uTime;
uniform float uWarpFrequency;
uniform float uStrength;
uniform float uWarpStrength;
uniform float uPositionFrequency;
uniform float uNoiseMinValue;
uniform bool uOceans;

// Terrain generation parameters
uniform int type;
uniform int noiseFunction;
uniform float radius;
uniform float amplitude;
uniform float sharpness;
uniform float offset;
uniform float period;
uniform float persistence;
uniform float lacunarity;
uniform int octaves;

// Bump mapping
uniform float bumpStrength;
uniform float bumpOffset;

varying vec3 fragPosition;
varying vec3 fragNormal;
varying vec3 fragTangent;
varying vec3 fragBitangent;


#include ../../includes/fractalTerrainHeight.glsl


float getTerrainHeight( vec3 position){
    float h = terrainHeight(
    type,
    position,
    amplitude, 
    sharpness,
    offset,
    period, 
    persistence, 
    lacunarity, 
    octaves,
    noiseFunction);
    return h;
}


void main(){

    /*
    *   Landmass Generation 
    *
    */
    
    vec3 biTangent = cross(normal, tangent.xyz);

    // Neighbours positions, bit tangent and tangent positions
    float shift = 0.01;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + biTangent * shift;

    // Noise positon reseiving our land mass generation
    float landHeight = getTerrainHeight(csm_Position);

    // Apply height to landmass and tanget/bitangent vectors
    //  currently noise function is only  outward facing so no overhangs or caves
    //    but something i definetly want to explore more in the future with a more powerful function
    csm_Position += landHeight * normal;
    positionA    += getTerrainHeight(positionA) * normal;
    positionB    += getTerrainHeight(positionB) * normal;

    // Compute normal and normalize to correct lighting
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);

    fragPosition = csm_Position;
    fragNormal = csm_Normal;
    fragTangent = tangent.xyz;
    fragBitangent = cross(normal, tangent.xyz);
}