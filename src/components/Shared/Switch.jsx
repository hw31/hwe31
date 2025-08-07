import React from "react";
import styled from "styled-components";

const Switch = ({ checked, onChange }) => {
  return (
    <StyledWrapper>
      <label className="switch">
        <input className="cb" type="checkbox" checked={checked} onChange={onChange} />
        <span className="toggle">
          <span className="left">off</span>
          <span className="right">on</span>
        </span>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* The switch - the box around the slider */
  .switch {
    font-size: 14px;       /* De 12px a 14px */
    position: relative;
    display: inline-block;
    width: 4.2em;          /* De 3.5em a 4.2em */
    height: 2.1em;         /* De 1.75em a 2.1em */
    user-select: none;
  }

  /* Hide default HTML checkbox */
  .switch .cb {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .toggle {
    position: absolute;
    cursor: pointer;
    width: 100%;
    height: 100%;
    background-color: #373737;
    border-radius: 0.1em;
    transition: 0.4s;
    text-transform: uppercase;
    font-weight: 700;
    overflow: hidden;
    box-shadow: -0.3em 0 0 0 #373737, -0.3em 0.3em 0 0 #373737,
      0.3em 0 0 0 #373737, 0.3em 0.3em 0 0 #373737, 0 0.3em 0 0 #373737;
  }

  .toggle > .left {
    position: absolute;
    display: flex;
    width: 50%;
    height: 88%;
    background-color: #f3f3f3;
    color: #373737;
    left: 0;
    bottom: 0;
    align-items: center;
    justify-content: center;
    transform-origin: right;
    transform: rotateX(10deg);
    transform-style: preserve-3d;
    transition: all 150ms;
    font-size: 0.85em;  /* De 0.7em a 0.85em */
  }

  .left::before {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    background-color: rgb(206, 206, 206);
    transform-origin: center left;
    transform: rotateY(90deg);
  }

  .left::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    background-color: rgb(112, 112, 112);
    transform-origin: center bottom;
    transform: rotateX(90deg);
  }

  .toggle > .right {
    position: absolute;
    display: flex;
    width: 50%;
    height: 88%;
    background-color: #f3f3f3;
    color: rgb(206, 206, 206);
    right: 1px;
    bottom: 0;
    align-items: center;
    justify-content: center;
    transform-origin: left;
    transform: rotateX(10deg) rotateY(-45deg);
    transform-style: preserve-3d;
    transition: all 150ms;
    font-size: 0.85em; /* De 0.7em a 0.85em */
  }

  .right::before {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    background-color: rgb(206, 206, 206);
    transform-origin: center right;
    transform: rotateY(-90deg);
  }

  .right::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    background-color: rgb(112, 112, 112);
    transform-origin: center bottom;
    transform: rotateX(90deg);
  }

  .switch input:checked + .toggle > .left {
    transform: rotateX(10deg) rotateY(45deg);
    color: rgb(206, 206, 206);
  }

  .switch input:checked + .toggle > .right {
    transform: rotateX(10deg) rotateY(0deg);
    color: #487bdb;
  }
`;

export default Switch;
