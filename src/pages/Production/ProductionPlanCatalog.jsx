// ProductionPlanCatalog.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicFormModal from '../../Components/Modal/DynamicFormModal';
import SearchButton from '../../Components/Button/SearchButton';
import AddButton from '../../Components/Button/AddButton';
import ExportExcelButton from '../../Components/Button/ExportExcelButton';
import * as yup from 'yup';
import { format } from 'date-fns';
import { addPlan, updatePlan, deletePlan } from '../../redux/appSlice';

const ProductionPlanCatalog = () => {
  const plans = useSelector(state => state.productionPlan);
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [exportStartDate, setExportStartDate] = useState(new Date());
  const [exportEndDate, setExportEndDate] = useState(new Date());

  const handleSave = (data) => {
    if (selectedPlan) {
      dispatch(updatePlan({ id: selectedPlan.id, ...data }));
      toast.success('Cập nhật thành công!');
    } else {
      dispatch(addPlan(data));
      toast.success('Đã lưu thành công!');
    }
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleDelete = (id) => {
    dispatch(deletePlan(id));
    toast.success('Xóa thành công!');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Mới tạo':
        return 'text-gray-500'; // Màu xám cho trạng thái "Mới tạo"
      case 'Đang sản xuất':
        return 'text-green-500'; // Màu xanh cho trạng thái "Đang sản xuất"
      default:
        return 'text-red-500'; // Màu đỏ cho các trạng thái khác
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.productionOrder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.productionOrderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExportPlans = plans.filter(
    (plan) =>
      plan.startDate >= exportStartDate &&
      plan.endDate <= exportEndDate
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <div className="flex items-center gap-2 mb-4">
        <SearchButton placeholder="Tìm kiếm lệnh sản xuất..." onSearch={handleSearch} />
        <AddButton onClick={() => setIsModalOpen(true)} />

        <div className="flex-grow"></div>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={format(exportStartDate, 'yyyy-MM-dd')}
            onChange={(e) => setExportStartDate(new Date(e.target.value))}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={format(exportEndDate, 'yyyy-MM-dd')}
            onChange={(e) => setExportEndDate(new Date(e.target.value))}
            className="p-2 border rounded"
          />
          <ExportExcelButton data={filteredExportPlans} fileName="Kế hoạch sản xuất.xlsx" />
        </div>
      </div>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-xs">STT</th>
            <th className="border px-4 py-2 text-xs">Lệnh sản xuất</th>
            <th className="border px-4 py-2 text-xs">Tên lệnh sản xuất</th>
            <th className="border px-4 py-2 text-xs">Ngày bắt đầu</th>
            <th className="border px-4 py-2 text-xs">Ngày kết thúc</th>
            <th className="border px-4 py-2 text-xs">Số lượng</th>
            <th className="border px-4 py-2 text-xs">Trạng thái</th>
            <th className="border px-4 py-2 text-xs">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlans.map((plan, index) => (
            <tr key={plan.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2 text-sm text-center">{index + 1}</td>
              <td className="border px-4 py-2 text-sm text-center ">{plan.productionOrder}</td>
              <td className="border px-4 py-2 text-sm text-center  ">{plan.productionOrderName}</td>
              <td className="border px-4 py-2 text-sm text-center ">
                {format(new Date(plan.startDate), 'dd/MM/yyyy')}
              </td>
              <td className="border px-4 py-2 text-sm text-center">
                {format(new Date(plan.endDate), 'dd/MM/yyyy')}
              </td>
              <td className="border px-4 py-2 text-sm text-center">{plan.quantity}</td>
              <td className={`border px-4 py-2 text-sm text-center font-bold ${getStatusColor(plan.status)}`}>
                {plan.status}
              </td>
              <td className="py-2 px-2 text-center border">
                <button
                  className={`mr-2 ${plan.status !== 'Mới tạo' ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'}`}
                  onClick={() => {
                    if (plan.status === 'Mới tạo') {
                      setSelectedPlan(plan);
                      setIsModalOpen(true);
                    }
                  }}
                  disabled={plan.status !== 'Mới tạo'}
                >
                  <FaEdit />
                </button>
                <button
                  className={`${plan.status !== 'Mới tạo' ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`}
                  onClick={() => {
                    if (plan.status === 'Mới tạo') {
                      handleDelete(plan.id);
                    }
                  }}
                  disabled={plan.status !== 'Mới tạo'}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DynamicFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        onSave={handleSave}
        formFields={[
          { name: 'productionOrder', label: 'Lệnh sản xuất', type: 'text', validation: yup.string().required('Lệnh sản xuất là bắt buộc') },
          { name: 'productionOrderName', label: 'Tên lệnh sản xuất', type: 'text', validation: yup.string().required('Tên lệnh sản xuất là bắt buộc') },
          { name: 'startDate', label: 'Ngày bắt đầu', type: 'date', validation: yup.date().required('Ngày bắt đầu là bắt buộc') },
          {
            name: 'endDate',
            label: 'Ngày kết thúc',
            type: 'date',
            validation: yup.date()
              .required('Ngày kết thúc là bắt buộc')
              .min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
          },
          { name: 'quantity', label: 'Số lượng', type: 'number', validation: yup.number().required('Số lượng là bắt buộc') },
          { name: 'status', label: 'Trạng thái', type: 'text', validation: yup.string().required('Trạng thái là bắt buộc') },
        ]}
        contentLabel={selectedPlan ? 'Chỉnh sửa Lệnh sản xuất' : 'Thêm mới Lệnh sản xuất'}
        initialData={selectedPlan}
      />
      
      <ToastContainer
        
      />
    </div>
  );
};

export default ProductionPlanCatalog;
