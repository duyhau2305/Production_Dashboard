// src/redux/intervalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const getTodayDate = () => new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

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
  selectedDate: getTodayDate(),  // Default to today's date
  selectedMachine: null,
  selectedIntervals: [],
  declaredIntervals: {},
  isCalling: false,
  callingDepartment: '',
  callingDeviceId: null,
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
    startCallHelp: (state, action) => {
      state.isCalling = true;
      state.callingDepartment = action.payload.department;
      state.callingDeviceId = action.payload.deviceId;
    },
    stopCallHelp: (state) => {
      state.isCalling = false;
      state.callingDepartment = '';
      state.callingDeviceId = null;
    },
  },
});

export const { setMachineData, declareInterval, startCallHelp, stopCallHelp } = intervalSlice.actions;

export default intervalSlice.reducer;
