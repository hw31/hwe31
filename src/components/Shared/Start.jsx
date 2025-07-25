// src/components/Start.jsx
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import EVEPro from './EVEPro';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

// Importante: para animar clip-path con styled-components se usan keyframes
const waveExpand = keyframes`
  0% {
    clip-path: circle(0% at 50% 50%);
  }
  100% {
    clip-path: circle(150% at 50% 50%);
  }
`;

const GlobalStyle = createGlobalStyle`
  body, html, #root {
    margin: 0; padding: 0;
    background-color: black;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    background-repeat: repeat;
    overflow-x: hidden;
  }
`;

// Overlay que hará la animación de onda al hacer click
const WaveOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: #0a1a2f;
  clip-path: circle(0% at 50% 50%);
  animation: ${waveExpand} 1s forwards ease-in-out;
  z-index: 9999;
`;

export default function Start() {
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (animating) {
      const timeout = setTimeout(() => {
        navigate('/login');
      }, 1500); // duración animación
      return () => clearTimeout(timeout);
    }
  }, [animating, navigate]);

  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <Canvas
          shadows
          camera={{ position: [0, 0, 3.5], fov: 35 }}
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[3, 5, 3]}
            intensity={1.3}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={1}
            shadow-camera-far={10}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <EVEPro />
          <ContactShadows
            position={[0, -1.15, 0]}
            opacity={0.6}
            scale={6}
            blur={2.5}
            far={1.5}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 2}
            autoRotate={false}
            rotateSpeed={1.2}
          />
        </Canvas>

        <ButtonWrapper>
           <button className="button"onClick={() => setAnimating(true)}>
        <svg className="w-6 h-6" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div className="text">Ingresar</div>
      </button>
        </ButtonWrapper>

        {animating && <WaveOverlay />}
      </PageWrapper>
    </>
  );
}

const PageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;

  /* Fondo cuadriculado sutil */
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

 .button {
    background-color: #ffffff00;
    color: #fff;
    width: 8.5em;
    height: 2.9em;
    border: #3cc 0.2em solid;
    border-radius: 11px;
    text-align: right;
    transition: all 0.6s ease;
  }

  .button:hover {
    background-color: #3cc;
    cursor: pointer;
  }

  .button svg {
    width: 1.6em;
    margin: -0.2em 0.8em 1em;
    position: absolute;
    display: flex;
    transition: all 0.6s ease;
  }

  .button:hover svg {
    transform: translateX(5px);
  }

  .text {
    margin: 0 1.5em;
  }`;
