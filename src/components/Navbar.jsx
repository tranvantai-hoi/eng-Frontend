import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Trang chủ' },
  { to: '/register', label: 'Đăng ký thi' },
  { to: '/admin/login', label: 'Admin' },
];

const Navbar = () => (
  <header className="bg-white shadow-sm">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <NavLink to="/" className="text-xl font-semibold text-primary">
        Exam Portal
      </NavLink>
      <nav className="flex gap-4 text-sm font-medium">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 transition ${
                isActive ? 'bg-primary text-white' : 'text-slate-600 hover:text-primary'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  </header>
);

export default Navbar;






