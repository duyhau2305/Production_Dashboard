import React from 'react';
import { useLocation, Link } from 'react-router-dom'; 
import { FiHome} from 'react-icons/fi';
import { imprtDataItems, QCStItems, supportItems, settingItems, adminItems, logoutItems } from '../../libs/menuItems'; // Import các items

// Tìm kiếm tên tương ứng từ các items
const findName = (path) => {
    const allItems = [
        ...imprtDataItems,
        ...QCStItems,
        ...supportItems,
        ...settingItems,
        ...adminItems,
        ...logoutItems,
    ];

    // Các tên đường dẫn cụ thể để hiển thị thân thiện
    const pathNamesMap = {
        '/importdata': 'Nhập dữ liệu cơ bản ',
        '/QCS': 'Quality Control System',
        '/support': 'Support',
        '/settings': 'Settings',
        '/admin': 'Admin',
        '/logout': 'Logout',
    };
    
    // Kiểm tra nếu đường dẫn có trong map, nếu có trả về tên thân thiện
    if (pathNamesMap[path]) {
        return pathNamesMap[path];
    }

    // Nếu không tìm thấy trong map, kiểm tra các items
    const foundItem = allItems.find(item => item.link === path);
    return foundItem ? foundItem.name : path; // Nếu không tìm thấy, trả về chính đường dẫn
};

const Breadcrumb = () => {
    const location = useLocation();
  
    // Chia đường dẫn thành các phần để hiển thị trong breadcrumb
    const pathnames = location.pathname.split('/').filter((x) => x);
  
    return (
      <div className="flex justify-start items-center text-gray-600  p-2 mt-2  ">
        <div className="col-span-1 items-center mr-2"><FiHome  /></div> 
        <div><Link to="/">Home</Link> {/* Link đến trang chủ */}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          return (
            <span key={to}>
              {' > '}
              <Link to={to} className="font-bold capitalize">
                {findName(to)} {/* Hiển thị tên từ hàm findName */}
              </Link>
            </span>
          );
        })}</div>
        
        
      </div>
    );
};

export default Breadcrumb;
