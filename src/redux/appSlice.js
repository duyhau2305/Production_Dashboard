// features/productionPlan/productionPlanSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { format } from 'date-fns';

const initialState = [
  {
    id: 1,
    productionOrder: 'PO12345',
    productionOrderName: 'Sản xuất bánh trung thu',
    startDate: format(new Date('2024-08-01'), 'yyyy-MM-dd'),
    endDate: format(new Date('2024-09-30'), 'yyyy-MM-dd'),
    quantity: 10000,
    status: 'Mới tạo'
  },
  {
    id: 2,
    productionOrder: 'PO67890',
    productionOrderName: 'Sản xuất kẹo dẻo',
    startDate: format(new Date('2024-07-01'), 'yyyy-MM-dd'),
    endDate: format(new Date('2024-07-31'), 'yyyy-MM-dd'),
    quantity: 5000,
    status: 'Hoàn thành'
  }
];

const productionPlanSlice = createSlice({
  name: 'productionPlan',
  initialState,
  reducers: {
    addPlan: (state, action) => {
      state.push({ id: state.length + 1, ...action.payload });
    },
    updatePlan: (state, action) => {
      const index = state.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload };
      }
    },
    deletePlan: (state, action) => {
      return state.filter(plan => plan.id !== action.payload);
    },
  },
});

export const { addPlan, updatePlan, deletePlan } = productionPlanSlice.actions;
export default productionPlanSlice.reducer;
