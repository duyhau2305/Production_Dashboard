// data.js
export const areasData = [
  { areaName: 'Line 01' },
  { areaName: 'Line 02' },
];

export const devicesData = [
  // 17 máy CNC cho Line 01
  ...Array.from({ length: 17 }, (_, i) => ({
    id: i + 1,
    machineCode: `CNC-${i + 1}`,
    machineName: `Máy CNC ${i + 1}`,
    model: `CNC Model ${i + 1}`,
    specs: `Thông số kỹ thuật CNC ${i + 1}`,
    entrydate: `2023-01-${String(i + 1).padStart(2, '0')}`,
    area: 'Khu Vực Tiện',
  })),
  // 18 máy PHAY cho Line 02
  ...Array.from({ length: 18 }, (_, i) => ({
    id: i + 18 + 1,
    machineCode: `PHAY-${i + 1}`,
    machineName: `Máy PHAY ${i + 1}`,
    model: `PHAY Model ${i + 1}`,
    specs: `Thông số kỹ thuật PHAY ${i + 1}`,
    entrydate: `2023-02-${String(i + 1).padStart(2, '0')}`,
    area: 'Khu Vực Phay',
  })),
];
