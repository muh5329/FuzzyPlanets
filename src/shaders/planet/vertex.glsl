attribute vec4 tangent;
uniform float uTime;
uniform float uWarpFrequency;
uniform float uStrength;
uniform float uWarpStrength;
uniform float uPositionFrequency;
uniform float uNoiseMinValue;
uniform bool uOceans;

#include ../../includes/simplexNoise4d.glsl
#include ../../includes/cubicNoise.glsl


float getCubicNoise(vec3 position) {
    return cubicNoise(position);

    
}

float getSimplexNoise(vec3 position) {
   return simplexNoise4d(vec4(position,0.0));
}


float getHeightNoise(vec3 position){
   
    vec3 warpedPosition = position;
    warpedPosition += uTime * 0.2;
    warpedPosition += getCubicNoise(warpedPosition * uPositionFrequency * uWarpFrequency ) * uWarpStrength;
                        
                        
    float elevation = 0.0;
    elevation += getCubicNoise(warpedPosition) / 2.0 ;
    elevation +=  getCubicNoise(warpedPosition * 2.0)/ 4.0 ;
    elevation +=  getCubicNoise(warpedPosition * 4.0) / 8.0 ;

    float elevationSign = sign(elevation);
    elevation = pow(abs(elevation), 3.0) * elevationSign;
     
    elevation *= uStrength;
    if (uOceans){
        elevation = max(0.0,elevation - uNoiseMinValue);
       
    }
    
    return elevation;

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
    float landHeight = getHeightNoise(csm_Position);

    // Apply height to landmass and tanget/bitangent vectors
    //  currently noise function is only  outward facing so no overhangs or caves
    //    but something i definetly want to explore more in the future with a more powerful function
    csm_Position += landHeight * normal;
    positionA    += getHeightNoise(positionA) * normal;
    positionB    += getHeightNoise(positionB) * normal;

    // Compute normal and normalize to correct lighting
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);

   

}