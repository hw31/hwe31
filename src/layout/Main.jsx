import React from 'react';
import { Outlet } from 'react-router-dom';


const Main = () => {
  return (
    <div className="main-container">
      <div className="main-content">
        <div className="logo-wrapper">
   
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default Main;