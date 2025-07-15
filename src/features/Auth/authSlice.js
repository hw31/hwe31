import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  usuario: null,
  token: null,
  idSesion: null,
  persona: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.usuario = action.payload.usuario;
      state.token = action.payload.token;
      state.idSesion = action.payload.id_sesion;
      state.persona = action.payload.persona;
    },
    logout: (state) => {
      state.usuario = null;
      state.token = null;
      state.idSesion = null;
      state.persona = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;