import { useRef, useEffect } from 'react';
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  MeshPhysicalMaterial,
  ShaderChunk,
  Color,
  Object3D,
  InstancedMesh,
  PMREMGenerator,
  SphereGeometry,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

class ThreeApp {
  #config;
  canvas;
  camera;
  cameraMinAspect;
  cameraMaxAspect;
  cameraFov;
  maxPixelRatio;
  minPixelRatio;
  scene;
  renderer;
  #postprocessing;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render = this.#defaultRender;
  onBeforeRender = () => {};
  onAfterRender = () => {};
  onAfterResize = () => {};
  #visible = false;
  #running = false;
  isDisposed = false;
  #intersectionObserver;
  #resizeObserver;
  #resizeTimeout;
  #clock = new Clock();
  #time = { elapsed: 0, delta: 0 };
  #rafId;
  
  constructor(config) {
    this.#config = { ...config };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    this.resize();
    this.#initObservers();
  }
  
  #initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }
  
  #initScene() {
    this.scene = new Scene();
  }
  
  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas;
    } else if (this.#config.id) {
      this.canvas = document.getElementById(this.#config.id);
    } else {
      console.error('Three: Missing canvas or id parameter');
    }
    this.canvas.style.display = 'block';
    const options = {
      canvas: this.canvas,
      powerPreference: 'high-performance',
      ...(this.#config.rendererOptions ?? {})
    };
    this.renderer = new WebGLRenderer(options);
    this.renderer.outputColorSpace = SRGBColorSpace;
  }
  
  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#handleResize.bind(this));
      if (this.#config.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#handleResize.bind(this));
        this.#resizeObserver.observe(this.canvas.parentNode);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#handleIntersection.bind(this), {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#handleVisibilityChange.bind(this));
  }
  
  #removeObservers() {
    window.removeEventListener('resize', this.#handleResize.bind(this));
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.#handleVisibilityChange.bind(this));
  }
  
  #handleIntersection(entries) {
    this.#visible = entries[0].isIntersecting;
    this.#visible ? this.#start() : this.#stop();
  }
  
  #handleVisibilityChange() {
    if (this.#visible) {
      document.hidden ? this.#stop() : this.#start();
    }
  }
  
  #handleResize() {
    if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
    this.#resizeTimeout = setTimeout(this.resize.bind(this), 100);
  }
  
  resize() {
    let width, height;
    if (this.#config.size instanceof Object) {
      width = this.#config.size.width;
      height = this.#config.size.height;
    } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
      width = this.canvas.parentNode.offsetWidth;
      height = this.canvas.parentNode.offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;
    this.#updateCamera();
    this.#updateRenderer();
    this.onAfterResize(this.size);
  }
  
  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFov(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#adjustFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }
  
  #adjustFov(targetAspect) {
    const vFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / targetAspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(vFov));
  }
  
  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const vFov = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(vFov / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if (this.camera.isOrthographicCamera) {
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
    }
  }
  
  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#postprocessing?.setSize(this.size.width, this.size.height);
    let pixelRatio = window.devicePixelRatio;
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
      pixelRatio = this.maxPixelRatio;
    } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
      pixelRatio = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }
  
  get postprocessing() {
    return this.#postprocessing;
  }
  
  set postprocessing(value) {
    this.#postprocessing = value;
    this.render = value.render.bind(value);
  }
  
  #start() {
    if (this.#running) return;
    const animate = () => {
      this.#rafId = requestAnimationFrame(animate);
      this.#time.delta = this.#clock.getDelta();
      this.#time.elapsed += this.#time.delta;
      this.onBeforeRender(this.#time);
      this.render();
      this.onAfterRender(this.#time);
    };
    this.#running = true;
    this.#clock.start();
    animate();
  }
  
  #stop() {
    if (this.#running) {
      cancelAnimationFrame(this.#rafId);
      this.#running = false;
      this.#clock.stop();
    }
  }
  
  #defaultRender() {
    this.renderer.render(this.scene, this.camera);
  }
  
  clear() {
    this.scene.traverse(obj => {
      if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
        Object.keys(obj.material).forEach(key => {
          const value = obj.material[key];
          if (value !== null && typeof value === 'object' && typeof value.dispose === 'function') {
            value.dispose();
          }
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
  }
  
  dispose() {
    this.#removeObservers();
    this.#stop();
    this.clear();
    this.#postprocessing?.dispose();
    this.renderer.dispose();
    this.isDisposed = true;
  }
}

const pointerStore = new Map();
const pointerPosition = new Vector2();
let listenersAttached = false;

function createPointer(config) {
  const pointer = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    ...config
  };
  
  const domElement = config.domElement;
  if (!pointerStore.has(domElement)) {
    pointerStore.set(domElement, pointer);
    if (!listenersAttached) {
      document.body.addEventListener('pointermove', handlePointerMove);
      document.body.addEventListener('pointerleave', handlePointerLeave);
      document.body.addEventListener('click', handleClick);
      document.body.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.body.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.body.addEventListener('touchend', handleTouchEnd, { passive: false });
      document.body.addEventListener('touchcancel', handleTouchEnd, { passive: false });
      listenersAttached = true;
    }
  }
  
  pointer.dispose = () => {
    pointerStore.delete(domElement);
    if (pointerStore.size === 0) {
      document.body.removeEventListener('pointermove', handlePointerMove);
      document.body.removeEventListener('pointerleave', handlePointerLeave);
      document.body.removeEventListener('click', handleClick);
      document.body.removeEventListener('touchstart', handleTouchStart);
      document.body.removeEventListener('touchmove', handleTouchMove);
      document.body.removeEventListener('touchend', handleTouchEnd);
      document.body.removeEventListener('touchcancel', handleTouchEnd);
      listenersAttached = false;
    }
  };
  
  return pointer;
}

function handlePointerMove(e) {
  pointerPosition.x = e.clientX;
  pointerPosition.y = e.clientY;
  processInteraction();
}

function processInteraction() {
  for (const [elem, pointer] of pointerStore) {
    const rect = elem.getBoundingClientRect();
    if (isInside(rect)) {
      updatePosition(pointer, rect);
      if (!pointer.hover) {
        pointer.hover = true;
        pointer.onEnter(pointer);
      }
      pointer.onMove(pointer);
    } else if (pointer.hover && !pointer.touching) {
      pointer.hover = false;
      pointer.onLeave(pointer);
    }
  }
}

function handleClick(e) {
  pointerPosition.x = e.clientX;
  pointerPosition.y = e.clientY;
  for (const [elem, pointer] of pointerStore) {
    const rect = elem.getBoundingClientRect();
    updatePosition(pointer, rect);
    if (isInside(rect)) pointer.onClick(pointer);
  }
}

function handlePointerLeave() {
  for (const pointer of pointerStore.values()) {
    if (pointer.hover) {
      pointer.hover = false;
      pointer.onLeave(pointer);
    }
  }
}

function handleTouchStart(e) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPosition.x = e.touches[0].clientX;
    pointerPosition.y = e.touches[0].clientY;
    for (const [elem, pointer] of pointerStore) {
      const rect = elem.getBoundingClientRect();
      if (isInside(rect)) {
        pointer.touching = true;
        updatePosition(pointer, rect);
        if (!pointer.hover) {
          pointer.hover = true;
          pointer.onEnter(pointer);
        }
        pointer.onMove(pointer);
      }
    }
  }
}

function handleTouchMove(e) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPosition.x = e.touches[0].clientX;
    pointerPosition.y = e.touches[0].clientY;
    for (const [elem, pointer] of pointerStore) {
      const rect = elem.getBoundingClientRect();
      updatePosition(pointer, rect);
      if (isInside(rect)) {
        if (!pointer.hover) {
          pointer.hover = true;
          pointer.touching = true;
          pointer.onEnter(pointer);
        }
        pointer.onMove(pointer);
      } else if (pointer.hover && pointer.touching) {
        pointer.onMove(pointer);
      }
    }
  }
}

