import React from 'react';
import { Outlet } from 'react-router-dom';

const Main = () => {
  return (
    <div className="min-h-screen bg-[#eceef7] flex items-center justify-center relative px-6">

      {/* Container visual para contenido (login, start, etc) */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">

        {/* Logo dentro del container, posición absoluta arriba derecha */}
        <div className="absolute top-5 right-5 bg-[#715cff] rounded-full w-[100px] h-[100px] flex items-center justify-center shadow-xl overflow-hidden">
          <div className="bg-[#eceef7] rounded-full w-[90px] h-[90px] flex items-center justify-center overflow-hidden">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default Main;