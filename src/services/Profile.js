import api from "./api";

const subirFoto = async (fotoFile) => {
  try {
    const formData = new FormData();
    formData.append("Foto", fotoFile);

    const response = await api.post("FotoPerfil/subir", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // { Numero, Mensaje, Ruta }
  } catch (error) {
    console.error("Error al subir la foto de perfil:", error);
    throw error;
  }
};

const obtenerMiFoto = async () => {
  try {
    const response = await api.get("FotoPerfil/mi-foto");
    return response.data;
  } catch (error) {
    console.error("Error al obtener la foto de perfil:", error);
    throw error;
  }
};

export default {
  subirFoto,
  obtenerMiFoto,
};
