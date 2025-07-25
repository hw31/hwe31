import { useGLTF } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import { a, useSpring } from '@react-spring/three';
import * as THREE from 'three';

export default function EVEPro(props) {
  const group = useRef();
  const { scene } = useGLTF('/models/eve.glb');

  const logoTexture = useLoader(THREE.TextureLoader, '/images/iconologo.png');
  const [rotationY, setRotationY] = useState(0);

  // Brillo tipo neón
  const neonMaterial = new THREE.MeshStandardMaterial({
    map: logoTexture,
    emissive: new THREE.Color('#00ff88'), // Verde neón
    emissiveIntensity: 1.5,
    transparent: true,
    side: THREE.DoubleSide,
  });

  useEffect(() => {
    scene.rotation.x = 0.2;
    scene.rotation.z = 0;
  }, [scene]);

  const { positionY } = useSpring({
    loop: true,
    to: [{ positionY: 0.1 }, { positionY: -0.1 }],
    from: { positionY: 0 },
    config: { duration: 3000 },
  });

  const handlePointerMove = (event) => {
    const x = event.clientX;
    const rot = ((x / window.innerWidth) * 2 - 1) * Math.PI * 0.2;
    setRotationY(rot);
  };

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = rotationY;
      group.current.position.y = positionY.get();
    }
  });

  return (
    <a.group
      ref={group}
      scale={0.4}
      position={[0, 0, 0]}
      onPointerMove={handlePointerMove}
      {...props}
    >
      <primitive object={scene} />

      {/* Logo visible sobre el pecho */}
      <mesh
        position={[0.4, 0.15,0.95]} // ← Posición refinada al frente del pecho
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[0.35, 0.35]} />
        <primitive object={neonMaterial} attach="material" />
      </mesh>
    </a.group>
  );
}