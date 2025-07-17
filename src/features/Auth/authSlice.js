import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  usuario: null,
  token: null,       // opcional, si tu backend no envía token
  idSesion: null,
  persona: null,
  idUsuario: null,   // para guardar el id_usuario del backend
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
    },
    logout: (state) => {
      state.usuario = null;
      state.token = null;
      state.idSesion = null;
      state.persona = null;
      state.idUsuario = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
