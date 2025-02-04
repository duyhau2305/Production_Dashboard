import React , {useState,useEffect} from 'react';

// Helper functions (giữ nguyên như bạn đã định nghĩa)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTimeToGMT7 = (isoString) => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${formatDate(isoString)} ${hours}:${minutes}:${seconds}`;
};
const formatTimeToHours = (isoString) => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const calculateDuration = (startTime, endTime) => {
  // Convert ISO strings to Date objects
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  // Calculate the difference in milliseconds
  let durationMs = endDate - startDate;

  // If end time is before start time (crosses midnight), add 24 hours in milliseconds
  if (durationMs < 0) {
    durationMs += 24 * 60 * 60 * 1000;
  }

  // Convert milliseconds to hours and minutes
  const totalMinutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Return formatted duration as "HH:mm"
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};


const getEmployeeName = (date, employeeData) => {
  const formattedDate = formatDate(date);
  const employeeEntry = employeeData.find(
    (entry) => formatDate(entry.date) === formattedDate
  );
  return employeeEntry?.shifts[0]?.employeeName.join(', ') || 'N/A';
};

const getDowntimeInfoById = (intervalId, downtimeData) => {
  const matchingDowntime = downtimeData.find((item) =>
    item.interval.some((downtimeInterval) => downtimeInterval._id === intervalId)
  );

  if (matchingDowntime) {
    const matchedInterval = matchingDowntime.interval.find(
      (downtimeInterval) => downtimeInterval._id === intervalId
    );
    return {
      reason: matchingDowntime.reasonName || 'De nghi khai bao',
      reportedAt: formatTimeToGMT7(matchingDowntime.createdAt),
    };
  }

  return { reason: 'Chưa khai báo', reportedAt: 'De nghi khai bao' };
};

function getTimeDifference(startTime, endTime) {
  if (!startTime || !endTime) {
    return '';
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  const differenceInMinutes = endTotalMinutes - startTotalMinutes;
  const hours = Math.floor(differenceInMinutes / 60);
  const minutes = differenceInMinutes % 60;

  return `${hours}:${minutes}`;
}

function calculateActualRunTime(shift) {
  const { startTime, endTime, breakTime, lastBreakTime } = shift;
  if (!startTime || !endTime) {
    return '';
  }

  const timeToMinutes = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };

  const scheduledRunTime = timeToMinutes(endTime) - timeToMinutes(startTime);

  // Helper function to calculate total break time
  const calculateTotalBreakTime = (breakPeriods) => {
    return breakPeriods.reduce((total, breakPeriod) => {
      const breakStart = timeToMinutes(breakPeriod.startTime);
      const breakEnd = timeToMinutes(breakPeriod.endTime);
      return total + (breakEnd - breakStart);
    }, 0);
  };

  // Check if breakTime and lastBreakTime are the same
  let totalBreakTime = 0;
  if (JSON.stringify(breakTime) === JSON.stringify(lastBreakTime)) {
    // If they're the same, calculate only once
    totalBreakTime = calculateTotalBreakTime(breakTime);
  } else {
    // If they're different, calculate both
    totalBreakTime = calculateTotalBreakTime(breakTime) + calculateTotalBreakTime(lastBreakTime || []);
  }

  const actualRunTimeInMinutes = scheduledRunTime - totalBreakTime;
  const hours = Math.floor(actualRunTimeInMinutes / 60);
  const minutes = actualRunTimeInMinutes % 60;

  return `${hours}:${minutes}`;
}

