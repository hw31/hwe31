import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchModoOscuro } from "../theme/themeSlice"; // importa el thunk para obtener modo oscuro

// Acción para verificar sesión (persistencia)
export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { getState, dispatch }) => {
    const state = getState().auth;

    if (state.token && state.idSesion) {
      // Disparar fetchModoOscuro para obtener configuración guardada en backend
      await dispatch(fetchModoOscuro());

      return {
        isAuthenticated: true,
        ...state,
      };
    }

    return {
      isAuthenticated: false,
    };
  }
);

const initialState = {
  usuario: null,
  token: null,
  idSesion: null,
  persona: null,
  idUsuario: null,
  modo: "light", // <-- modo claro por defecto
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.usuario = action.payload.usuario || null;
      state.token = action.payload.accessToken || null;
      state.idSesion = action.payload.idSesion || null;
      state.persona = action.payload.persona || null;
      state.idUsuario = action.payload.idUsuario || null;
      state.modo = action.payload.modo_oscuro === 1 ? "dark" : "light";
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.usuario = null;
      state.token = null;
      state.idSesion = null;
      state.persona = null;
      state.idUsuario = null;
      state.modo = "light";
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkSession.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.loading = false;

      if (action.payload.isAuthenticated) {
        state.usuario = action.payload.usuario;
        state.token = action.payload.accessToken;
        state.idSesion = action.payload.idSesion;
        state.persona = action.payload.persona;
        state.idUsuario = action.payload.idUsuario;
        state.modo = action.payload.modo_oscuro === 1 ? "dark" : "light";
      }
    });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;