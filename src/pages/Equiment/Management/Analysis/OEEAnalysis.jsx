import React, { useEffect, useState } from 'react';
import { Select, DatePicker, Space, Radio ,Button} from 'antd';
import moment from 'moment-timezone';
import DeviceTable from '../../../../Components/Equiment/Analysis/DeviceTable';
import DowntimePieChart from '../../../../Components/Equiment/Analysis/DowntimePieChart';
import ParetoTimeChart from '../../../../Components/Equiment/Analysis/ParetoTimeChart';
import ParetoFrequencyChart from '../../../../Components/Equiment/Analysis/ParetoFrequencyChart';
import Breadcrumb from '../../../../Components/Breadcrumb/Breadcrumb';
import axios from 'axios';
import TopTenChart from '../../../../Components/TopTenChart/TopTenChart';
import MachineDataTable from '../../../../Components/MachineDataTable/MachineDataTable';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OEEAnalysis = () => {
    const [devices, setDevices] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]); 
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [downtimeData, setDowntimeData] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);
    const [productionData, setProductionData] = useState([]);
    const [telemetryData, setTelemetryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const currentMonthStart = moment().startOf('month');
    const currentMonthEnd = moment().endOf('month');

    const [selectedDateRange, setSelectedDateRange] = useState({
        startDate: currentMonthStart.toDate(),
        endDate: currentMonthEnd.toDate(),
    });
    const [selectedMachineSerial, setSelectedMachineSerial] = useState("P");
    const [dateRangePickerValue, setDateRangePickerValue] = useState([
        currentMonthStart,
        currentMonthEnd,
    ]);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;


   

    const handleDeviceSearch = (value) => {
        const searchValue = value.toLowerCase();
        const filtered = devices.filter((device) =>
            device.deviceName.toLowerCase().includes(searchValue)
        );
        setFilteredDevices(filtered);
    };

 
    const handleDateChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRangePickerValue(dates);
      setSelectedDateRange({ startDate: dates[0]?.toDate() || null, endDate: dates[1]?.toDate() || null });
           
        } else {
            console.warn('Please select a valid date range.');
        }
    };


    
    const aggregateDowntimeHoursByReason = (data) => {
        const reasonHours = data.reduce((acc, item) => {
            const reason = item.reasonName;
            const totalIntervalHours = item.interval.reduce((sum, interval) => {
                const startTime = moment(interval.startTime);
                const endTime = moment(interval.endTime);
                const durationInHours = moment.duration(endTime.diff(startTime)).asHours();
                return sum + durationInHours;
            }, 0);
            acc[reason] = (acc[reason] || 0) + totalIntervalHours;
            return acc;
        }, {});

        return {
            labels: Object.keys(reasonHours),
            values: Object.values(reasonHours),
        };
    };

    const aggregateFrequencyByReason = (data) => {
        const reasonCounts = data.reduce((acc, item) => {
            const reason = item.reasonName;
            const frequency = item.interval.length;

            acc[reason] = (acc[reason] || 0) + frequency;
            return acc;
        }, {});

        return {
            labels: Object.keys(reasonCounts),
            values: Object.values(reasonCounts),
        };
    };

    const aggregatedData = aggregateDowntimeHoursByReason(downtimeData);
    const aggregatedDowntimeData = aggregateDowntimeHoursByReason(downtimeData);
    const aggregatedFrequencytimeData = aggregateFrequencyByReason(downtimeData);
    const handleOpen = () => {
        setDateRangePickerValue('')
    }
    const setCurrentMonth = () => {
        const start = moment().startOf('month');
        const end = moment().endOf('month');
        setDateRangePickerValue([start, end]);
        setSelectedDateRange({ startDate: start.toDate(), endDate: end.toDate() });
    };

    const setPreviousMonth = () => {
        const start = moment().subtract(1, 'month').startOf('month');
        const end = moment().subtract(1, 'month').endOf('month');
        setDateRangePickerValue([start, end]);
        setSelectedDateRange({ startDate: start.toDate(), endDate: end.toDate() });
    };
    return (
        <div>
            <Breadcrumb />
            <hr />
            <div className="flex justify-end items-center mb-4 mt-2">
                {/* <Select
                    showSearch
                    style={{ width: 100, marginRight: 5 }}
                    placeholder="Chọn thiết bị"
                    onSearch={handleDeviceSearch}
                    onChange={handleDeviceSelect}
                    filterOption={false}
                    value={selectedDevice ? selectedDevice._id : undefined}
                >
                    {filteredDevices.map((device) => (
                        <Option key={device.id} value={device.id}>
                            {device.deviceName}
                        </Option>
                    ))}
                </Select> */}
                <div>
                    
                    <Button onClick={setPreviousMonth} className="mr-2">Tháng trước</Button>
                    <Button onClick={setCurrentMonth}  className="mr-2">
                        Tháng này
                    </Button>
                </div>

                <Space direction="vertical" size={12} style={{ width: 220 }}>
                    <RangePicker
                        value={dateRangePickerValue}
                        onChange={handleDateChange}
                        onOpenChange={handleOpen}

                    />
                </Space>
            </div>
            {loading ? (<div className="flex justify-center items-center h-96">
                <div className="loader"></div>
                <span className="text-3xl text-blue-600 ml-4">Đang tải dữ liệu...</span>
            </div>) : (<div>
                <div className="bg-white p-3 mt-2 flex space-x-4">
                    <div className="flex-1">
                        <TopTenChart selectedDate={selectedDateRange} machineSerial="P" />
                    </div>
                    <div className="flex-1">
                        <TopTenChart selectedDate={selectedDateRange} machineSerial="T" />
                    </div>
                </div>
                <div>
                    <div className="text-center mb-4">
                        <Radio.Group
                            value={selectedMachineSerial}
                            onChange={(e) => setSelectedMachineSerial(e.target.value)}
                            buttonStyle="solid"
                        >
                            <Radio.Button value="P">Phay</Radio.Button>
                            <Radio.Button value="T">Tiện</Radio.Button>
                        </Radio.Group>
                    </div>
                    <div className="bg-white p-3 mt-2">
                        <MachineDataTable selectedDate={selectedDateRange} machineSerial={selectedMachineSerial} />
                    </div>
                </div>

            </div>)}
        </div>
    );
};

export default OEEAnalysis;
