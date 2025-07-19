import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import config from "../../config";
import api from "../../services/api";

// Obtener modo oscuro (booleano) desde backend o mock
export const fetchModoOscuro = createAsyncThunk(
  "theme/fetchModoOscuro",
  async (_, { rejectWithValue }) => {
    try {
      if (config.MODO_MOCK) {
        return config.MODO_OSCURO_MOCK;
      }
      const response = await api.get("/Usuarios/modo-oscuro");
      return response.data.modoOscuro === true; // aseguramos booleano
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error al cargar modo oscuro");
    }
  }
);

// Actualizar modo oscuro (enviar como booleano)
export const toggleModoOscuro = createAsyncThunk(
  "theme/toggleModoOscuro",
  async (nuevoValor, { rejectWithValue }) => {
    try {
      if (config.MODO_MOCK) {
        return nuevoValor;
      }

      // ✅ Enviar como booleano directamente
      await api.put("/Usuarios/modo-oscuro", { modoOscuro: nuevoValor });
      return nuevoValor;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error al cambiar modo oscuro");
    }
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    modoOscuro: false,
    loading: false,
    error: null,
  },
  reducers: {
    setModoOscuro: (state, action) => {
      state.modoOscuro = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModoOscuro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModoOscuro.fulfilled, (state, action) => {
        state.modoOscuro = action.payload;
        state.loading = false;
      })
      .addCase(fetchModoOscuro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleModoOscuro.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleModoOscuro.fulfilled, (state, action) => {
        state.modoOscuro = action.payload;
        state.loading = false;
      })
      .addCase(toggleModoOscuro.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setModoOscuro } = themeSlice.actions;
export default themeSlice.reducer;
