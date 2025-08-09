import React from "react";
import styled from "styled-components";

const Checkbox = ({ checked, onChange, modoOscuro = false }) => {
  return (
    <StyledWrapper $modoOscuro={modoOscuro}>
      <input
        className="toggle-checkbox"
        id="toggle"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <label className="hamburger" htmlFor="toggle" aria-label="Toggle sidebar menu">
        <div className="bar" />
        <div className="bar" />
        <div className="bar" />
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .toggle-checkbox {
    display: none;
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 35px;
    height: 24px;
    cursor: pointer;
  }

  /* Por defecto, para desktop: */
  .hamburger .bar {
    width: 100%;
    height: 4px;
    background-color: ${({ $modoOscuro }) => ($modoOscuro ? "#eee" : "#fff")};
    border-radius: 10px;
    transition: transform 0.3s ease, opacity 0.3s ease;
    position: relative;
  }

  /* Cambiar color a negro en modo claro y móvil (max-width 768px) */
  @media (max-width: 768px) {
    .hamburger .bar {
      background-color: ${({ $modoOscuro }) => ($modoOscuro ? "#eee" : "#000")};
    }
  }

  .toggle-checkbox:checked + .hamburger .bar:nth-child(2) {
    transform: translateY(10px);
    opacity: 0;
    transition-delay: 0.3s;
  }

  .toggle-checkbox:checked + .hamburger .bar:nth-child(3) {
    transform: translateY(-10px);
    transition-delay: 0s;
  }

  .toggle-checkbox:checked + .hamburger .bar:nth-child(1) {
    transform: rotate(-45deg) scale(0.7);
    transition-delay: 0.6s;
  }

  .toggle-checkbox:checked + .hamburger .bar:nth-child(3) {
    transform: rotate(45deg) scale(0.7);
    transition-delay: 0.2s;
  }
`;



export default Checkbox;
