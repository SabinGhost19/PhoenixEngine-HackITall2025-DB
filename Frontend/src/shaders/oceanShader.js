// Vertex shader pentru ocean cu valuri animate
export const oceanVertexShader = `
  uniform float uTime;
  uniform float uWaveStrength;
  varying vec2 vUv;
  varying float vElevation;
  
  // Simple noise function for waves
  float noise(vec2 p) {
    return sin(p.x * 2.0) * cos(p.y * 2.0);
  }
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Create multiple wave layers
    float wave1 = sin(pos.x * 0.5 + uTime * 0.5) * cos(pos.z * 0.3 + uTime * 0.3);
    float wave2 = sin(pos.x * 0.3 - uTime * 0.4) * cos(pos.z * 0.5 - uTime * 0.2);
    float wave3 = sin(pos.x * 0.7 + uTime * 0.6) * cos(pos.z * 0.4 + uTime * 0.5);
    
    float elevation = (wave1 + wave2 * 0.5 + wave3 * 0.3) * uWaveStrength;
    pos.y += elevation;
    
    vElevation = elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader pentru ocean cu culori retro și detalii
export const oceanFragmentShader = `
  uniform vec3 uColorDeep;
  uniform vec3 uColorSurface;
  uniform vec3 uColorFoam;
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;
  
  // Simple noise for texture detail
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    // Base color mixing based on elevation with more variation
    vec3 color = mix(uColorDeep, uColorSurface, vElevation * 3.0 + 0.5);
    
    // Add depth variation with UV coordinates
    float depthPattern = noise(vUv * 20.0 + uTime * 0.1);
    color = mix(color, uColorDeep, depthPattern * 0.15);
    
    // Add wave pattern details
    float wavePattern = sin(vUv.x * 30.0 + uTime) * cos(vUv.y * 25.0 - uTime * 0.5);
    color = mix(color, uColorSurface, wavePattern * 0.08);
    
    // Add foam on wave peaks with more detail
    if (vElevation > 0.2) {
      float foamAmount = (vElevation - 0.2) * 3.5;
      float foamPattern = noise(vUv * 50.0 + uTime * 2.0);
      foamAmount *= foamPattern;
      color = mix(color, uColorFoam, foamAmount);
    }
    
    // Add subtle sparkles on water surface
    float sparkle = noise(vUv * 100.0 + uTime * 5.0);
    if (sparkle > 0.95 && vElevation > 0.1) {
      color = mix(color, vec3(1.0, 1.0, 1.0), 0.4);
    }
    
    // Pixelation effect - quantize colors for retro look (more levels for smoother appearance)
    color = floor(color * 14.0) / 14.0;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
