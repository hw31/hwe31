import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/authSlice';
import storageSession from 'redux-persist/lib/storage/session'; // sessionStorage
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'auth',
  storage: storageSession,
 
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist usa acciones no serializables, se puede desactivar aquí
    }),
});

export const persistor = persistStore(store);
