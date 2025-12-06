import * as THREE from 'three';

// Create pixelated texture for metal hull
export function createMetalTexture(color = '#7d8491') {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 16, 16);
  
  // Add pixel noise for metal texture
  const baseColor = new THREE.Color(color);
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      const random = Math.random() * 0.2 - 0.1;
      const newColor = baseColor.clone().offsetHSL(0, 0, random);
      ctx.fillStyle = '#' + newColor.getHexString();
      ctx.fillRect(i, j, 1, 1);
    }
  }
  
  // Add panel lines
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, 16, 1);
  ctx.fillRect(0, 5, 16, 1);
  ctx.fillRect(0, 10, 16, 1);
  ctx.fillRect(0, 15, 16, 1);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  
  return texture;
}

// Create pixelated wood texture
export function createWoodTexture(darkColor = '#654321', lightColor = '#8b4513') {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  // Wood grain pattern
  for (let i = 0; i < 16; i++) {
    const stripe = Math.floor(i / 2) % 2;
    ctx.fillStyle = stripe ? darkColor : lightColor;
    ctx.fillRect(0, i, 16, 1);
  }
  
  // Add wood knots and details
  ctx.fillStyle = darkColor;
  ctx.fillRect(3, 3, 2, 2);
  ctx.fillRect(11, 8, 2, 2);
  ctx.fillRect(6, 13, 1, 1);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  
  return texture;
}

// Create pixelated container texture
export function createContainerTexture(color = '#d62828') {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 32, 32);
  
  // Corrugated lines (vertical)
  const darkColor = new THREE.Color(color).multiplyScalar(0.7);
  ctx.fillStyle = '#' + darkColor.getHexString();
  for (let i = 0; i < 32; i += 3) {
    ctx.fillRect(i, 0, 1, 32);
  }
  
  // Highlight lines
  const lightColor = new THREE.Color(color).multiplyScalar(1.2);
  ctx.fillStyle = '#' + lightColor.getHexString();
  for (let i = 1; i < 32; i += 3) {
    ctx.fillRect(i, 0, 1, 32);
  }
  
  // Add some rust/wear pixels
  ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(Math.random() * 32);
    const y = Math.floor(Math.random() * 32);
    ctx.fillRect(x, y, 1, 1);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  return texture;
}

// Create deck/floor texture
export function createDeckTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  // Base dark grey
  ctx.fillStyle = '#3a4250';
  ctx.fillRect(0, 0, 16, 16);
  
  // Plank lines
  ctx.fillStyle = '#2a3240';
  ctx.fillRect(0, 0, 16, 1);
  ctx.fillRect(0, 8, 16, 1);
  
  // Add concrete texture noise
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 16);
    const brightness = Math.random() > 0.5 ? 0.1 : -0.1;
    ctx.fillStyle = brightness > 0 ? '#4a5260' : '#2a3240';
    ctx.fillRect(x, y, 1, 1);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  
  return texture;
}

// Create ocean water texture
export function createWaterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Create water with varying blue shades
  const colors = ['#006494', '#0582ca', '#00a6fb', '#1e88e5'];
  
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillStyle = color;
      ctx.fillRect(i, j, 1, 1);
    }
  }
  
  // Add foam highlights
  ctx.fillStyle = 'rgba(227, 242, 253, 0.3)';
  for (let i = 0; i < 15; i++) {
    const x = Math.floor(Math.random() * 32);
    const y = Math.floor(Math.random() * 32);
    ctx.fillRect(x, y, 2, 1);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
}

// Create rusty metal texture
export function createRustyMetalTexture(baseColor = '#7d8491') {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  // Base metal
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 16, 16);
  
  // Add rust patches
  const rustColor = '#8b4513';
  for (let i = 0; i < 25; i++) {
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 16);
    ctx.fillStyle = rustColor;
    ctx.fillRect(x, y, Math.random() > 0.5 ? 2 : 1, 1);
  }
  
  // Add scratches
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 16);
    ctx.fillRect(x, y, Math.floor(Math.random() * 4) + 1, 1);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  
  return texture;
}