function calculateActualRunTimePercent(shift) {
  const { startTime, endTime, breakTime, lastBreakTime } = shift;
  if (!startTime || !endTime) {
    return '';
  }

  const timeToMinutes = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };

  const scheduledRunTime = timeToMinutes(endTime) - timeToMinutes(startTime);

  // Helper function to calculate total break time
  const calculateTotalBreakTime = (breakPeriods) => {
    return breakPeriods.reduce((total, breakPeriod) => {
      const breakStart = timeToMinutes(breakPeriod.startTime);
      const breakEnd = timeToMinutes(breakPeriod.endTime);
      return total + (breakEnd - breakStart);
    }, 0);
  };

  // Check if breakTime and lastBreakTime are the same
  let totalBreakTime = 0;
  if (JSON.stringify(breakTime) === JSON.stringify(lastBreakTime)) {
    totalBreakTime = calculateTotalBreakTime(breakTime);
  } else {
    totalBreakTime = calculateTotalBreakTime(breakTime) + calculateTotalBreakTime(lastBreakTime || []);
  }
  console.log(totalBreakTime)
  const actualRunTimeInMinutes = scheduledRunTime - totalBreakTime;
  const hours = Math.floor(actualRunTimeInMinutes / 60); 
  const minutes = actualRunTimeInMinutes % 60;
  const totalInMinutes = hours*60*60 + minutes*60
  return totalInMinutes;
}
const getDowntimeInfoByInterval = (startTime, endTime, downtimeData) => {
  const matchingDowntime = downtimeData.find((item) =>
    item.interval.some(
      (downtimeInterval) =>
        downtimeInterval.startTime === startTime && downtimeInterval.endTime === endTime
    )
  );

  if (matchingDowntime) {
    const matchedInterval = matchingDowntime.interval.find(
      (downtimeInterval) =>
        downtimeInterval.startTime === startTime && downtimeInterval.endTime === endTime
    );
    return {
      reason: matchingDowntime.reasonName || 'De nghi khai bao',
      reportedAt: formatTimeToGMT7(matchingDowntime.createdAt),
    };
  }

  return { reason: 'Chưa khai báo', reportedAt: 'De nghi khai bao' };
};
function convertSecondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const DeviceTable = ({ downtimeData, telemetryData, productionData, employeeData, type }) => {
  const [loading, setLoading] = useState(true); // Trạng thái loading

  useEffect(() => {
    // Giả sử dữ liệu được tải ở đây (nếu dùng props từ cha, có thể bỏ phần này)
    if (downtimeData || telemetryData || productionData) {
      setLoading(false); // Tắt loading khi có dữ liệu
    }
  }, [downtimeData, telemetryData, productionData]);

  // Nếu đang tải dữ liệu
  if (loading) {
    return (
      <div className="text-center mt-4">
        <p className="text-blue-500">Loading data...</p>
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!downtimeData?.length && !telemetryData?.length && !productionData?.productionTasks?.length) {
    return (
      <div className="text-center mt-4">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  const sortedTelemetryData = [...telemetryData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div>
      {type === 'oeeAnalysis' && productionData?.productionTasks?.length > 0 ? (
        <div>
          <h3 className="mt-6 font-semibold">Thống kê sản xuất</h3>
          <TableProduction productionData={productionData} />
        </div>
      ) : null}

      {type === 'downtimeAnalysis' && downtimeData && telemetryData && employeeData ? (
        <>
          <h3 className="mt-6 font-semibold">Thống kê Downtime</h3>
          <TableDowntime
            telemetryData={sortedTelemetryData}
            downtimeData={downtimeData}
            employeeData={employeeData}
          />
        </>
      ) : null}

      {type !== 'oeeAnalysis' && type !== 'downtimeAnalysis' ? (
        <>
          <h3 className="mt-6 font-semibold">Thống kê Downtime</h3>
          <TableDowntime
            telemetryData={sortedTelemetryData}
            downtimeData={downtimeData}
            employeeData={employeeData}
          />
          {productionData?.productionTasks?.length > 0 && (
            <div>
              <h3 className="mt-6 font-semibold">Thống kê sản xuất</h3>
              <TableProduction productionData={productionData} />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

const TableDowntime = ({ telemetryData, downtimeData, employeeData }) => (
  <table className="min-w-full bg-white border border-gray-200 mt-4">
    <thead>
      <tr className="bg-gray-100">
        {['STT', 'Ngày', 'Thời gian bắt đầu', 'Thời gian kết thúc', 'Thời lượng',
          'Lý do', 'Thời gian khai báo', 'Nhân viên vận hành'].map((header) => (
            <th key={header} className="border px-4 py-2 text-xs">
              {header}
            </th>
          ))}
      </tr>
    </thead>
    <tbody>
      {telemetryData.map((interval, index) => {
        const { reason, reportedAt } = getDowntimeInfoByInterval(interval.startTime, interval.endTime, downtimeData);
        console.log(reason)
        return (
          <tr key={interval._id}>
            <td className="border px-4 py-2">{index + 1}</td>
            <td className="border px-4 py-2">{formatDate(interval.date)}</td>
            <td className="border px-4 py-2">{formatTimeToHours(interval.startTime)}</td>
            <td className="border px-4 py-2">{formatTimeToHours(interval.endTime)}</td>
            <td className="border px-4 py-2">
              {calculateDuration(interval.startTime, interval.endTime)}
            </td>
            <td className="border px-4 py-2">{reason}</td>
            <td className="border px-4 py-2">{reportedAt}</td>
            <td className="border px-4 py-2">
              {getEmployeeName(interval.date, employeeData)}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

const TableProduction = ({ productionData }) => (
  <table className="min-w-full bg-white border border-gray-200 mt-4">
    <thead>
      <tr className="bg-gray-100">
        {[
          'STT',
          'Ngày',
          'Thời gian bắt đầu',
          'Thời gian kết thúc',
          'Thời gian công việc',
          'Thời gian chạy theo kế hoạch',
          'Thời gian chạy thực tế',
          'Thời gian chờ',
          'Thời gian tắt máy',
          'Thời gian Dừng',
          'Tỉ lệ chạy',
        ].map((header) => (
          <th key={header} className="border px-4 py-2 text-xs">
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
       {productionData?.enrichedData?.map((item, index) => {
        const productionTask = item.productionTask !== "Chưa lên lịch" ? item.productionTask : null;
        const summaryStatus = item.summaryStatus || {};

        const shifts = productionTask?.shifts || [];
        const firstShift = shifts[0]?.shiftDetails;
        const lastShift = shifts[shifts.length - 1]?.shiftDetails;

        return (
          <tr key={index}>
            <td className="border px-4 py-2">{index + 1}</td>
            <td className="border px-4 py-2">{item.date}</td>
            <td className="border px-4 py-2">
              {firstShift?.startTime ? `${firstShift.startTime}:00` : 'Chưa lên lịch sản xuất'}
            </td>
            <td className="border px-4 py-2">
              {lastShift?.endTime ? `${lastShift.endTime}:00` : 'Chưa lên lịch sản xuất'}
            </td>
            <td className="border px-4 py-2">
              {firstShift?.startTime && lastShift?.endTime
                ? `${getTimeDifference(firstShift.startTime, lastShift.endTime)}:00`
                : '00:00:00'}
            </td>
            <td className="border px-4 py-2">
              {firstShift?.startTime && lastShift?.endTime
                ? `${calculateActualRunTime({
                    startTime: firstShift.startTime,
                    endTime: lastShift.endTime,
                    breakTime: firstShift.breakTime,
                    lastBreakTime: lastShift.breakTime,
                  })}:00`
                : '00:00:00'}
            </td>
            <td className="border px-4 py-2">{convertSecondsToTime(summaryStatus.runTime || 0)}</td>
            <td className="border px-4 py-2">{convertSecondsToTime(summaryStatus.idleTime || 0)}</td>
            <td className="border px-4 py-2">
              {convertSecondsToTime(
                86400 -
                  (summaryStatus.runTime || 0) -
                  (summaryStatus.idleTime || 0) -
                  (summaryStatus.stopTime || 0)
              )}
            </td>
            <td className="border px-4 py-2">{convertSecondsToTime(summaryStatus.stopTime || 0)}</td>
            <td className="border px-4 py-2">
              {firstShift?.startTime && lastShift?.endTime
                ? `${(
                    ((summaryStatus.runTime || 0) /
                      calculateActualRunTimePercent({
                        startTime: firstShift.startTime,
                        endTime: lastShift.endTime,
                        breakTime: firstShift.breakTime,
                        lastBreakTime: lastShift.breakTime,
                      })) *
                    100
                  ).toFixed(2)}%`
                : '0.00%'}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);


export default DeviceTable;
