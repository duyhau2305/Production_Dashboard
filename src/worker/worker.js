// worker.js
onmessage = function (event) {
    const data = event.data;
  
    // Xử lý dữ liệu (ví dụ: format dữ liệu hoặc bất kỳ xử lý nào khác)
    const processedData = data.map(d => ({
      date: new Date(d.ts).toISOString().slice(0, 10),
      startTime: new Date(d.ts).toISOString().slice(11, 16),
      endTime: new Date(d.ts + 3600000).toISOString().slice(11, 16),
      status: d.value === '1' ? 'Chạy' : 'Dừng',
    }));
  
    // Trả kết quả về cho main thread
    postMessage(processedData);
  };
  