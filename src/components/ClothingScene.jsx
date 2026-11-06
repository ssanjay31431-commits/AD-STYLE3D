import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

function containsPoint(point, polygon) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
    const a = polygon[current];
    const b = polygon[previous];
    const crosses = (a.y > point.y) !== (b.y > point.y);
    if (crosses && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function makeFabricShape(points, material, z = 0) {
  const shape = new THREE.Shape();
  const contour = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(points.length * 5);
  shape.moveTo(contour[0].x, contour[0].y);
  contour.slice(1).forEach(({ x, y }) => shape.lineTo(x, y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.075, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.028, bevelThickness: 0.025 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = z;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const xs = contour.map((point) => point.x);
  const ys = contour.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const columns = 32;
  const rows = 48;
  const vertices = [];
  const uvs = [];
  const indices = [];
  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    const y = minY + v * (maxY - minY);
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const x = minX + u * (maxX - minX);
      const centerBulge = Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.055;
      const folds = Math.sin(u * 33 + v * 3) * 0.018 + Math.sin(u * 72 - v * 9) * 0.008;
      const gathered = Math.sin(v * 36 + Math.sin(u * 11) * 2) * 0.012 * Math.abs(u - 0.5) * 2;
      const frontZ = z + 0.108 + centerBulge + (folds + gathered) * Math.sin(v * Math.PI);
      vertices.push(x, y, frontZ);
      uvs.push(u, 1 - v);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const u = (column + 0.5) / columns;
      const v = (row + 0.5) / rows;
      const point = new THREE.Vector2(minX + u * (maxX - minX), minY + v * (maxY - minY));
      if (!containsPoint(point, contour)) continue;
      const a = row * (columns + 1) + column;
      const b = a + 1;
      const c = a + columns + 1;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }
  const surfaceGeometry = new THREE.BufferGeometry();
  surfaceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  surfaceGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  surfaceGeometry.setIndex(indices);
  surfaceGeometry.computeVertexNormals();
  const surface = new THREE.Mesh(surfaceGeometry, material);
  surface.castShadow = true;
  surface.receiveShadow = true;
  return [mesh, surface];
}

function makeFabricTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 3900; i += 1) {
    const shade = Math.random() > 0.52 ? '255,255,255' : '20,20,20';
    const alpha = Math.random() * 0.095;
    context.fillStyle = `rgba(${shade},${alpha})`;
    const size = Math.random() > 0.8 ? 2 : 1;
    context.fillRect(Math.random() * 256, Math.random() * 256, size, size);
  }
  context.strokeStyle = 'rgba(255,255,255,.035)';
  context.lineWidth = 1;
  for (let y = 0; y < 256; y += 4) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(256, y);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.3, 1.8);
  texture.anisotropy = 4;
  return texture;
}

function makeSoftShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 12, 128, 128, 126);
  gradient.addColorStop(0, 'rgba(58,48,38,.15)');
  gradient.addColorStop(0.42, 'rgba(58,48,38,.07)');
  gradient.addColorStop(1, 'rgba(58,48,38,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 256);
  return new THREE.CanvasTexture(canvas);
}

function makeLine(points, material, group, z = 0.22) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, z)));
  const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.008, 5, false), material);
  group.add(line);
  return line;
}

