import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/authSlice';
import themeReducer from '../features/theme/themeSlice';
import estadoReducer from '../features/States/estadosSlice';
import storageSession from 'redux-persist/lib/storage/session';
import { persistReducer, persistStore } from 'redux-persist';

// Configuración de persistencia solo para auth
const persistConfig = {
  key: 'auth',
  storage: storageSession,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,  // auth con persistencia en sessionStorage
    theme: themeReducer,         // theme sin persistencia local
    estado: estadoReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // necesario para redux-persist y async thunk
    }),
});

export const persistor = persistStore(store);

export default store;