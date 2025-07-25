import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import estadoService from '../../services/Estado';

export const fetchEstados = createAsyncThunk('estado/fetchEstados', async () => {
  const response = await estadoService.listarEstados();
  const data = Array.isArray(response)
    ? response
    : response.datos || response.data || [];

  return data.filter(e => e.iD_Estado === 1 || e.iD_Estado === 2).map(e => ({
    idEstado: e.iD_Estado,
    nombreEstado: e.nombre_Estado,
  }));
});

const estadoSlice = createSlice({
  name: 'estado',
  initialState: {
    estados: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEstados.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEstados.fulfilled, (state, action) => {
        state.loading = false;
        state.estados = action.payload;
      })
      .addCase(fetchEstados.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default estadoSlice.reducer;