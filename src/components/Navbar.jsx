import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // Giả lập trạng thái đăng nhập (true: đã login, false: chưa login)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    setIsLoggedIn(false);
    // TODO: Thêm logic xóa token hoặc clear state quản lý user tại đây
  };

  return (
    <nav className="mb-8 flex flex-wrap items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      
      {/* NÚT TRANG CHỦ (Giống hình menu2.png) */}
      <Link 
        to="/" 
        className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
      >
        Trang chủ
      </Link>

      {/* KHỐI MENU CHỨC NĂNG (Nền xanh nhạt giống menu2.png) */}
      <div className="flex flex-1 items-start gap-8 rounded-lg bg-blue-50/50 px-6 py-2">
        
        {/* CỘT 1: ĐĂNG KÝ KIỂM TRA (Dropdown) */}
        <div className="group relative">
          <button className="mb-1 font-bold text-slate-800 hover:text-blue-700 flex items-center gap-1">
            Đăng ký kiểm tra
            {/* Icon mũi tên nhỏ */}
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          {/* Menu xổ xuống */}
          <div className="flex flex-col gap-2 pl-1 pt-1 lg:absolute lg:top-full lg:left-0 lg:w-40 lg:bg-white lg:shadow-xl lg:rounded-xl lg:p-2 lg:ring-1 lg:ring-black/5 lg:opacity-0 lg:invisible lg:group-hover:opacity-100 lg:group-hover:visible lg:transition-all lg:z-50">
            <Link to="/register" className="text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-2 py-1.5 block">
              Đăng ký
            </Link>
            <Link to="/results" className="text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-2 py-1.5 block">
              Xem kết quả
            </Link>
          </div>
        </div>

        {/* CỘT 2: QUẢN TRỊ (Dropdown) */}
        <div className="group relative">
          <button className="mb-1 font-bold text-slate-800 hover:text-blue-700 flex items-center gap-1">
            Quản trị
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {/* Menu xổ xuống */}
          <div className="flex flex-col gap-2 pl-1 pt-1 lg:absolute lg:top-full lg:left-0 lg:w-40 lg:bg-white lg:shadow-xl lg:rounded-xl lg:p-2 lg:ring-1 lg:ring-black/5 lg:opacity-0 lg:invisible lg:group-hover:opacity-100 lg:group-hover:visible lg:transition-all lg:z-50">
            {isLoggedIn ? (
              // NẾU ĐÃ LOGIN -> HIỆN NÚT ĐĂNG XUẤT
              <button 
                onClick={handleLogout}
                className="text-left w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg px-2 py-1.5 block"
              >
                Đăng xuất
              </button>
            ) : (
              // NẾU CHƯA LOGIN -> HIỆN NÚT ĐĂNG NHẬP
              <Link 
                to="/login"
                // Demo: Click để chuyển thành trạng thái đã login
                onClick={() => setIsLoggedIn(true)}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-2 py-1.5 block"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;