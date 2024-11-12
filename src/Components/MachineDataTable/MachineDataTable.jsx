import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'antd';

const MachineDataTable = ({ machineSerial }) => {
  const [dataSource, setDataSource] = useState([]);
  const [startDate, setStartDate] = useState('2024-11-01T17:00:00Z');  // Example startDate
  const [endDate, setEndDate] = useState('2024-11-10T16:59:59Z');    // Example endDate
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/machine-operations/top-ten?startTime=2024-11-01T17:00:00Z&endTime=2024-11-10T16:59:59Z&machineSerial=${machineSerial}&type=1`
      );
       
      const data = response.data.data.data;
      const formattedData = data.map(record => ({
        key: record._id,
        machineSerialNum: record.machineSerialNum,
        totalRunTime: record.totalRunTime,
        totalStopTime: record.totalStopTime,
        totalIdleTime: record.totalIdleTime,
        startDate: new Date(startDate).toLocaleDateString('vi-VN'),
        endDate: new Date(endDate).toLocaleDateString('vi-VN'),   
      }));

      setDataSource(formattedData);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [machineSerial, startDate, endDate]);

  const columns = [
    {
      title: 'Mã Máy',
      dataIndex: 'machineSerialNum',
      key: 'machineSerialNum',
    },
    {
        title: 'Ngày Bắt Đầu',
        dataIndex: 'startDate',
        key: 'startDate',
        render: (value) => `${value.split('T')[0]}`,
  
      },
      {
        title: 'Ngày Kết Thúc',
        dataIndex: 'endDate',
        key: 'endDate',
        render: (value) => `${value.split('T')[0]}`,
  
      },
    {
      title: 'Tổng Thời Gian Chạy',
      dataIndex: 'totalRunTime',
      key: 'totalRunTime',
      render: (value) => `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`,
    },
    {
      title: 'Tổng Thời Gian Dừng',
      dataIndex: 'totalStopTime',
      key: 'totalStopTime',
      render: (value) => `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`,
    },
    {
      title: 'Tổng Thời Gian Nhàn Rỗi',
      dataIndex: 'totalIdleTime',
      key: 'totalIdleTime',
      render: (value) => `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m`,
    },
    
  ];

  return (
    <div style={{ width: '100%' }}>
      <h2 className="text-center font-bold">Dữ Liệu Máy - {machineSerial}</h2>
      <Table 
        dataSource={dataSource} 
        columns={columns} 
        pagination={false} 
        rowKey="key"
      />
    </div>
  );
};

export default MachineDataTable;
