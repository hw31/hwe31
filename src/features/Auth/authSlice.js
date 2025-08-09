import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode"; 
import { fetchModoOscuro } from "../theme/themeSlice";

// Acción para verificar sesión (persistencia)
export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { getState, dispatch }) => {
    const state = getState().auth;

    if (state.token && state.idSesion) {
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
  modo: "light",
  isAuthenticated: false,
  loading: true,
  rol: null,
  fotoPerfilUrl: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const {
        usuario,
        accessToken,
        id_sesion,
        persona,
        id_usuario,
        modo_oscuro,
        fotoPerfilUrl, 
      } = action.payload;

      state.usuario = usuario || null;
      state.token = accessToken || null;
      state.idSesion = id_sesion || null;
      state.persona = persona || null;
      state.idUsuario = id_usuario || null;
      state.modo = modo_oscuro === 1 ? "dark" : "light";
      state.isAuthenticated = true;
      state.loading = false;

      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken); 
          state.rol =
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] || decoded.role || null;
        } catch {
          state.rol = null;
        }
      } else {
        state.rol = null;
      }
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
      state.rol = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(checkSession.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.loading = false;

      if (action.payload.isAuthenticated) {
        state.usuario = action.payload.usuario;
        state.token = action.payload.token || action.payload.accessToken;
        state.idSesion = action.payload.idSesion;
        state.persona = action.payload.persona;
        state.idUsuario = action.payload.idUsuario;
        state.modo =
          action.payload.modo === "dark" ||
          action.payload.modo_oscuro === 1
            ? "dark"
            : "light";

        if (state.token) {
          try {
            const decoded = jwtDecode(state.token); 
            state.rol =
              decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] || decoded.role || null;
          } catch {
            state.rol = null;
          }
        }
      }
    });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export const selectRol = (state) => state.auth.rol;
export default authSlice.reducer;
