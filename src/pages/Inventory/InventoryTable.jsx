import React from 'react';

function InventoryTable({ limit }) {
  const inventoryData = [
    { category: 'Nguyên vật liệu ', material: 'Đường', quantity: '500 kg', warehouse: 'Kho 1' },
    { category: 'Nguyên vật liệu ', material: 'Bột mì', quantity: '300 kg', warehouse: 'Kho 2' },
    { category: 'Nguyên vật liệu ', material: 'Bơ', quantity: '200 kg', warehouse: 'Kho 1' },
    { category: 'Nguyên vật liệu ', material: 'Sữa', quantity: '100 lít', warehouse: 'Kho 3' },
    { category: 'Nguyên vật liệu ', material: 'Socola', quantity: '50 kg', warehouse: 'Kho 2' },
    { category: 'Phụ liệu', material: 'Phẩm màu', quantity: '10 kg', warehouse: 'Kho 2' },
    { category: 'Phụ liệu', material: 'Hương liệu', quantity: '15 lít', warehouse: 'Kho 3' },
    { category: 'Phụ liệu', material: 'Chất bảo quản', quantity: '5 kg', warehouse: 'Kho 1' },
    { category: 'Nguyên vật liệu ', material: 'Socola', quantity: '50 kg', warehouse: 'Kho 2' },
    { category: 'Phụ liệu', material: 'Phẩm màu', quantity: '10 kg', warehouse: 'Kho 2' },
    { category: 'Phụ liệu', material: 'Hương liệu', quantity: '15 lít', warehouse: 'Kho 3' },
    { category: 'Phụ liệu', material: 'Chất bảo quản', quantity: '5 kg', warehouse: 'Kho 1' },
    { category: 'Nguyên vật liệu ', material: 'Socola', quantity: '50 kg', warehouse: 'Kho 2' },
    { category: 'Phụ liệu', material: 'Phẩm màu', quantity: '10 kg', warehouse: 'Kho 2' },
    { category: 'Phụ liệu', material: 'Hương liệu', quantity: '15 lít', warehouse: 'Kho 3' },
    { category: 'Phụ liệu', material: 'Chất bảo quản', quantity: '5 kg', warehouse: 'Kho 1' },
  ];

  // Nếu có giá trị limit, chỉ lấy số lượng hàng theo giới hạn này, nếu không lấy toàn bộ
  const dataToDisplay = limit ? inventoryData.slice(0, limit) : inventoryData;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Chi tiết tồn kho nguyên vật liệu và phụ liệu</h3>
      <table className="min-w-full bg-white border-collapse">
        <thead>
          <tr>
         
            <th className="py-2 px-4 border-b">Loại</th>
            <th className="py-2 px-4 border-b">Tên sản phẩm</th>
            <th className="py-2 px-4 border-b">Số lượng</th>
            <th className="py-2 px-4 border-b">Kho</th>
          </tr>
        </thead>
        <tbody>
          {dataToDisplay.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{item.category}</td>
              <td className="py-2 px-4 border-b">{item.material}</td>
              <td className="py-2 px-4 border-b">{item.quantity}</td>
              <td className="py-2 px-4 border-b">{item.warehouse}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
