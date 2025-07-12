import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Start = () => {
  const images = ["/images/robothola.gif"];

  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Precarga el GIF para que no se vea cargando
    const preloadedImages = async () => {
      try {
        await Promise.all(
          images.map((imageSrc) => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageSrc;
            });
          })
        );
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error cargando imagen:", error);
      }
    };
    preloadedImages();
  }, [images]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-md mx-auto">
      
      <div className="w-72 h-72 mb-12 flex items-center justify-center rounded-3xl shadow-lg bg-white">
        {imagesLoaded ? (
          <img
            src={images[0]}
            alt="Animación de bienvenida"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-400">Cargando animación...</div>
        )}
      </div>

      <Link to="/login" className="w-full px-4">
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full shadow-lg transition duration-300 font-semibold text-lg">
          Ingresar
        </button>
      </Link>
    </div>
  );
};

export default Start;