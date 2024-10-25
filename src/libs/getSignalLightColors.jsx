export const getSignalLightColors = (status) => {
    if (status === 'Chạy') return { red: 'white', yellow: 'white', green: '#8ff28f' };
    if (status === 'Chờ' || status === 'Cài Đặt') return { red: 'white', yellow: '#fafa98', green: 'white' };
    if (status === 'Lỗi') return { red: 'red', yellow: 'white', green: 'white' };
    if (status === 'Tắt') return { red: 'white', yellow: 'white', green: 'white' };
    if (status === 'Vệ Sinh') return { red: 'white', yellow: 'white', green: '#807e7e' };
    return { red: 'white', yellow: 'white', green: 'white' };
  };
  