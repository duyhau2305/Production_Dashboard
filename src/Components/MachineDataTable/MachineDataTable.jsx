import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import moment from 'moment'; 

const MachineDataTable = ({selectedDate , machineSerial }) => {
  console.log(selectedDate)
 
  
  const [dataSource, setDataSource] = useState([]);
   
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  const fetchData = async (startDate , endDate) => { 
    try {
      const start = startDate.toISOString();
      const end = new Date(endDate);
      const utcDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1, 16, 59, 59, 0));
      const isoDate = utcDate.toISOString();
      
      const response = await axios.get(
        `${apiUrl}/machine-operations/top-ten?startTime=${start}&endTime=${isoDate}&machineSerial=${machineSerial}&type=1`
      );
       
      const data = response.data.data.data;
      const formattedData = data.map((record, index) => ({
        key: record._id,
        index: index + 1,  // Adding STT index here
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
    if (selectedDate?.startDate && selectedDate?.endDate) {
      fetchData(selectedDate.startDate, selectedDate.endDate);
    };
  }, [machineSerial,selectedDate]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
    },
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