function handleTouchEnd() {
  for (const pointer of pointerStore.values()) {
    if (pointer.touching) {
      pointer.touching = false;
      if (pointer.hover) {
        pointer.hover = false;
        pointer.onLeave(pointer);
      }
    }
  }
}

function updatePosition(pointer, rect) {
  const { position, nPosition } = pointer;
  position.x = pointerPosition.x - rect.left;
  position.y = pointerPosition.y - rect.top;
  nPosition.x = (position.x / rect.width) * 2 - 1;
  nPosition.y = (-position.y / rect.height) * 2 + 1;
}

function isInside(rect) {
  const { x, y } = pointerPosition;
  const { left, top, width, height } = rect;
  return x >= left && x <= left + width && y >= top && y <= top + height;
}

const { randFloat, randFloatSpread } = MathUtils;
const tempVec1 = new Vector3();
const tempVec2 = new Vector3();
const tempVec3 = new Vector3();
const tempVec4 = new Vector3();
const tempVec5 = new Vector3();
const tempVec6 = new Vector3();
const tempVec7 = new Vector3();
const tempVec8 = new Vector3();
const tempVec9 = new Vector3();
const tempVec10 = new Vector3();

class Physics {
  constructor(config) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();
    this.#initPositions();
    this.setSizes();
  }
  
  #initPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);
    for (let i = 1; i < config.count; i++) {
      const idx = 3 * i;
      positionData[idx] = randFloatSpread(2 * config.maxX);
      positionData[idx + 1] = randFloatSpread(2 * config.maxY);
      positionData[idx + 2] = randFloatSpread(2 * config.maxZ);
    }
  }
  
  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;
    for (let i = 1; i < config.count; i++) {
      sizeData[i] = randFloat(config.minSize, config.maxSize);
    }
  }
  
  update(time) {
    const { config, center, positionData, sizeData, velocityData } = this;
    let startIdx = 0;
    
    if (config.controlSphere0) {
      startIdx = 1;
      tempVec1.fromArray(positionData, 0);
      tempVec1.lerp(center, 0.1).toArray(positionData, 0);
      tempVec4.set(0, 0, 0).toArray(velocityData, 0);
    }
    
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      tempVec2.fromArray(positionData, base);
      tempVec5.fromArray(velocityData, base);
      tempVec5.y -= time.delta * config.gravity * sizeData[idx];
      tempVec5.multiplyScalar(config.friction);
      tempVec5.clampLength(0, config.maxVelocity);
      tempVec2.add(tempVec5);
      tempVec2.toArray(positionData, base);
      tempVec5.toArray(velocityData, base);
    }
    
    for (let idx = startIdx; idx < config.count; idx++) {
      const base = 3 * idx;
      tempVec2.fromArray(positionData, base);
      tempVec5.fromArray(velocityData, base);
      const radius = sizeData[idx];
      
      for (let jdx = idx + 1; jdx < config.count; jdx++) {
        const otherBase = 3 * jdx;
        tempVec3.fromArray(positionData, otherBase);
        tempVec6.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[jdx];
        tempVec7.copy(tempVec3).sub(tempVec2);
        const dist = tempVec7.length();
        const sumRadius = radius + otherRadius;
        
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          tempVec8.copy(tempVec7).normalize().multiplyScalar(0.5 * overlap);
          tempVec9.copy(tempVec8).multiplyScalar(Math.max(tempVec5.length(), 1));
          tempVec10.copy(tempVec8).multiplyScalar(Math.max(tempVec6.length(), 1));
          tempVec2.sub(tempVec8);
          tempVec5.sub(tempVec9);
          tempVec2.toArray(positionData, base);
          tempVec5.toArray(velocityData, base);
          tempVec3.add(tempVec8);
          tempVec6.add(tempVec10);
          tempVec3.toArray(positionData, otherBase);
          tempVec6.toArray(velocityData, otherBase);
        }
      }
      
      if (config.controlSphere0) {
        tempVec7.copy(tempVec1).sub(tempVec2);
        const dist = tempVec7.length();
        const sumRadius = radius + sizeData[0];
        if (dist < sumRadius) {
          const diff = sumRadius - dist;
          tempVec8.copy(tempVec7.normalize()).multiplyScalar(diff);
          tempVec9.copy(tempVec8).multiplyScalar(Math.max(tempVec5.length(), 2));
          tempVec2.sub(tempVec8);
          tempVec5.sub(tempVec9);
        }
      }
      
      if (Math.abs(tempVec2.x) + radius > config.maxX) {
        tempVec2.x = Math.sign(tempVec2.x) * (config.maxX - radius);
        tempVec5.x = -tempVec5.x * config.wallBounce;
      }
      
      if (config.gravity === 0) {
        if (Math.abs(tempVec2.y) + radius > config.maxY) {
          tempVec2.y = Math.sign(tempVec2.y) * (config.maxY - radius);
          tempVec5.y = -tempVec5.y * config.wallBounce;
        }
      } else if (tempVec2.y - radius < -config.maxY) {
        tempVec2.y = -config.maxY + radius;
        tempVec5.y = -tempVec5.y * config.wallBounce;
      }
      
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(tempVec2.z) + radius > maxBoundary) {
        tempVec2.z = Math.sign(tempVec2.z) * (config.maxZ - radius);
        tempVec5.z = -tempVec5.z * config.wallBounce;
      }
      
      tempVec2.toArray(positionData, base);
      tempVec5.toArray(velocityData, base);
    }
  }
}

