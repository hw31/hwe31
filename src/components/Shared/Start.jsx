import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import Loader from './Loader';

const fadeOut = keyframes`
  from {
    opacity: 1;
    visibility: visible;
  }
  to {
    opacity: 0;
    visibility: hidden;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* centrado vertical */
  height: 100vh;
  width: 100vw;
  background: black; /* Fondo negro */
  color: white;
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  font-size: 1.5rem;
  text-align: center;

  ${({ fade }) =>
    fade &&
    css`
      animation: ${fadeOut} 1s ease forwards;
    `}
`;

const LoaderWrapper = styled.div`
  transform: scale(1.4);
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
      <LoaderWrapper>
        <Loader />
      </LoaderWrapper>
    </Container>
  );
}
