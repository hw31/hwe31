import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api'; 

// Thunk para verificar sesión con refresh token (cookie)
export const checkSession = createAsyncThunk('auth/checkSession', async (_, thunkAPI) => {
  try {
    const response = await api.get('/Auth/refresh'); // endpoint que valida cookie y devuelve user + token
    const { user, token } = response.data;

    // Opcional: inyectar access token a Axios
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return { user };
  } catch (error) {
    return thunkAPI.rejectWithValue('Sesión inválida o expirada');
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;