class SubsurfaceScatteringMaterial extends MeshPhysicalMaterial {
  constructor(params) {
    super(params);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 }
    };
    this.defines.USE_UV = '';
    this.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif
          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
        }

        void main() {
      `
      );
      const lightsFragmentBegin = ShaderChunk.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        `
          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', lightsFragmentBegin);
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
}

const defaultConfig = {
  count: 200,
  colors: [0x000000],
  ambientColor: 0xffffff,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true
};

const tempObject = new Object3D();

class Spheres extends InstancedMesh {
  constructor(renderer, config = {}) {
    const finalConfig = { ...defaultConfig, ...config };
    const environment = new RoomEnvironment();
    const pmremGenerator = new PMREMGenerator(renderer, 0.04).fromScene(environment).texture;
    const geometry = new SphereGeometry();
    const material = new SubsurfaceScatteringMaterial({ envMap: pmremGenerator, ...finalConfig.materialParams });
    material.envMapRotation.x = -Math.PI / 2;
    super(geometry, material, finalConfig.count);
    
    this.config = finalConfig;
    this.physics = new Physics(finalConfig);
    this.#initLights();
    this.setColors(finalConfig.colors);
  }
  
  #initLights() {
    this.ambientLight = new AmbientLight(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }
  
  setColors(colors) {
    if (Array.isArray(colors) && colors.length > 1) {
      const gradient = createGradient(colors);
      for (let idx = 0; idx < this.count; idx++) {
        this.setColorAt(idx, gradient.getColorAt(idx / this.count));
        if (idx === 0) {
          this.light.color.copy(gradient.getColorAt(idx / this.count));
        }
      }
      this.instanceColor.needsUpdate = true;
    }
  }
  
