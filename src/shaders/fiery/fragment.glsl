uniform vec3 uSunDirection;


varying vec3 vNormal;
varying vec3 vPosition;

uniform float iGlobalTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

varying vec2 vUv;


void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    vec2 p = gl_FragCoord.xy / iResolution.xy;
    vec2 p = -1.0 + 2.0 *vUv;
    // Final color
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}