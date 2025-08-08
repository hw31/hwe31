import React from 'react';
import styled from 'styled-components';

const Switch = ({ checked, onChange }) => {
  return (
    <StyledWrapper>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <div className="toggle-switch-background">
          <div className="toggle-switch-handle" />
        </div>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px; /* Reducido de 80px */
    height: 25px; /* Reducido de 40px */
    cursor: pointer;
  }

  .toggle-switch input[type="checkbox"] {
    display: none;
  }

  .toggle-switch-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #ddd;
    border-radius: 15px;
    box-shadow: inset 0 0 0 1px #ccc;
    transition: background-color 0.3s ease-in-out;
  }

  .toggle-switch-handle {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 19px;
    height: 19px;
    background-color: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease-in-out;
  }

  .toggle-switch input[type="checkbox"]:checked + .toggle-switch-background {
    background-color: #05c46b;
    box-shadow: inset 0 0 0 1px #04b360;
  }

  .toggle-switch input[type="checkbox"]:checked + .toggle-switch-background .toggle-switch-handle {
    transform: translateX(25px); /* Ajustado al nuevo tamaño */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 0 0 2px #05c46b;
  }
`;

export default Switch;
