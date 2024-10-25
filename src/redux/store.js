import { configureStore } from '@reduxjs/toolkit';
import intervalReducer from './intervalSlice';

const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('intervalState', serializedState);
  } catch (e) {
    console.error("Lỗi khi lưu state vào localStorage:", e);
  }
};

const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('intervalState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (e) {
    console.error("Lỗi khi load state từ localStorage:", e);
    return undefined;
  }
};

const store = configureStore({
  reducer: {
    interval: intervalReducer,
  },
  preloadedState: loadStateFromLocalStorage(),
});

store.subscribe(() => {
  saveStateToLocalStorage(store.getState().interval);
});

export default store;
