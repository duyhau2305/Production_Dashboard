
import { createSlice } from '@reduxjs/toolkit';
import { format } from 'date-fns';

const initialState = [
  {
    id: 1,
    machineCode: 'M123',
    machineName: 'Máy trộn',
    maintenanceDate: format(new Date('2024-08-01'), 'yyyy-MM-dd'),
    status: 'Mới tạo',
    creator: 'Nguyễn Văn A'
  },
  {
    id: 2,
    machineCode: 'M456',
    machineName: 'Máy nướng',
    maintenanceDate: format(new Date('2024-09-15'), 'yyyy-MM-dd'),
    status: 'Đang Bảo Dưỡng',
    creator: 'Trần Thị B'
  }
];

const maintenancePlanSlice = createSlice({
  name: 'maintenancePlan',
  initialState,
  reducers: {
    addMaintenancePlan: (state, action) => {
      state.push({ id: state.length + 1, ...action.payload });
    },
    updateMaintenancePlan: (state, action) => {
      const index = state.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload };
      }
    },
    deleteMaintenancePlan: (state, action) => {
      return state.filter(plan => plan.id !== action.payload);
    },
  },
});

export const { addMaintenancePlan, updateMaintenancePlan, deleteMaintenancePlan } = maintenancePlanSlice.actions;
export default maintenancePlanSlice.reducer;
