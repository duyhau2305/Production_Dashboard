// src/redux/intervalSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Lấy state từ LocalStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('intervalState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (e) {
    console.error("Lỗi khi load state từ LocalStorage:", e);
    return undefined;
  }
};

const initialState = loadStateFromLocalStorage() || {
  selectedDate: new Date().toISOString().split('T')[0],
  selectedMachine: null,
  selectedIntervals: [], // Chứa các intervals đã chọn
  declaredIntervals: {}, // Lưu các interval đã khai báo theo ngày
};


const intervalSlice = createSlice({
  name: 'interval',
  initialState,
  reducers: {
    setMachineData: (state, action) => {
      const { selectedDate, selectedMachine, selectedIntervals } = action.payload;
      state.selectedDate = selectedDate || state.selectedDate;
      state.selectedMachine = selectedMachine;
      state.selectedIntervals = selectedIntervals || [];
    },
    declareInterval: (state, action) => {
      const { date, intervalIndex } = action.payload;
      if (!state.declaredIntervals[date]) {
        state.declaredIntervals[date] = [];
      }
      if (!state.declaredIntervals[date].includes(intervalIndex)) {
        state.declaredIntervals[date].push(intervalIndex);
      }
    },
  },
});


export const { setMachineData, declareInterval } = intervalSlice.actions;

export default intervalSlice.reducer;
