import { Link } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  Users, 
  Calendar, 
  Award,
  Phone,
  Mail
} from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-16 pb-12 animate-fade-in font-sans text-slate-800">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-8 py-16 text-white shadow-2xl md:px-12 lg:py-24">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/30 px-4 py-1.5 text-sm font-medium text-blue-100 backdrop-blur-sm border border-blue-400/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              Cổng đăng ký chính thức {new Date().getFullYear}
            </div>
            
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Hoàn thiện chuẩn đầu ra <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                Tiếng Anh
              </span>
            </h1>
            
            <p className="max-w-lg text-lg text-blue-100/90 leading-relaxed">
              Hệ thống đăng ký kiểm tra năng lực tiếng Anh trực tuyến: Nhanh chóng, Chính xác và Bảo mật.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link 
                to="/register" 
                className="group flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-blue-900 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl hover:-translate-y-1"
              >
                Đăng ký ngay
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/results" 
                className="flex items-center justify-center gap-2 rounded-full border border-blue-400 bg-blue-800/30 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-blue-800/50"
              >
                <Search className="h-5 w-5" />
                Tra cứu kết quả
              </Link>
            </div>
          </div>

          {/* Hero Image / Illustration Placeholder */}
          <div className="relative hidden lg:block">
             <div className="relative mx-auto w-full max-w-md rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/10 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                   <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                   </div>
                   <div className="text-xs font-mono text-blue-200">system_status: active</div>
                </div>
                <div className="space-y-4">
                   <div className="h-24 rounded-xl bg-gradient-to-r from-blue-500/50 to-purple-500/50 animate-pulse"></div>
                   <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-white/20"></div>
                      <div className="h-4 w-1/2 rounded bg-white/20"></div>
                   </div>
                   <div className="flex justify-between items-center pt-4">
                      <div className="text-sm text-blue-200">Đợt kiểm tra tiếp theo</div>
                      <div className="text-xl font-bold text-yellow-400">20/12/2025</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {[
          { icon: Users, label: 'Thí sinh đã đăng ký', value: '15,000+', color: 'text-blue-600', bg: 'bg-blue-100' },
          { icon: Calendar, label: 'Đợt kiểm tra tổ chức', value: '24', color: 'text-orange-600', bg: 'bg-orange-100' },
          { icon: Award, label: 'Tỉ lệ đạt chuẩn', value: '98%', color: 'text-green-600', bg: 'bg-green-100' },
          { icon: ShieldCheck, label: 'Bảo mật thông tin', value: '100%', color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 3. PROCESS SECTION */}
      <section>
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Quy trình đăng ký đơn giản</h2>
          <p className="mt-2 text-slate-500">Hoàn tất thủ tục kiểm tra chỉ với 3 bước</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="group relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:border-blue-200">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Search size={32} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">1. Tra cứu thông tin</h3>
            <p className="text-slate-600 leading-relaxed">
              Nhập Mã sinh viên để hệ thống tự động đồng bộ thông tin cá nhân chính xác từ cơ sở dữ liệu nhà trường.
            </p>
          </div>

          {/* Step 2 */}
          <div className="group relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:border-orange-200">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <ShieldCheck size={32} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">2. Xác thực & Chọn lịch</h3>
            <p className="text-slate-600 leading-relaxed">
              Xác thực email qua mã OTP, cập nhật số điện thoại và lựa chọn đợt kiểm tra phù hợp với lịch trình của bạn.
            </p>
          </div>

          {/* Step 3 */}
          <div className="group relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:border-green-200">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <CheckCircle size={32} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">3. Hoàn tất & Thanh toán</h3>
            <p className="text-slate-600 leading-relaxed">
              Hoàn tất đăng ký dễ dàng. Chuyển khoản hoặc đóng lệ phí trực tiếp dễ dàng.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SUPPORT SECTION */}
      <section className="rounded-3xl bg-slate-50 p-8 md:p-12 border border-slate-200">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bạn cần hỗ trợ?</h2>
            <p className="mt-2 text-slate-600 max-w-md">
              Đội ngũ hỗ trợ kỹ thuật và phòng đào tạo luôn sẵn sàng giải đáp mọi thắc mắc của sinh viên.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-sm border border-slate-100">
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Hotline</p>
                <p className="text-lg font-bold text-slate-800">096 516 44 45</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-sm border border-slate-100">
              <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Email</p>
                <p className="text-lg font-bold text-slate-800">phongdaotao@ttn.edu.vn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;