import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Verifica si hay sesión persistida
export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { getState }) => {
    const state = getState().auth;

    if (state.token && state.idSesion) {
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
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.usuario = action.payload.usuario || null;
      state.token = action.payload.token || null;
      state.idSesion = action.payload.idSesion || null;
      state.persona = action.payload.persona || null;
      state.idUsuario = action.payload.idUsuario || null;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.usuario = null;
      state.token = null;
      state.idSesion = null;
      state.persona = null;
      state.idUsuario = null;
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
        state.token = action.payload.token;
        state.idSesion = action.payload.idSesion;
        state.persona = action.payload.persona;
        state.idUsuario = action.payload.idUsuario;
      }
    });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
