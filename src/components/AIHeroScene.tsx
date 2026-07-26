import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AIHeroScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Core Computacional (Quantum Core Group)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Geometry parameters for 3 concentric rings representing quantum process lines
    // Ring 1 (Outer - Cyan)
    const ring1Geo = new THREE.TorusGeometry(1.8, 0.03, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x29abe2, // neon-cyan
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    coreGroup.add(ring1);

    // Ring 2 (Middle - Purple)
    const ring2Geo = new THREE.TorusGeometry(1.35, 0.025, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xa855f7, // cyber-purple
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    coreGroup.add(ring2);

    // Ring 3 (Inner - Blue)
    const ring3Geo = new THREE.TorusGeometry(0.9, 0.02, 16, 60);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff, // glow-blue
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    coreGroup.add(ring3);

    // Central Data Node (Core junction)
    const centerGeo = new THREE.IcosahedronGeometry(0.35, 1);
    const centerMat = new THREE.MeshBasicMaterial({
      color: 0x29abe2,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const centerNode = new THREE.Mesh(centerGeo, centerMat);
    coreGroup.add(centerNode);

    // Luminous pulses (nodes orbiting on the ring paths)
    const pulseCount = 3;
    const pulses: THREE.Mesh[] = [];
    const pulseAngles = [0, Math.PI * 0.6, Math.PI * 1.3];
    const pulseSpeeds = [0.9, -1.2, 1.5];
    const pulseRadii = [1.8, 1.35, 0.9];
    const pulseColors = [0x29abe2, 0xa855f7, 0x00d4ff];

    for (let i = 0; i < pulseCount; i++) {
      const pGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ 
        color: pulseColors[i],
        transparent: true,
        opacity: 0.9 
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      coreGroup.add(pMesh);
      pulses.push(pMesh);
    }

    // 3. Linear Data Traffic System (Particles flowing straight through the core)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Start in a columnar structure behind the core (spread in X/Y)
      positions[idx] = (Math.random() - 0.5) * 5;
      positions[idx + 1] = (Math.random() - 0.5) * 5;
      positions[idx + 2] = -8 + Math.random() * 12; // Z position spread

      particleSpeeds[i] = 0.04 + Math.random() * 0.08; // speed along Z
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom data point glow texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(0, 212, 255, 1)');
      grad.addColorStop(0.6, 'rgba(41, 171, 226, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dataTraffic = new THREE.Points(particleGeo, particleMat);
    scene.add(dataTraffic);

    // 4. Operational Illumination (PointLights representing magnetic scanner grids)
    const light1 = new THREE.PointLight(0x00d4ff, 3, 40); // Cyan scanner
    const light2 = new THREE.PointLight(0xa855f7, 2.5, 40); // Purple scanner
    scene.add(light1);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);

    // 5. Grid helper in the background (industrial NOC/SOC feel)
    const gridGeo = new THREE.BufferGeometry();
    const gridVertices = [];
    const gridSize = 16;
    const gridSpacing = 0.8;
    
    // Create parallel data channels grid (Z line stream)
    for (let x = -gridSize/2; x <= gridSize/2; x += 2) {
      for (let y = -gridSize/2; y <= gridSize/2; y += 2) {
        gridVertices.push(x * gridSpacing, y * gridSpacing, -8);
        gridVertices.push(x * gridSpacing, y * gridSpacing, 4);
      }
    }
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVertices, 3));
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x29abe2,
      transparent: true,
      opacity: 0.03
    });
    const structuralGrid = new THREE.LineSegments(gridGeo, gridMat);
    scene.add(structuralGrid);

    // 6. Interaction variables
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize coordinate from -0.5 to 0.5
      mouse.targetX = (event.clientX / window.innerWidth) - 0.5;
      mouse.targetY = (event.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Mathematically synchronized rotations (no pulse, steady and precise)
      ring1.rotation.y = elapsedTime * 0.25;
      ring1.rotation.x = elapsedTime * 0.1;

      ring2.rotation.x = -elapsedTime * 0.35;
      ring2.rotation.z = elapsedTime * 0.15;

      ring3.rotation.y = -elapsedTime * 0.45;
      ring3.rotation.z = -elapsedTime * 0.25;

      centerNode.rotation.y = elapsedTime * 0.5;
      centerNode.rotation.x = elapsedTime * 0.3;

      // Orbiting light pulses (traveling along the ring coordinates)
      for (let i = 0; i < pulseCount; i++) {
        const angle = pulseAngles[i] + elapsedTime * pulseSpeeds[i];
        const r = pulseRadii[i];
        const pMesh = pulses[i];

        // Map to circular ring paths on different planes
        if (i === 0) {
          // Y-plane
          pMesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        } else if (i === 1) {
          // X-plane
          pMesh.position.set(0, Math.cos(angle) * r, Math.sin(angle) * r);
        } else {
          // Angled-plane
          pMesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r * 0.5, Math.sin(angle) * r * 0.86);
        }
      }

      // Smooth camera parallax based on mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x * 2.2;
      camera.position.y = -mouse.y * 2.2;
      camera.lookAt(0, 0, 0);

      // Mouse interactive lighting grid scanner (illuminates parts pointed to)
      light1.position.x = Math.cos(elapsedTime) * 3 + mouse.x * 5;
      light1.position.y = Math.sin(elapsedTime) * 3 - mouse.y * 5;
      light1.position.z = 2.5;

      light2.position.x = Math.sin(elapsedTime * 0.7) * -3 + mouse.x * 3;
      light2.position.y = Math.cos(elapsedTime * 0.7) * 3 - mouse.y * 3;
      light2.position.z = -2;

      // Linear data flow (particles travel from back to front)
      const positionsAttr = particleGeo.attributes.position;
      if (positionsAttr) {
        const arr = positionsAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;

          // Increment Z coordinate (linear stream flow)
          arr[idx + 2] += particleSpeeds[i];

          // Magnetic highlight field (particles get pulled slightly toward cursor field on hover)
          const px = arr[idx];
          const py = arr[idx + 1];
          const pz = arr[idx + 2];

          // Target cursor projection
          const cursorX = mouse.x * 8;
          const cursorY = -mouse.y * 8;

          // Calculate horizontal distance to cursor ray
          const dx = cursorX - px;
          const dy = cursorY - py;
          const distSq = dx * dx + dy * dy;

          if (distSq < 2.0 && pz > -4 && pz < 2) {
            // Apply slight magnetic sway
            arr[idx] += dx * 0.005;
            arr[idx + 1] += dy * 0.005;
          }

          // Reset particle when it travels past the front viewport
          if (arr[idx + 2] > 4.5) {
            arr[idx] = (Math.random() - 0.5) * 5.2;
            arr[idx + 1] = (Math.random() - 0.5) * 5.2;
            arr[idx + 2] = -8; // reset to back
          }
        }
        positionsAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Resources
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      centerGeo.dispose();
      centerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      pulses.forEach(p => {
        p.geometry.dispose();
        if (Array.isArray(p.material)) {
          p.material.forEach(m => m.dispose());
        } else {
          p.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full absolute inset-0 cursor-default"
      style={{ minHeight: '380px' }}
    />
  );
};

export default AIHeroScene;
