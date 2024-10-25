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
  import { addMaintenancePlan, updateMaintenancePlan, deleteMaintenancePlan } from '../../redux/maintenancePlanSlice'; 

  const MaintenancePlanCatalog = () => {
    const maintenancePlans = useSelector(state => state.maintenancePlan);
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [exportStartDate, setExportStartDate] = useState(new Date());
    const [exportEndDate, setExportEndDate] = useState(new Date());

    const handleSave = (data) => {
      if (selectedPlan) {
        dispatch(updateMaintenancePlan({ id: selectedPlan.id, ...data }));
        toast.success('Cập nhật thành công!');
      } else {
        dispatch(addMaintenancePlan(data));
        toast.success('Đã lưu thành công!');
      }
      setIsModalOpen(false);
      setSelectedPlan(null);
    };

    const handleDelete = (id) => {
      dispatch(deleteMaintenancePlan(id));
      toast.success('Xóa thành công!');
    };

    const handleSearch = (query) => {
      setSearchQuery(query);
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Mới tạo':
          return 'text-gray-500'; 
        case 'Đang Bảo Dưỡng':
          return 'text-green-500'; 
        case 'Kết Thúc':
          return 'text-red-500'; 
        default:
          return 'text-gray-500';
      }
    };

    const filteredPlans = maintenancePlans.filter(
      (plan) =>
        plan.machineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.machineName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredExportPlans = maintenancePlans.filter(
      (plan) =>
        plan.maintenanceDate >= exportStartDate &&
        plan.maintenanceDate <= exportEndDate
    );

    return (
      <div className="p-4 bg-white shadow-md rounded-md">
        <div className="flex items-center gap-2 mb-4">
          <SearchButton placeholder="Tìm kiếm máy..." onSearch={handleSearch} />
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
            <ExportExcelButton data={filteredExportPlans} fileName="Kế hoạch bảo dưỡng.xlsx" />
          </div>
        </div>

        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-xs">STT</th>
              <th className="border px-4 py-2 text-xs">Mã Máy</th>
              <th className="border px-4 py-2 text-xs">Tên Máy</th>
              <th className="border px-4 py-2 text-xs">Ngày Bảo Dưỡng</th>
              <th className="border px-4 py-2 text-xs">Trạng Thái</th>
              <th className="border px-4 py-2 text-xs">Người Lập</th>
              <th className="border px-4 py-2 text-xs">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan, index) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-sm text-center">{index + 1}</td>
                <td className="border px-4 py-2 text-sm text-center">{plan.machineCode}</td>
                <td className="border px-4 py-2 text-sm text-center">{plan.machineName}</td>
                <td className="border px-4 py-2 text-sm text-center">
                  {format(new Date(plan.maintenanceDate), 'dd/MM/yyyy')}
                </td>
                <td className={`border px-4 py-2 text-sm text-center font-bold ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </td>
                <td className="border px-4 py-2 text-sm text-center">{plan.creator}</td>
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
            { name: 'machineCode', label: 'Mã Máy', type: 'text', validation: yup.string().required('Mã Máy là bắt buộc') },
            { name: 'machineName', label: 'Tên Máy', type: 'text', validation: yup.string().required('Tên Máy là bắt buộc') },
            { name: 'maintenanceDate', label: 'Ngày Bảo Dưỡng', type: 'date', validation: yup.date().required('Ngày Bảo Dưỡng là bắt buộc') },
            { name: 'status', label: 'Trạng Thái', type: 'text', validation: yup.string().required('Trạng Thái là bắt buộc') },
            { name: 'creator', label: 'Người Lập', type: 'text', validation: yup.string().required('Người Lập là bắt buộc') },
          ]}
          contentLabel={selectedPlan ? 'Chỉnh sửa Kế hoạch Bảo dưỡng' : 'Thêm mới Kế hoạch Bảo dưỡng'}
          initialData={selectedPlan}
        />
        
        <ToastContainer />
      </div>
    );
  };

  export default MaintenancePlanCatalog;