  update(time) {
    this.physics.update(time);
    for (let idx = 0; idx < this.count; idx++) {
      tempObject.position.fromArray(this.physics.positionData, 3 * idx);
      if (idx === 0 && this.config.followCursor === false) {
        tempObject.scale.setScalar(0);
      } else {
        tempObject.scale.setScalar(this.physics.sizeData[idx]);
      }
      tempObject.updateMatrix();
      this.setMatrixAt(idx, tempObject.matrix);
      if (idx === 0) this.light.position.copy(tempObject.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createGradient(colors) {
  let colorValues;
  let colorObjects;
  
  function setColors(newColors) {
    colorValues = newColors;
    colorObjects = [];
    colorValues.forEach(col => {
      colorObjects.push(new Color(col));
    });
  }
  
  setColors(colors);
  
  return {
    setColors,
    getColorAt: function (ratio, out = new Color()) {
      const scaled = Math.max(0, Math.min(1, ratio)) * (colorValues.length - 1);
      const idx = Math.floor(scaled);
      const start = colorObjects[idx];
      if (idx >= colorValues.length - 1) return start.clone();
      const alpha = scaled - idx;
      const end = colorObjects[idx + 1];
      out.r = start.r + alpha * (end.r - start.r);
      out.g = start.g + alpha * (end.g - start.g);
      out.b = start.b + alpha * (end.b - start.b);
      return out;
    }
  };
}

function createBallpit(canvas, config = {}) {
  const three = new ThreeApp({
    canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true }
  });
  
  let spheres;
  three.renderer.toneMapping = ACESFilmicToneMapping;
  three.camera.position.set(0, 0, 20);
  three.camera.lookAt(0, 0, 0);
  three.cameraMaxAspect = 1.5;
  three.resize();
  initialize(config);
  
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const intersectPoint = new Vector3();
  let paused = false;
  
  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.style.webkitUserSelect = 'none';
  
  const pointer = createPointer({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointer.nPosition, three.camera);
      three.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, intersectPoint);
      spheres.physics.center.copy(intersectPoint);
      spheres.config.controlSphere0 = true;
    },
    onLeave() {
      spheres.config.controlSphere0 = false;
    }
  });
  
  function initialize(newConfig) {
    if (spheres) {
      three.clear();
      three.scene.remove(spheres);
    }
    spheres = new Spheres(three.renderer, newConfig);
    three.scene.add(spheres);
  }
  
  three.onBeforeRender = time => {
    if (!paused) spheres.update(time);
  };
  
  three.onAfterResize = size => {
    spheres.config.maxX = size.wWidth / 2;
    spheres.config.maxY = size.wHeight / 2;
  };
  
  return {
    three,
    get spheres() {
      return spheres;
    },
    setCount(count) {
      initialize({ ...spheres.config, count });
    },
    togglePause() {
      paused = !paused;
    },
    dispose() {
      pointer.dispose();
      three.dispose();
    }
  };
}

const Ballpit = ({ className = '', followCursor = true, ...props }) => {
  const canvasRef = useRef(null);
  const spheresInstanceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    spheresInstanceRef.current = createBallpit(canvas, { followCursor, ...props });

    return () => {
      if (spheresInstanceRef.current) {
        spheresInstanceRef.current.dispose();
      }
    };
  }, []);

  return <canvas className={className} ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default Ballpit;
