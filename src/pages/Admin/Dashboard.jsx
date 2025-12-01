import { Link } from 'react-router-dom';

const shortcuts = [
  { to: '/admin/students', label: 'Sinh viên', description: 'Tra cứu hồ sơ sinh viên' },
  { to: '/admin/sessions', label: 'Đợt thi', description: 'Tạo và quản lý đợt thi' },
  {
    to: '/admin/registrations',
    label: 'Đăng ký',
    description: 'Danh sách đăng ký theo đợt',
  },
];

const Dashboard = () => (
  <section className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Bảng điều khiển</h1>
      <p className="text-sm text-slate-500">
        Quản trị thông tin sinh viên, ca thi và kết quả đăng ký.
      </p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {shortcuts.map((item) => (
        <Link key={item.to} to={item.to} className="card space-y-2 hover:shadow-md">
          <p className="text-lg font-semibold text-slate-900">{item.label}</p>
          <p className="text-sm text-slate-500">{item.description}</p>
        </Link>
      ))}
    </div>
  </section>
);

export default Dashboard;

