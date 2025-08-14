import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// Animaciones de entrada y salida
const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Wrapper con animación condicional
const PageWrapper = styled.div`
  animation: ${({ fadeType }) => (fadeType === "in" ? fadeIn : fadeOut)} 0.3s ease forwards;
`;

const DashboardContent = ({ children }) => {
  const location = useLocation();
  const [fadeType, setFadeType] = useState("in");
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Inicia fade-out cuando cambia la ruta
    setFadeType("out");
  }, [location.pathname, children]);

  const handleAnimationEnd = () => {
    if (fadeType === "out") {
      // Actualiza el contenido después del fade-out y hace fade-in
      setDisplayChildren(children);
      setFadeType("in");
    }
  };

  return (
    <PageWrapper fadeType={fadeType} onAnimationEnd={handleAnimationEnd}>
      {displayChildren}
    </PageWrapper>
  );
};

export default DashboardContent;
