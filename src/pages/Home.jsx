import { Link } from 'react-router-dom';

const Home = () => (
  <section className="grid gap-10 rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-slate-100 lg:grid-cols-[1.1fr_0.9fr]">
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-primary">
        <span className="h-2 w-2 rounded-full bg-primary"></span>
        Cổng đăng ký kiểm tra năng lực tiếng Anh
      </div>
      <h1 className="text-4xl font-bold text-slate-900">
        Sẵn sàng cho kỳ kiểm tra năng lực tiếng Anh
      </h1>
      <p className="text-lg text-slate-600">
        Giao diện thân thiện, thao tác nhanh chóng và theo dõi trạng thái đơn đăng ký
        rõ ràng giúp bạn tự tin hơn trước ngày kiểm tra.
      </p>
      <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          Lịch thi linh hoạt
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          Theo dõi hồ sơ tức thì
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
          Hỗ trợ trực tuyến
        </span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/register" className="btn-primary text-base">
          Đăng ký ngay
        </Link>
        <div className="rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-500">
          <p className="font-semibold text-slate-800">Cần hỗ trợ?</p>
          <p>Email: support@exam.edu.vn</p>
          <p>Hotline: 0123 456 789</p>
        </div>
      </div>
    </div>
    <div className="card space-y-5 bg-gradient-to-br from-primary to-indigo-600 text-white">
      <div>
        <h2 className="text-2xl font-semibold">Quy trình đơn giản</h2>
        <ul className="mt-4 space-y-3 text-base text-white/90">
          <li>1. Nhập Mã sinh viên để đồng bộ thông tin</li>
          <li>2. Xác nhận email chính xác để hoàn thành đăng ký</li>
          <li>3. Nhận email xác nhận đăng ký thành công</li>
        </ul>
      </div>
      <div className="grid gap-3 rounded-2xl bg-white/10 p-4 text-sm">
        <p className="text-white/70">Thống kê nhanh</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">2K+</p>
            <p className="text-white/80">Sinh viên đã đăng ký</p>
          </div>
          <div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-white/80">Đợt thi đang mở</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Home;

