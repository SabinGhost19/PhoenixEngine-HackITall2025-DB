// Vertex shader pentru pixelation post-processing
export const pixelationVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader pentru pixelation effect
export const pixelationFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  varying vec2 vUv;
  
  void main() {
    vec2 dxy = uPixelSize / uResolution;
    vec2 coord = dxy * floor(vUv / dxy);
    
    vec4 color = texture2D(tDiffuse, coord);
    
    // Color quantization for retro look
    color.rgb = floor(color.rgb * 16.0) / 16.0;
    
    gl_FragColor = color;
  }
`;
