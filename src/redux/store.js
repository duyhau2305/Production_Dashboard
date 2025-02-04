// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import intervalReducer from './intervalSlice';

// Function to save state to localStorage
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('intervalState', serializedState);
  } catch (e) {
    console.error("Lỗi khi lưu state vào localStorage:", e);
  }
};

// Function to load state from localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('intervalState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (e) {
    console.error("Lỗi khi load state từ localStorage:", e);
    return undefined;
  }
};

// Load state from localStorage or fallback to default
const preloadedState = loadStateFromLocalStorage();

// Ensure that the selectedDate is always today's date when the page is refreshed
const store = configureStore({
  reducer: {
    interval: intervalReducer,
  },
  preloadedState: {
    interval: preloadedState || {
      selectedDate: new Date().toISOString().split('T')[0], // Fallback to today's date
      selectedMachine: null,
      selectedIntervals: [],
      declaredIntervals: {},
      isCalling: false,
      callingDepartment: '',
      callingDeviceId: null,
    },
  },
});

// Subscribe to store changes and save the state to localStorage
store.subscribe(() => {
  saveStateToLocalStorage(store.getState().interval);
});

export default store;
