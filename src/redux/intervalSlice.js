// src/redux/intervalSlice.js
import { createSlice } from '@reduxjs/toolkit';

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
  selectedIntervals: [],
  declaredIntervals: {},
  isCalling: false,
  callingDepartment: '',
  callingDeviceId: null,  // Lưu `deviceId` của máy đang gọi
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
      state.callingDeviceId = action.payload.deviceId;  // Lưu `deviceId` của máy đang gọi
    },
    stopCallHelp: (state) => {
      state.isCalling = false;
      state.callingDepartment = '';
      state.callingDeviceId = null;  // Xóa `deviceId` khi kết thúc cuộc gọi
    },
  },
});

export const { setMachineData, declareInterval, startCallHelp, stopCallHelp } = intervalSlice.actions;

export default intervalSlice.reducer;
