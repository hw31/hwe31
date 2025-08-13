import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PageWrapper = styled.div`
  animation: ${({ fadeType }) => (fadeType === "in" ? fadeIn : fadeOut)} 0.3s ease forwards;
`;

const DashboardContent = ({ children }) => {
  const location = useLocation();
  const [fadeType, setFadeType] = useState("in");
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Detecta cambio de ruta
    setFadeType("out");
  }, [location.pathname]);

  const handleAnimationEnd = () => {
    if (fadeType === "out") {
      // Cambia contenido después del fade-out
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
