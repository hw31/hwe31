import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import Loader from './Loader';

const fadeOut = keyframes`
  from {
    transform: translateY(0);
    visibility: visible;
  }
  to {
    transform: translateY(40px);
    visibility: hidden;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* colocamos arriba */
  padding-top: 80px; /* espacio desde arriba */
  height: 100vh;
  background: #f3f3f3;
  color: black;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  font-size: 1.5rem;
  text-align: center;

  ${({ fade }) =>
    fade &&
    css`
      animation: ${fadeOut} 1s ease forwards;
    `}
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 900;
  margin-bottom: 3rem;

  background: linear-gradient(to right, #00da72, #00e0ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  text-shadow: 
    1px 1px 2px rgba(0,0,0,0.15), 
    2px 2px 4px rgba(0,0,0,0.1); /* Sombra tipo botón */

  animation: fadeInText 1.5s ease;

  @keyframes fadeInText {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LoaderWrapper = styled.div`
  transform: scale(1.4);
  margin-top: 2rem;
`;

export default function WelcomeLoader() {
  const navigate = useNavigate();
  const [fadeOutStarted, setFadeOutStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOutStarted(true);
      setTimeout(() => navigate('/login'), 1000);
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container fade={fadeOutStarted}>
      <Title>INGRESANDO</Title>
      <LoaderWrapper>
        <Loader />
      </LoaderWrapper>
    </Container>
  );
}
