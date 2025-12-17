import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CalendarDays, 
  ClipboardList, 
  ShieldCheck, 
  ArrowRight, 
  GraduationCap,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState({ fullname: 'Quản trị viên', role: 'staff' });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 1. Lấy thông tin user từ LocalStorage để hiển thị lời chào
    try {
      const storedUser = localStorage.getItem('user_info');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Lỗi đọc user info", e);
    }

    // 2. Cập nhật đồng hồ
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Format ngày tháng tiếng Việt
  const dateString = new Intl.DateTimeFormat('vi-VN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }).format(currentTime);

  const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';

  // Danh sách chức năng chính
  const menuItems = [
    {
      to: '/admin/sessions',
      title: 'Quản lý Đợt thi',
      desc: 'Tạo đợt thi mới, chỉnh sửa lịch thi và địa điểm.',
      icon: CalendarDays,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      stat: 'Đang mở'
    },
    {
      to: '/admin/students',
      title: 'Quản lý Sinh viên',
      desc: 'Tra cứu hồ sơ, cập nhật thông tin và nhập Excel.',
      icon: GraduationCap,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      stat: 'Tra cứu'
    },
    {
      to: '/admin/registrations',
      title: 'Danh sách Đăng ký',
      desc: 'Theo dõi số lượng thí sinh và trạng thái lệ phí.',
      icon: ClipboardList,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      stat: 'Chi tiết'
    },
  ];

  // Thêm mục quản lý user nếu là Admin
  if (isAdmin) {
    menuItems.push({
      to: '/admin/users',
      title: 'Quản lý Người dùng',
      desc: 'Phân quyền, tạo tài khoản quản trị và staff.',
      icon: ShieldCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      stat: 'Bảo mật'
    });
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* 1. WELCOME BANNER (Gradient Blue) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-8 text-white shadow-xl shadow-blue-200">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-yellow-400 opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1 uppercase tracking-wider">{dateString}</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Xin chào, {user.fullname || user.username}! 👋
            </h1>
            <p className="text-blue-100 opacity-90 max-w-lg">
              Chào mừng bạn quay trở lại hệ thống quản lý thi năng lực tiếng Anh. 
              Chúc bạn một ngày làm việc hiệu quả.
            </p>
          </div>
          
          {/* Quick Stat Badge (Ví dụ) */}
          <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
             <div className="bg-yellow-400 p-2 rounded-xl text-yellow-900 shadow-lg shadow-yellow-400/50">
                <Activity size={24} />
             </div>
             <div>
                <p className="text-xs text-blue-100">Trạng thái hệ thống</p>
                <p className="font-bold text-white">Hoạt động tốt</p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW (Giả lập số liệu để giao diện đẹp hơn) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <Users size={24} />
            </div>
            <div>
               <p className="text-slate-500 text-xs font-bold uppercase">Sinh viên</p>
               <h4 className="text-xl font-bold text-slate-800">10k+</h4>
            </div>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
               <CalendarDays size={24} />
            </div>
            <div>
               <p className="text-slate-500 text-xs font-bold uppercase">Đợt thi</p>
               <h4 className="text-xl font-bold text-slate-800">24</h4>
            </div>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
               <ClipboardList size={24} />
            </div>
            <div>
               <p className="text-slate-500 text-xs font-bold uppercase">Đăng ký</p>
               <h4 className="text-xl font-bold text-slate-800">1.2k</h4>
            </div>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
               <Activity size={24} />
            </div>
            <div>
               <p className="text-slate-500 text-xs font-bold uppercase">Truy cập</p>
               <h4 className="text-xl font-bold text-slate-800">Active</h4>
            </div>
         </div>
      </div>

      {/* 3. MAIN MENU GRID */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-yellow-400 rounded-full"></span>
          Chức năng quản lý
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.to} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-blue-100"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-400 opacity-0 transition-opacity group-hover:opacity-100"></div>

              <div>
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ${item.color} shadow-sm transition-transform group-hover:scale-110`}>
                  <item.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-yellow-600 transition-colors">
                  {item.stat}
                </span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${item.color} group-hover:translate-x-1 transition-transform`}>
                  Truy cập <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;