import React, { useEffect, useState } from 'react';
import { Select, DatePicker, Space, Radio } from 'antd';
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
    const [selectedDateRange, setSelectedDateRange] = useState([moment().subtract(10, 'days'), moment()]); // Default to last 10 days
    const [devices, setDevices] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [downtimeData, setDowntimeData] = useState([]);
    const [employeeData, setEmployeeData] = useState([]);
    const [productionData, setProductionData] = useState([]);
    const [telemetryData, setTelemetryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMachineSerial, setSelectedMachineSerial] = useState("P");
    const [dateRangePickerValue, setDateRangePickerValue] = useState([
        moment().subtract(5, 'days'),
        moment()
      ]);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        setLoading(true);
        const fetchDevices = async () => {
            try {
                const response = await axios.get(`${apiUrl}/device`);
                const devices = response.data;
                setDevices(devices);
                setFilteredDevices(devices);

                const defaultDevice = devices[0];
                setSelectedDevice({ _id: defaultDevice.id, deviceId: defaultDevice.deviceId });
                const endDate = moment();
                const startDate = moment().subtract(3, 'days');
                setSelectedDateRange([startDate, endDate]);

                fetchAllData(defaultDevice, [startDate, endDate]);
            } catch (error) {
                console.error('Error fetching devices:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    const fetchAllData = async (device, dateRange) => {
        setLoading(true);
        const [startDate, endDate] = dateRange;

        try {
            await Promise.all([
                fetchDowntimeData(device.deviceId, dateRange),
                fetchEmployeeData(device.deviceId, dateRange),
                fetchTelemetryData(device._id, dateRange),
                fetchProductionData(device._id, dateRange),
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeviceSearch = (value) => {
        const searchValue = value.toLowerCase();
        const filtered = devices.filter((device) =>
            device.deviceName.toLowerCase().includes(searchValue)
        );
        setFilteredDevices(filtered);
    };

    const handleDeviceSelect = (objectId) => {
        const device = devices.find((device) => device.id === objectId);
        if (device) {
            setSelectedDevice({ _id: device.id, deviceId: device.deviceId });
            fetchAllData(device, selectedDateRange);
        }
    };

    const handleDateChange = (dates) => {
        if (dates && dates.length === 2) {
            setSelectedDateRange(dates);
            const formattedDateRange = [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')];
            if (selectedDevice) {
                fetchAllData(selectedDevice, formattedDateRange);
            }
        } else {
            console.warn('Please select a valid date range.');
        }
    };

    const fetchDowntimeData = async (deviceId, [startDate, endDate]) => {
        const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
        const formattedEndDate = moment(endDate).format('YYYY-MM-DD');

        try {
            const response = await axios.get(
                `${apiUrl}/downtime?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
            );
            setDowntimeData(response.data);
        } catch (error) {
            console.error('Error fetching downtime data:', error);
        }
    };

    const fetchEmployeeData = async (deviceId, [startDate, endDate]) => {
        const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
        const formattedEndDate = moment(endDate).format('YYYY-MM-DD');

        try {
            const response = await axios.get(
                `${apiUrl}/productiontask?deviceId=${deviceId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
            );
            setEmployeeData(response.data);
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    };

    const fetchTelemetryData = async (_id, [startDate, endDate]) => {
        const formattedStartDate = moment.tz(startDate, 'Asia/Ho_Chi_Minh').set({ hour: 17, minute: 0, second: 0 }).format("YYYY-MM-DDTHH:mm:ss[Z]");
        const formattedEndDate = moment.tz(endDate, 'Asia/Ho_Chi_Minh').set({ hour: 16, minute: 59, second: 59 }).format("YYYY-MM-DDTHH:mm:ss[Z]");

        try {
            const [response, analysisResponse] = await Promise.all([
                axios.get(`${apiUrl}/machine-operations/${_id}/timeline`, { params: { startTime: formattedStartDate, endTime: formattedEndDate } }),
                axios.get(`${apiUrl}/machine-operations/machine-analysis?startTime=2024-11-01T17:00:00Z&endTime=2024-11-07T16:59:59Z`),
            ]);
            const machineAnalysis = analysisResponse.data.data.find(value => value._id === _id);
            setProductionData(machineAnalysis);

            if (response.data?.data) {
                const filteredData = response.data.data.flatMap(entry =>
                    entry.intervals
                        .filter(interval => (interval.status === "Stop" || interval.status === "Idle") && moment.duration(moment(interval.endTime).diff(moment(interval.startTime))).asMinutes() > 5)
                        .map(interval => ({
                            ...interval,
                            date: moment.tz(entry.date, 'Asia/Ho_Chi_Minh').format("YYYY-MM-DDTHH:mm:ss[Z]")
                        }))
                );
                setTelemetryData(filteredData);
            } else {
                console.warn("Unexpected response structure:", response.data);
            }
        } catch (error) {
            console.error('Error fetching telemetry data:', error);
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
    return (
        <div>
            <Breadcrumb />
            <hr />
            <div className="flex justify-end items-center mb-4 mt-2">
                <Select
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
                </Select>

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
                        <TopTenChart machineSerial="P" />
                    </div>
                    <div className="flex-1">
                        <TopTenChart machineSerial="T" />
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
                        <MachineDataTable machineSerial={selectedMachineSerial} />
                    </div>
                </div>
                
            </div>)}
        </div>
    );
};

export default OEEAnalysis;
