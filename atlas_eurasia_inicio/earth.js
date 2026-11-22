import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const container = document.querySelector(".earth-globe-wrap");
if (!container) throw new Error("Falta el contenedor de la escena 3D.");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.3;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = "earth-canvas";
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xc5d5e0, 0.62));
const sunlight = new THREE.DirectionalLight(0xffe6c6, 2.1);
sunlight.position.set(-4, 1.8, 4);
scene.add(sunlight);
const terrainLight = new THREE.DirectionalLight(0xd6eafa, 2.5);
terrainLight.position.set(-3.5, 2.6, 4);
terrainLight.castShadow = true;
terrainLight.shadow.mapSize.set(1024, 1024);
scene.add(terrainLight);

const globe = new THREE.Group();
scene.add(globe);
const isMobile = () => window.innerWidth < 800;
globe.position.set(1.05, 0.02, 0);
globe.scale.setScalar(isMobile() ? 0.84 : 1);
globe.rotation.set(0, 0, 0);
const globeSurface = new THREE.Group();
globe.add(globeSurface);

function orientationForGeographicFocus(latitude, longitude) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  const target = new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon)
  ).normalize();
  const east = new THREE.Vector3(-Math.sin(lon), 0, -Math.cos(lon)).normalize();
  const north = new THREE.Vector3(
    -Math.sin(lat) * Math.cos(lon),
    Math.cos(lat),
    Math.sin(lat) * Math.sin(lon)
  ).normalize();
  const localToView = new THREE.Matrix4().makeBasis(east, north, target).invert();
  return new THREE.Quaternion().setFromRotationMatrix(localToView).normalize();
}

const textureLoader = new THREE.TextureLoader();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
let europeTerrain;
let asiaTerrain;
let terrainMapsReady = false;
const earthTexture = textureLoader.load(
  "./assets/textures/earth.jpg",
  undefined,
  undefined,
  (error) => console.error("No se pudo cargar la textura local de la Tierra:", error)
);
earthTexture.colorSpace = THREE.SRGBColorSpace;
earthTexture.anisotropy = maxAnisotropy;

const topographyTexture = textureLoader.load(
  "./assets/textures/earth-topology.png",
  () => applyTerrainMaps(),
  undefined,
  (error) => console.error("No se pudo cargar el mapa topográfico local:", error)
);
topographyTexture.colorSpace = THREE.NoColorSpace;
topographyTexture.anisotropy = maxAnisotropy;

const waterTexture = textureLoader.load(
  "./assets/textures/earth-water.png",
  () => applyTerrainMaps(),
  undefined,
  (error) => console.error("No se pudo cargar la máscara especular de océanos:", error)
);
waterTexture.colorSpace = THREE.NoColorSpace;
waterTexture.anisotropy = maxAnisotropy;

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 192, 192),
  new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: topographyTexture,
    bumpScale: 0.075,
    specularMap: waterTexture,
    shininess: 48,
    specular: new THREE.Color(0x567985)
  })
);
globeSurface.add(earth);

const cloudsTexture = textureLoader.load(
  "./assets/textures/clouds-optimized.jpg",
  undefined,
  undefined,
  (error) => console.error("No se pudo cargar la textura local de nubes:", error)
);
cloudsTexture.colorSpace = THREE.NoColorSpace;
const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(1.014, 96, 96),
  new THREE.MeshPhongMaterial({
    color: 0xe7f0f3,
    alphaMap: cloudsTexture,
    transparent: true,
    opacity: 0.24,
    depthWrite: false
  })
);
globeSurface.add(clouds);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.03, 64, 64),
  new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float facing = max(dot(vNormal, vView), 0.0);
        float glow = pow(1.0 - facing, 2.6);
        gl_FragColor = vec4(0.22, 0.67, 0.91, glow * 0.3);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  })
);
globeSurface.add(atmosphere);

const terrainGroup = new THREE.Group();
terrainGroup.position.set(-0.82, 0.03, 0.45);
scene.add(terrainGroup);

