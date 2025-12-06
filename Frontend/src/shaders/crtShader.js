// CRT Screen effect shader for retro Teletext look
// Includes: scanlines, pixelation, chromatic aberration, noise, vignette

export const crtVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const crtFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Random noise
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // CRT curve distortion
  vec2 curveRemapUV(vec2 uv) {
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
  }

  // Scanlines
  float scanline(vec2 uv) {
    return sin(uv.y * 800.0) * 0.04;
  }

  // Vignette
  float vignette(vec2 uv) {
    uv *= 1.0 - uv.yx;
    float vig = uv.x * uv.y * 15.0;
    return pow(vig, 0.25);
  }

  void main() {
    // Apply CRT curve
    vec2 uv = curveRemapUV(vUv);

    // Check bounds (black outside CRT screen)
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Pixelation effect
    vec2 pixelSize = vec2(320.0, 240.0); // Lower resolution for retro look
    vec2 pixelUv = floor(uv * pixelSize) / pixelSize;

    // Chromatic aberration
    float aberration = 0.003;
    float r = texture2D(tDiffuse, pixelUv + vec2(aberration, 0.0)).r;
    float g = texture2D(tDiffuse, pixelUv).g;
    float b = texture2D(tDiffuse, pixelUv - vec2(aberration, 0.0)).b;
    vec3 color = vec3(r, g, b);

    // Scanlines
    color -= scanline(uv);

    // Random noise (subtle)
    float noise = random(uv + uTime) * 0.05;
    color += noise;

    // Vignette darkening
    color *= vignette(uv);

    // CRT glow/bloom
    color += color * 0.2;

    // Quantize colors for limited palette effect
    color = floor(color * 16.0) / 16.0;

    gl_FragColor = vec4(color, 1.0);
  }
`;