function addGarment(product, group) {
  const isOuterwear = product.type === 'jacket';
  const isHoodie = product.type === 'hoodie';
  const isTee = product.type === 'tee';
  const isShirt = product.type === 'shirt';
  const fabricTexture = makeFabricTexture(product.hex);
  const fabric = new THREE.MeshStandardMaterial({ map: fabricTexture, roughness: 0.94, metalness: 0.01 });
  const seam = new THREE.MeshStandardMaterial({ color: product.hex, roughness: 1, transparent: true, opacity: 0.48 });
  const darkFabric = new THREE.MeshStandardMaterial({ color: new THREE.Color(product.hex).multiplyScalar(0.76), roughness: 0.94 });
  const hangerMaterial = new THREE.MeshStandardMaterial({ color: '#b48756', roughness: 0.62, metalness: 0 });
  const hookMaterial = new THREE.MeshStandardMaterial({ color: '#a8a39a', metalness: 0.8, roughness: 0.24 });

  const bodyPoints = isTee || isShirt
    ? [[-0.42, 0.64], [-0.62, 0.43], [-0.5, 0.14], [-0.38, 0.2], [-0.38, -1.18], [-0.31, -1.27], [0.31, -1.27], [0.38, -1.18], [0.38, 0.2], [0.5, 0.14], [0.62, 0.43], [0.42, 0.64], [0.28, 0.72], [0.16, 0.57], [-0.16, 0.57], [-0.28, 0.72]]
    : [[-0.43, 0.67], [-0.72, 0.4], [-0.58, 0.08], [-0.48, 0.16], [-0.4, -0.16], [-0.4, -1.32], [-0.3, -1.4], [0.3, -1.4], [0.4, -1.32], [0.4, -0.16], [0.48, 0.16], [0.58, 0.08], [0.72, 0.4], [0.43, 0.67], [0.24, 0.72], [0.14, 0.53], [-0.14, 0.53], [-0.24, 0.72]];

  if (isHoodie) {
    group.add(...makeFabricShape([[-0.24, 0.69], [-0.3, 0.94], [-0.17, 1.17], [0, 1.24], [0.17, 1.17], [0.3, 0.94], [0.24, 0.69], [0.12, 0.57], [-0.12, 0.57]], darkFabric, -0.13));
    makeLine([[-0.17, 1.08], [-0.12, 0.91], [-0.08, 0.75]], seam, group, -0.025);
    makeLine([[0.17, 1.08], [0.12, 0.91], [0.08, 0.75]], seam, group, -0.025);
  }
  if (isTee || isShirt) {
    const sleevePoints = [[-0.33, 0.6], [-0.65, 0.42], [-0.53, 0.1], [-0.4, 0.15], [-0.34, 0.29]];
    group.add(...makeFabricShape(sleevePoints, fabric, -0.08));
    group.add(...makeFabricShape(sleevePoints.map(([x, y]) => [-x, y]), fabric, -0.08));
  } else {
    group.add(...makeFabricShape([[-0.31, 0.68], [-0.72, 0.4], [-0.81, -0.27], [-0.72, -0.58], [-0.51, -0.52], [-0.45, -0.11], [-0.39, 0.15]], fabric, -0.08));
    group.add(...makeFabricShape([[0.31, 0.68], [0.72, 0.4], [0.81, -0.27], [0.72, -0.58], [0.51, -0.52], [0.45, -0.11], [0.39, 0.15]], fabric, -0.08));
  }
  group.add(...makeFabricShape(bodyPoints, fabric, 0));

  const neck = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.027, 8, 24, Math.PI), fabric);
  neck.position.set(0, isTee || isShirt ? 0.62 : 0.67, 0.2);
  neck.rotation.z = Math.PI;
  group.add(neck);

  const hangerPoints = [[-0.5, 1.02], [0, 1.31], [0.5, 1.02]];
  makeLine(hangerPoints, hangerMaterial, group, 0.15);
  const hookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.31, 0.15),
    new THREE.Vector3(0, 1.74, 0.15),
    new THREE.Vector3(0, 1.99, 0.15),
    new THREE.Vector3(0.08, 2.08, 0.15),
    new THREE.Vector3(0.17, 2.02, 0.15),
  ]);
  const hook = new THREE.Mesh(new THREE.TubeGeometry(hookCurve, 24, 0.018, 6, false), hookMaterial);
  group.add(hook);

  const detailMaterial = new THREE.MeshStandardMaterial({ color: isTee ? '#786f62' : new THREE.Color(product.hex).multiplyScalar(0.8), roughness: 0.9 });
  if (isOuterwear || isShirt) {
    makeLine([[0, 0.57], [0, 0.12], [0, -0.25], [0, -0.78], [0, -1.31]], seam, group);
    if (isOuterwear) {
      for (const x of [-0.235, 0.235]) {
        group.add(...makeFabricShape([[x - 0.12, -0.37], [x + 0.12, -0.37], [x + 0.115, -0.6], [x, -0.64], [x - 0.115, -0.6]], detailMaterial, 0.12));
        makeLine([[x - 0.1, -0.4], [x, -0.42], [x + 0.1, -0.4]], seam, group, 0.25);
      }
      if (product.id === 'midnight-jacket') {
        for (let i = 0; i < 4; i += 1) {
          const button = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), hookMaterial);
          button.position.set(0.065, 0.32 - i * 0.22, 0.245);
          group.add(button);
        }
      }
    } else {
      for (let i = 0; i < 5; i += 1) {
        const button = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 6), hookMaterial);
        button.position.set(0.035, 0.31 - i * 0.21, 0.245);
        group.add(button);
      }
    }
  }
  if (isHoodie) {
    group.add(...makeFabricShape([[-0.24, -0.64], [0.24, -0.64], [0.21, -0.8], [0.1, -0.88], [-0.1, -0.88], [-0.21, -0.8]], darkFabric, 0.12));
    makeLine([[-0.13, -0.67], [0, -0.7], [0.13, -0.67]], seam, group, 0.25);
  }
  if (isTee) {
    const print = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.11, 0.025), detailMaterial);
    print.position.set(0, 0.04, 0.225);
    group.add(print);
    makeLine([[-0.17, 0.035], [0, 0.035], [0.17, 0.035]], seam, group, 0.24);
  }
  if (!isTee && !isShirt) {
    makeLine([[-0.38, -1.22], [-0.2, -1.24], [0, -1.23], [0.2, -1.24], [0.38, -1.22]], seam, group, 0.22);
    for (const side of [-1, 1]) {
      makeLine([[side * 0.27, 0.47], [side * 0.29, 0.06], [side * 0.24, -0.45]], seam, group, 0.22);
    }
  }

  group.userData.product = product;
  group.userData.fabricMaterial = fabric;
  group.userData.baseScale = 1;
}