function createMapTile(source, bounds) {
  const tile = source.clone();
  const longitudeSpan = (bounds.east - bounds.west) / 360;
  const latitudeSpan = (bounds.north - bounds.south) / 180;
  const u = (bounds.west + 180) / 360;
  const v = (bounds.south + 90) / 180;
  tile.wrapS = THREE.ClampToEdgeWrapping;
  tile.wrapT = THREE.ClampToEdgeWrapping;
  tile.repeat.set(longitudeSpan, latitudeSpan);
  tile.offset.set(u, v);
  tile.colorSpace = THREE.NoColorSpace;
  tile.anisotropy = maxAnisotropy;
  tile.needsUpdate = true;
  return tile;
}

function createShadedReliefMap(bounds) {
  const image = topographyTexture.image;
  const waterImage = waterTexture.image;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("No se pudo crear el mapa topográfico sombreado.");

  const sourceX = ((bounds.west + 180) / 360) * image.width;
  const sourceY = (1 - (bounds.north + 90) / 180) * image.height;
  const sourceWidth = ((bounds.east - bounds.west) / 360) * image.width;
  const sourceHeight = ((bounds.north - bounds.south) / 180) * image.height;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  const waterCanvas = document.createElement("canvas");
  waterCanvas.width = canvas.width;
  waterCanvas.height = canvas.height;
  const waterContext = waterCanvas.getContext("2d", { willReadFrequently: true });
  if (!waterContext) throw new Error("No se pudo crear la máscara de tierra y océano.");
  const waterX = ((bounds.west + 180) / 360) * waterImage.width;
  const waterY = (1 - (bounds.north + 90) / 180) * waterImage.height;
  const waterWidth = ((bounds.east - bounds.west) / 360) * waterImage.width;
  const waterHeight = ((bounds.north - bounds.south) / 180) * waterImage.height;
  waterContext.drawImage(waterImage, waterX, waterY, waterWidth, waterHeight, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const waterPixels = waterContext.getImageData(0, 0, canvas.width, canvas.height);
  const landColors = [
    { height: 0, color: [79, 111, 123] },
    { height: 24, color: [105, 139, 151] },
    { height: 72, color: [151, 182, 194] },
    { height: 132, color: [205, 224, 232] },
    { height: 190, color: [239, 247, 250] },
    { height: 255, color: [255, 255, 255] }
  ];

  for (let offset = 0; offset < pixels.data.length; offset += 4) {
    const height = pixels.data[offset] * 0.299 + pixels.data[offset + 1] * 0.587 + pixels.data[offset + 2] * 0.114;
    const isWater = waterPixels.data[offset] > 127;
    let lower = landColors[0];
    let upper = landColors[landColors.length - 1];
    for (let index = 1; index < landColors.length; index += 1) {
      if (height <= landColors[index].height) {
        lower = landColors[index - 1];
        upper = landColors[index];
        break;
      }
    }
    const blend = THREE.MathUtils.clamp((height - lower.height) / (upper.height - lower.height), 0, 1);
    const terrainColor = isWater
      ? [21 + height * 0.035, 53 + height * 0.09, 73 + height * 0.12]
      : null;
    for (let channel = 0; channel < 3; channel += 1) {
      pixels.data[offset + channel] = Math.round(terrainColor
        ? terrainColor[channel]
        : THREE.MathUtils.lerp(lower.color[channel], upper.color[channel], blend));
    }
  }
  context.putImageData(pixels, 0, 0);

  const reliefMap = new THREE.CanvasTexture(canvas);
  reliefMap.colorSpace = THREE.SRGBColorSpace;
  reliefMap.anisotropy = maxAnisotropy;
  return reliefMap;
}

function applyTerrainMaps() {
  if (terrainMapsReady || !europeTerrain || !asiaTerrain || !topographyTexture.image || !waterTexture.image) return;
  europeTerrain.material.map = createShadedReliefMap({ west: -12, east: 42, south: 34, north: 72 });
  asiaTerrain.material.map = createShadedReliefMap({ west: 56, east: 112, south: 12, north: 49 });
  europeTerrain.material.needsUpdate = true;
  asiaTerrain.material.needsUpdate = true;
  terrainMapsReady = true;
}

function createTerrainTile(bounds, color) {
  const heightMap = createMapTile(topographyTexture, bounds);
  const material = new THREE.MeshStandardMaterial({
    color,
    map: null,
    bumpMap: heightMap,
    bumpScale: 0.2,
    displacementMap: heightMap,
    displacementScale: 0.38,
    displacementBias: -0.08,
    metalness: 0.04,
    roughness: 0.82,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.62, 220, 150), material);
  mesh.position.z = 0.04;
  mesh.renderOrder = 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

europeTerrain = createTerrainTile({ west: -12, east: 42, south: 34, north: 72 }, 0xb9d7e8);
asiaTerrain = createTerrainTile({ west: 56, east: 112, south: 12, north: 49 }, 0xc3d7e1);
terrainGroup.add(europeTerrain, asiaTerrain);
applyTerrainMaps();

let selectedTerrain = null;
window.addEventListener("atlas:theme", (event) => {
  selectedTerrain = event.detail.topic === "relieve"
    ? event.detail.continent
    : null;
});

const starCount = 1500;
const starPositions = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
const starPhases = new Float32Array(starCount);
for (let index = 0; index < starCount; index += 1) {
  const offset = index * 3;
  starPositions[offset] = (Math.random() - 0.5) * 70;
  starPositions[offset + 1] = (Math.random() - 0.5) * 45;
  starPositions[offset + 2] = -12 - Math.random() * 22;
  starSizes[index] = 0.45 + Math.random() * 1.8;
  starPhases[index] = Math.random() * Math.PI * 2;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
starGeometry.setAttribute("aPhase", new THREE.BufferAttribute(starPhases, 1));
const stars = new THREE.Points(starGeometry, new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    attribute float aSize;
    attribute float aPhase;
    uniform float uTime;
    varying float vAlpha;
    void main() {
      vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
      float twinkle = 0.48 + 0.52 * sin(uTime * 1.4 + aPhase);
      vAlpha = twinkle;
      gl_PointSize = aSize * (60.0 / -viewPosition.z) * twinkle;
      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    void main() {
      float distanceToCenter = length(gl_PointCoord - 0.5);
      float softness = 1.0 - smoothstep(0.05, 0.5, distanceToCenter);
      gl_FragColor = vec4(0.82, 0.91, 0.95, softness * vAlpha * 0.8);
    }
  `
}));
scene.add(stars);

const stages = [
  { selector: "#inicio", cameraZ: 3.15, focus: [30, 28], globeX: 1.08, globeY: 0.02, globeScale: 1.05 },
  { selector: "#eurasia", cameraZ: 4.25, focus: [67, 40], globeX: 0.72, globeY: 0, globeScale: 0.92 },
  { selector: "#europa", cameraZ: 4.05, focus: [14, 50], globeX: 0.96, globeY: 0.02, globeScale: 0.74, terrain: "europa" },
  { selector: "#asia", cameraZ: 3.95, focus: [88, 34], globeX: 0.96, globeY: 0.02, globeScale: 0.74, terrain: "asia" },
  { selector: "#climas", cameraZ: 5.05, focus: [82, 38], globeX: 1.34, globeY: 0, globeScale: 0.42 },
  { selector: "#atlas", cameraZ: 5.15, focus: [62, 38], globeX: 1.34, globeY: 0, globeScale: 0.44 },
  { selector: "#comparacion", cameraZ: 5.2, focus: [62, 38], globeX: 1.12, globeY: 0, globeScale: 0.24 },
  { selector: "#geopolitica", cameraZ: 5.35, focus: [62, 38], globeX: 1.18, globeY: 0, globeScale: 0.22 },
  { selector: "#fuentes", cameraZ: 5.45, focus: [62, 38], globeX: -1.12, globeY: 0, globeScale: 0.2 },
  { selector: "#cierre", cameraZ: 5.9, focus: [45, 28], globeX: 0, globeY: 0, globeScale: 0.96 },
  { selector: "#fin", cameraZ: 5.9, focus: [45, 28], globeX: 0, globeY: 0, globeScale: 0.96 }
];
stages.forEach((stage) => { stage.orientation = orientationForGeographicFocus(stage.focus[1], stage.focus[0]); });
let requestedScroll = window.scrollY;
let currentScroll = requestedScroll;
let maxScroll = 1;
let stagePositions = [];

function refreshStagePositions() {
  stagePositions = stages.map((stage) => {
    const element = document.querySelector(stage.selector);
    return element ? element.getBoundingClientRect().top + window.scrollY : 0;
  });
  maxScroll = Math.max(1, window.ScrollTrigger ? window.ScrollTrigger.maxScroll(window) : document.documentElement.scrollHeight - window.innerHeight);
}

function interpolate(from, to, amount) {
  return from + (to - from) * amount;
}

function updateSceneFromScroll(scrollPosition) {
  const clampedScroll = THREE.MathUtils.clamp(scrollPosition, 0, maxScroll);
  let stageIndex = 0;
  while (stageIndex < stages.length - 1 && clampedScroll >= stagePositions[stageIndex + 1]) stageIndex += 1;

  const current = stages[stageIndex];
  const next = stages[Math.min(stageIndex + 1, stages.length - 1)];
  const start = stagePositions[stageIndex] || 0;
  const end = stagePositions[Math.min(stageIndex + 1, stagePositions.length - 1)] || maxScroll;
  const progress = stageIndex === stages.length - 1 ? 1 : THREE.MathUtils.clamp((clampedScroll - start) / Math.max(1, end - start), 0, 1);
  const transitionProgress = THREE.MathUtils.clamp((progress - 0.62) / 0.38, 0, 1);
  const smoothProgress = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);

  camera.position.z = interpolate(current.cameraZ, next.cameraZ, smoothProgress);
  globe.position.x = interpolate(isMobile() ? 0 : current.globeX, isMobile() ? 0 : next.globeX, smoothProgress);
  globe.position.y = interpolate(current.globeY, next.globeY, smoothProgress);
  globe.quaternion.copy(current.orientation).slerp(next.orientation, smoothProgress);
  const currentScale = isMobile() ? current.globeScale * 0.84 : current.globeScale;
  const nextScale = isMobile() ? next.globeScale * 0.84 : next.globeScale;
  globe.scale.setScalar(interpolate(currentScale, nextScale, smoothProgress));
  const terrainForStage = current.terrain === selectedTerrain ? selectedTerrain : null;
  terrainGroup.position.x = terrainForStage
    ? (isMobile() ? 0.65 : globe.position.x + 0.9)
    : -1.15;
  terrainGroup.position.y = terrainForStage ? 0.08 : 0.03;
  terrainGroup.position.z = terrainForStage ? 1.15 : 0.45;
  terrainGroup.scale.setScalar(isMobile() ? 0.27 : 0.34);
  const europeOpacity = terrainForStage === "europa" ? 1 : 0;
  const asiaOpacity = terrainForStage === "asia" ? 1 : 0;
  europeTerrain.material.opacity = europeOpacity;
  asiaTerrain.material.opacity = asiaOpacity;
  europeTerrain.visible = europeOpacity > 0.005;
  asiaTerrain.visible = asiaOpacity > 0.005;

  if (clampedScroll >= maxScroll - 3) {
    globe.position.x = 0;
    camera.position.z = 5.9;
  }
}

if (window.gsap && window.ScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.ScrollTrigger.create({
    trigger: "#inicio",
    start: 0,
    end: () => window.ScrollTrigger.maxScroll(window),
    onUpdate: (trigger) => {
      requestedScroll = trigger.scroll();
    },
    onRefresh: () => {
      refreshStagePositions();
    }
  });
  window.ScrollTrigger.addEventListener("refresh", refreshStagePositions);
} else {
  window.addEventListener("scroll", () => { requestedScroll = window.scrollY; }, { passive: true });
}

refreshStagePositions();
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  else refreshStagePositions();
}, { passive: true });

const pointerTarget = new THREE.Vector2(0, 0);
const pointerCurrent = new THREE.Vector2(0, 0);
window.addEventListener("pointermove", (event) => {
  pointerTarget.set(
    (event.clientX / window.innerWidth - 0.5) * 0.1,
    (event.clientY / window.innerHeight - 0.5) * 0.065
  );
}, { passive: true });

const clock = new THREE.Clock();
let animationFrame = 0;
const animate = () => {
  animationFrame = window.requestAnimationFrame(animate);
  currentScroll = requestedScroll;
  updateSceneFromScroll(currentScroll);
  pointerCurrent.lerp(pointerTarget, 0.025);
  globeSurface.rotation.y = pointerCurrent.x;
  globeSurface.rotation.x = pointerCurrent.y;
  clouds.rotation.y += 0.00012;
  if (requestedScroll >= maxScroll - 3) globe.rotation.y -= 0.00035;
  stars.material.uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
};
animate();

window.addEventListener("pagehide", () => {
  window.cancelAnimationFrame(animationFrame);
  renderer.dispose();
}, { once: true });
