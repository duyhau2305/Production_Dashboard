import React, { useCallback, useEffect, useState } from 'react';
import Breadcrumb from '../../../../Components/Breadcrumb/Breadcrumb';
import { DatePicker, Button, Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import DeviceTopEmployeeTable from '../../../../Components/Employee/DeviceTopEmployeeTable';
import TopEmployeeChart from '../../../../Components/TopTenChart/TopEmployeeChart';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import TopEmployeeRanking from '../../../../Components/TopTenChart/TopEmployeeRanking';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TopEmployee = () => {
  const [selectedDate, setSelectedDate] = useState([dayjs().startOf('week'), dayjs().endOf('week')]); // Default to current week
  const [topEmployeesData, setTopEmployeesData] = useState([]);
  const [runTimeData, setRunTimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('weekly'); // Default view mode set to 'weekly'

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let startTime, endTime;
      if (viewMode === 'monthly') {
        startTime = selectedDate.startOf('month').toISOString();
        endTime = selectedDate.endOf('month').toISOString();
      } else {
        startTime = selectedDate[0].startOf('day').toISOString();
        endTime = selectedDate[1].endOf('day').toISOString();
      }

      const response = await fetch(`${apiUrl}/machine-operations/topemployee?startTime=${startTime}&endTime=${endTime}`);
      const result = await response.json();

      if (result.status === 200 && result.data) {
        const data = result.data;

        const employeeRunTimeMap = {};
        const runTimeDetails = [];

        data.forEach((machine) => {
          const deviceId = machine.deviceId;

          // Group `summaryStatus` by logDate in Asia/Ho_Chi_Minh timezone
          const summaryStatusByDate = machine.summaryStatus.reduce((acc, status) => {
            const statusDate = dayjs(status.logTime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
            if (!acc[statusDate]) acc[statusDate] = [];
            acc[statusDate].push(status);
            return acc;
          }, {});

          machine.productionTasks.forEach((task) => {
            const taskDate = dayjs(task.date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

            if (summaryStatusByDate[taskDate]) {
              const dailyRunTime = summaryStatusByDate[taskDate]
                .reduce((total, status) => total + (status.runTime || 0), 0);

              if (dailyRunTime > 0) {
                task.shifts.forEach((shift) => {
                  shift.employeeName.forEach((employee) => {
                    // Add total runtime for the employee
                    employeeRunTimeMap[employee] = (employeeRunTimeMap[employee] || 0) + dailyRunTime;

                    // Add detailed data
                    const existingEntry = runTimeDetails.find(
                      (entry) => entry.employee === employee && entry.deviceId === deviceId
                    );

                    if (existingEntry) {
                      existingEntry.runTime += dailyRunTime;
                      if (!existingEntry.dates.includes(taskDate)) {
                        existingEntry.dates.push(taskDate);
                      }
                    } else {
                      runTimeDetails.push({
                        employee,
                        deviceId,
                        runTime: dailyRunTime,
                        dates: [taskDate],
                      });
                    }
                  });
                });
              }
            }
          });
        });

        const topEmployeesArray = Object.entries(employeeRunTimeMap)
          .map(([name, runTime]) => ({
            name,
            hours: (runTime / 3600).toFixed(2),
          }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 10);

        const filteredRunTimeDetails = runTimeDetails.filter((entry) =>
          topEmployeesArray.some((employee) => employee.name === entry.employee)
        );

        setTopEmployeesData(topEmployeesArray);
        setRunTimeData(filteredRunTimeDetails);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    fetchData();
  }, [selectedDate, viewMode]);

  const handleDateChange = (dates) => {
    setSelectedDate(viewMode === 'monthly' ? dates.startOf('month') : dates);
  };

  const goToPrevious = () => {
    setSelectedDate(viewMode === 'monthly' ? selectedDate.subtract(1, 'month').startOf('month') : [selectedDate[0].subtract(1, 'week').startOf('week'), selectedDate[1].subtract(1, 'week').endOf('week')]);
  };

  const goToNext = () => {
    setSelectedDate(viewMode === 'monthly' ? selectedDate.add(1, 'month').startOf('month') : [selectedDate[0].add(1, 'week').startOf('week'), selectedDate[1].add(1, 'week').endOf('week')]);
  };

  const goToCurrent = () => {
    setSelectedDate(viewMode === 'monthly' ? dayjs().startOf('month') : [dayjs().startOf('week'), dayjs().endOf('week')]);
  };

  const goToLast = () => {
    setSelectedDate(viewMode === 'monthly' ? dayjs().subtract(1, 'month').startOf('month') : [dayjs().subtract(1, 'week').startOf('week'), dayjs().subtract(1, 'week').endOf('week')]);
  };

  const handleViewModeChange = (value) => {
    setViewMode(value);
    setSelectedDate(value === 'monthly' ? dayjs().startOf('month') : [dayjs().startOf('week'), dayjs().endOf('week')]);
  };

  return (
    <div>
      <div className="flex justify-between flex-shrink-0 items-center mb-4">
        <Breadcrumb />
        <div className="flex justify-between items-center space-x-2">
          <Button onClick={goToLast}>{viewMode === 'monthly' ? 'Tháng Trước' : 'Tuần Trước'}</Button>
          <Button onClick={goToCurrent}>{viewMode === 'monthly' ? 'Tháng Này' : 'Tuần Này'}</Button>
          <Button icon={<LeftOutlined />} onClick={goToPrevious} />
          {viewMode === 'monthly' ? (
            <DatePicker
              picker="month"
              onChange={handleDateChange}
              value={selectedDate}
              format="MM/YYYY"
            />
          ) : (
            <RangePicker
              onChange={handleDateChange}
              value={selectedDate}
              format="DD/MM/YYYY"
            />
          )}
          <Button icon={<RightOutlined />} onClick={goToNext} />
          <Select defaultValue="weekly" onChange={handleViewModeChange}>
            <Option value="weekly">Theo Tuần</Option>
            <Option value="monthly">Theo Tháng</Option>
          </Select>
        </div>
      </div>

      {isLoading && <p>Đang tải dữ liệu...</p>}

      {!isLoading && (
        <div className="grid grid-flow-row ">
          <div className="mb-2">
            <TopEmployeeRanking topEmployeesData={topEmployeesData} />
          </div>
          <hr className="font-bold text-black" />
          <div className="mb-1 bg-white">
            <h3 className="text-lg font-bold mb-4 ml-2 mt-2">Biểu đồ top 10 nhân viên đứng máy nhiều nhất </h3>
            <TopEmployeeChart data={topEmployeesData} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Bảng Thống Kê Chi Tiết</h3>
            <DeviceTopEmployeeTable runTimeData={runTimeData} topEmployees={topEmployeesData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopEmployee;