export default function ClothingScene({ products, selected, onSelect, onHover }) {
  const mountRef = useRef(null);
  const previousScrollRef = useRef(null);
  const callbacksRef = useRef({ onSelect, onHover, selected });
  callbacksRef.current = { onSelect, onHover, selected };

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f7f3ec');
    const camera = new THREE.PerspectiveCamera(17, 1, 0.1, 100);
    camera.position.set(0, 0.13, 12.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D row of nine hanging garments');
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#fffdf7', '#c8c0b4', 2.1));
    const keyLight = new THREE.DirectionalLight('#fffdf7', 2.2);
    keyLight.position.set(-3.2, 3.4, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight('#e5dfd4', 0.65);
    fillLight.position.set(4, 1.5, 4);
    scene.add(fillLight);

    const softShadowTexture = makeSoftShadowTexture();

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 10.1, 16), new THREE.MeshStandardMaterial({ color: '#aaa69d', metalness: 0.82, roughness: 0.23 }));
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, 1.91, -0.02);
    rod.castShadow = true;
    scene.add(rod);
    const rodEndMaterial = new THREE.MeshStandardMaterial({ color: '#928e86', metalness: 0.78, roughness: 0.25 });
    for (const x of [-5.03, 5.03]) {
      const end = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), rodEndMaterial);
      end.position.set(x, 1.91, -0.02);
      scene.add(end);
    }

    const garmentGroups = products.map((product, index) => {
      const garment = new THREE.Group();
      addGarment(product, garment);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 2.05), new THREE.MeshBasicMaterial({
        map: softShadowTexture,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        toneMapped: false,
      }));
      shadow.position.set(0.03, -0.16, -0.35);
      shadow.renderOrder = -1;
      garment.add(shadow);
      garment.position.x = (index - (products.length - 1) / 2) * 1.08;
      garment.position.y = -0.14;
      garment.rotation.z = index % 2 ? 0.012 : -0.012;
      garment.userData.homeX = garment.position.x;
      garment.scale.set(0.76, 0.94, 1);
      garment.userData.homeScale = { x: 0.76, y: 0.94, z: 1 };
      garment.userData.phase = index * 0.7;
      scene.add(garment);
      return garment;
    });
    host.__garmentGroups = garmentGroups;
    host.__camera = camera;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered = null;
    let mouseX = 0;
    const handlePointerLeave = () => {
      hovered = null;
      callbacksRef.current.onHover(null);
      if (!callbacksRef.current.selected) {
        garmentGroups.forEach((garment) => {
          gsap.to(garment.position, { x: garment.userData.homeX, z: 0, duration: 0.45, ease: 'power2.out' });
          gsap.to(garment.scale, { ...garment.userData.homeScale, duration: 0.45, ease: 'power2.out' });
        });
      }
    };
    const updatePointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouseX = pointer.x;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(garmentGroups, true)[0];
      let productGroup = hit?.object;
      while (productGroup && !productGroup.userData.product) productGroup = productGroup.parent;
      if (!productGroup?.userData.product) productGroup = null;
      if (hovered !== productGroup) {
        hovered = productGroup;
        callbacksRef.current.onHover(productGroup?.userData.product || null);
        if (!callbacksRef.current.selected) {
          garmentGroups.forEach((garment) => {
            const active = garment === productGroup;
            gsap.to(garment.position, { x: garment.userData.homeX, z: active ? 0.4 : 0, duration: 0.45, ease: 'power2.out' });
            const home = garment.userData.homeScale;
            gsap.to(garment.scale, {
              x: active ? home.x * 1.1 : home.x,
              y: active ? home.y * 1.06 : home.y,
              z: active ? home.z * 1.04 : home.z,
              duration: 0.45,
              ease: 'power2.out',
            });
          });
        }
      }
      renderer.domElement.style.cursor = productGroup ? 'pointer' : 'default';
    };
    const handleClick = () => {
      if (!hovered) return;
      const scroller = host.parentElement;
      previousScrollRef.current = scroller.scrollLeft;
      if (scroller.scrollWidth > scroller.clientWidth) {
        scroller.scrollTo({ left: (host.clientWidth - scroller.clientWidth) / 2, behavior: 'smooth' });
      }
      callbacksRef.current.onSelect(hovered.userData.product);
    };
    renderer.domElement.addEventListener('pointermove', updatePointer);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    renderer.domElement.addEventListener('click', handleClick);

    const observer = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = host;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    });
    observer.observe(host);
    let frameId;
    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();
      camera.position.x += (mouseX * 0.18 - camera.position.x) * 0.018;
      camera.lookAt(0, 0.05, 0);
      garmentGroups.forEach((garment) => {
        garment.rotation.z = Math.sin(t * 0.78 + garment.userData.phase) * 0.014;
        garment.position.y = -0.14 + Math.sin(t * 0.78 + garment.userData.phase) * 0.018;
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
        return;
      }
      clock.start();
      render();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    render();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('pointermove', updatePointer);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('click', handleClick);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => {
            material.map?.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      delete host.__garmentGroups;
      delete host.__camera;
    };
  }, [products]);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    const groups = host.__garmentGroups;
    const camera = host.__camera;
    const scroller = host.parentElement;
    if (selected && previousScrollRef.current === null) {
      previousScrollRef.current = scroller.scrollLeft;
      if (scroller.scrollWidth > scroller.clientWidth) {
        scroller.scrollTo({ left: (host.clientWidth - scroller.clientWidth) / 2, behavior: 'smooth' });
      }
    } else if (!selected && previousScrollRef.current !== null) {
      scroller.scrollTo({ left: previousScrollRef.current, behavior: 'smooth' });
      previousScrollRef.current = null;
    }
    if (camera) {
      gsap.to(camera, {
        fov: selected ? 22 : 17,
        duration: 0.9,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      });
    }
    if (groups) {
      groups.forEach((group) => {
        const active = group.userData.product.id === selected?.id;
        gsap.to(group.position, { x: selected ? (active ? 0 : group.userData.homeX) : group.userData.homeX, z: selected ? (active ? 2.1 : -1.4) : 0, duration: 0.9, ease: 'power3.inOut' });
        const target = selected ? (active ? { x: 1.32, y: 1.43, z: 1.3 } : { x: 0.6, y: 0.75, z: 0.78 }) : group.userData.homeScale;
        gsap.to(group.scale, { ...target, duration: 0.9, ease: 'power3.inOut' });
      });
    }
  }, [selected]);

  return <div className="scene-scroll"><div className="scene-inner" ref={mountRef} /></div>;
}
