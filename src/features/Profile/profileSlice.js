import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fotoPerfilService from "../../services/Profile";

// Async thunk para obtener la foto de perfil
export const fetchFotoPerfil = createAsyncThunk(
  "profile/fetchFotoPerfil",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fotoPerfilService.obtenerMiFoto();
      if (res.success && res.ruta) {
        // Retornamos la URL completa (ajusta base URL según tu backend)
        return `http://localhost:5292${res.ruta}`;
      } else {
        return rejectWithValue("No hay foto disponible");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Error al obtener la foto");
    }
  }
);

const initialState = {
  fotoPerfilUrl: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.fotoPerfilUrl = null;
      state.loading = false;
      state.error = null;
    },
    setFotoPerfilUrl: (state, action) => {
      state.fotoPerfilUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFotoPerfil.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFotoPerfil.fulfilled, (state, action) => {
        state.loading = false;
        state.fotoPerfilUrl = action.payload;
      })
      .addCase(fetchFotoPerfil.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fotoPerfilUrl = null;
      });
  },
});

export const { clearProfile, setFotoPerfilUrl } = profileSlice.actions;

export const selectFotoPerfilUrl = (state) => state.profile?.fotoPerfilUrl || null;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;

export default profileSlice.reducer;
