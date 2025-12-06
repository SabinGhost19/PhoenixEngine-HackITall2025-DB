// Vertex shader pentru ocean cu valuri animate - PIXEL ART STYLE
export const oceanVertexShader = `
  uniform float uTime;
  uniform float uWaveStrength;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPos;
  varying vec2 vPixelCoord;

  // Funcție pentru a detecta dacă pixelul este parte din val
  float isWavePixel(vec2 coord) {
    vec2 cell = fract(coord / 16.0) * 16.0;
    vec2 cellInt = floor(cell);

    // Corpul valului
    if (cellInt.y >= 8.0 && cellInt.y <= 12.0) {
      float curveX = 8.0 + (cellInt.y - 8.0) * 1.5;
      if (abs(cellInt.x - curveX) < 3.0) {
        return 1.0;
      }
    }

    // Creasta
    if (cellInt.y >= 4.0 && cellInt.y <= 7.0) {
      float crestX = 10.0 + (7.0 - cellInt.y) * 1.2;
      if (abs(cellInt.x - crestX) < 2.5) {
        return 2.0;
      }
    }

    return 0.0;
  }

  void main() {
    vUv = uv;

    vec3 pos = position;
    vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

    // Pixelate the world position for chunky waves
    float pixelSize = 1.0;
    vec2 pixelatedPos = floor(worldPos.xz / pixelSize) * pixelSize;
    vPixelCoord = pixelatedPos;

    // Create stepped wave animation
    float waveTime = floor(uTime * 2.0) / 2.0;

    // Verifică dacă acest pixel face parte dintr-un val
    vec2 animatedCoord = pixelatedPos;
    animatedCoord.x -= waveTime * 8.0;

    vec2 coord1 = animatedCoord * 1.0;
    vec2 coord2 = animatedCoord * 0.7 + vec2(50.0, 20.0);
    vec2 coord3 = animatedCoord * 1.3 + vec2(-30.0, 40.0);

    float wavePixel1 = isWavePixel(coord1);
    float wavePixel2 = isWavePixel(coord2);
    float wavePixel3 = isWavePixel(coord3);

    float maxWavePixel = max(max(wavePixel1, wavePixel2), wavePixel3);

    // Elevație de bază
    float wave1 = sin(pixelatedPos.x * 0.4 + waveTime * 0.5) * cos(pixelatedPos.y * 0.3 + waveTime * 0.3);
    float wave2 = sin(pixelatedPos.x * 0.2 - waveTime * 0.4) * cos(pixelatedPos.y * 0.4 - waveTime * 0.2);
    float wave3 = sin(pixelatedPos.x * 0.5 + waveTime * 0.6) * cos(pixelatedPos.y * 0.3 + waveTime * 0.5);

    float elevation = (wave1 + wave2 * 0.5 + wave3 * 0.3) * uWaveStrength;
    float steps = 12.0;
    elevation = floor(elevation * steps) / steps;

    // Adaugă relief pentru pixelii care sunt parte din pattern-ul de val
    if (maxWavePixel > 1.5) {
      // Creasta - ridicată la maxim
      elevation += uWaveStrength * 1.5;
    } else if (maxWavePixel > 0.5) {
      // Corpul valului - ridicat moderat
      vec2 cell = fract(animatedCoord / 16.0) * 16.0;
      float heightFactor = (cell.y - 8.0) / 8.0; // Gradient de la bază la creastă
      elevation += uWaveStrength * 0.8 * heightFactor;
    }

    pos.y += elevation;

    vElevation = elevation;
    vWorldPos = worldPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader pentru ocean cu valuri animate - PIXEL ART STYLE bazat pe motiv 16x16
export const oceanFragmentShader = `
  uniform vec3 uColorDeep;
  uniform vec3 uColorSurface;
  uniform vec3 uColorFoam;
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPos;
  varying vec2 vPixelCoord;

  // Desenează un val pixel-art 16x16: curbat spre dreapta cu contur negru
  float drawWavePattern(vec2 coord) {
    // Normalizează coordonatele în grid 16x16
    vec2 cell = fract(coord / 16.0) * 16.0;
    vec2 cellInt = floor(cell);

    // Definește forma valului curbat (ca o curbă parabolică)
    float waveShape = 0.0;

    // Partea de jos a valului (contur)
    if (cellInt.y >= 8.0 && cellInt.y <= 12.0) {
      float curveX = 8.0 + (cellInt.y - 8.0) * 1.5; // Curbat spre dreapta
      if (abs(cellInt.x - curveX) < 3.0) {
        waveShape = 1.0;
      }
    }

    // Creastă (partea de sus)
    if (cellInt.y >= 4.0 && cellInt.y <= 7.0) {
      float crestX = 10.0 + (7.0 - cellInt.y) * 1.2;
      if (abs(cellInt.x - crestX) < 2.5) {
        waveShape = 2.0; // 2.0 pentru creasta albă
      }
    }

    return waveShape;
  }

  // Desenează conturul (eliminat - nu mai folosim negru)
  float drawOutline(vec2 coord) {
    return 0.0;
  }

  void main() {
    // Calculează coordonatele în grid pixel-art
    vec2 pixelCoord = vWorldPos.xz;

    // Animație: deplasează pattern-ul
    float animTime = floor(uTime * 2.0) / 2.0;
    pixelCoord.x -= animTime * 8.0;

    // Variază mărimea și poziția valurilor
    vec2 coord1 = pixelCoord * 1.0;
    vec2 coord2 = pixelCoord * 0.7 + vec2(50.0, 20.0);
    vec2 coord3 = pixelCoord * 1.3 + vec2(-30.0, 40.0);

    float wave1 = drawWavePattern(coord1);
    float wave2 = drawWavePattern(coord2);
    float wave3 = drawWavePattern(coord3);

    float outline1 = drawOutline(coord1);
    float outline2 = drawOutline(coord2);
    float outline3 = drawOutline(coord3);

    // Combină valurile
    float waveValue = max(max(wave1, wave2), wave3);
    float outlineValue = max(max(outline1, outline2), outline3);

    // Quantized elevation pentru variație de culoare
    float quantizedElevation = floor(vElevation * 10.0) / 10.0;

    // Culoare de bază în funcție de elevație
    vec3 baseColor;
    if (quantizedElevation > 0.2) {
      baseColor = mix(uColorSurface, uColorFoam, 0.8);
    } else if (quantizedElevation > 0.0) {
      baseColor = uColorSurface;
    } else if (quantizedElevation > -0.2) {
      baseColor = mix(uColorSurface, uColorDeep, 0.4);
    } else {
      baseColor = uColorDeep;
    }

    // Aplică pattern-ul de val
    vec3 color = baseColor;

    // Desenează valurile cu gradient albastru
    if (waveValue > 1.5) {
      // Creastă albă
      color = uColorFoam;
    } else if (waveValue > 0.5) {
      // Corp val - gradient de albastru
      vec2 cell = fract(pixelCoord / 16.0) * 16.0;
      float gradientFactor = cell.y / 16.0;
      color = mix(uColorDeep, uColorSurface, gradientFactor);
    }

    // Contur eliminat - nu mai folosim negru

    // Final color quantization pentru palette limitată
    color = floor(color * 8.0) / 8.0;

    gl_FragColor = vec4(color, 1.0);
  }
`;
