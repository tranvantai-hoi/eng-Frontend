import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn, onLogout }) => {
  return (
    <nav
      className="
        mb-8 flex items-center justify-between
        rounded-full bg-white/90 px-4 py-2
        shadow-xl backdrop-blur-xl
        overflow-visible
      "
    >
      {/* ================= LEFT: MENUS ================= */}
      <div className="flex items-center gap-2 overflow-visible">

        {/* ===== MENU: ĐĂNG KÝ KIỂM TRA ===== */}
        <div className="group relative overflow-visible">
          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          >
            Đăng ký kiểm tra
            <svg
              className="h-4 w-4 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeWidth="2" />
            </svg>
          </button>

          {/* Dropdown */}
          <div
            className="
              invisible absolute left-0 top-full z-[9999]
              w-48 rounded-xl bg-white p-2
              opacity-0 shadow-2xl
              transition-all duration-200
              group-hover:visible group-hover:opacity-100
            "
          >
            <Link
              to="/register"
              className="block rounded-lg px-4 py-2 text-sm hover:bg-blue-50"
            >
              Đăng ký mới
            </Link>

            <Link
              to="/results"
              className="block rounded-lg px-4 py-2 text-sm hover:bg-blue-50"
            >
              Xem kết quả
            </Link>
          </div>
        </div>

        {/* ===== MENU: QUẢN LÝ ===== */}
        <div className="group relative overflow-visible">
          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          >
            Quản lý
            <svg
              className="h-4 w-4 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeWidth="2" />
            </svg>
          </button>

          {/* Dropdown */}
          <div
            className="
              invisible absolute left-0 top-full z-[9999]
              w-56 rounded-xl bg-white p-2
              opacity-0 shadow-2xl
              transition-all duration-200
              group-hover:visible group-hover:opacity-100
            "
          >
            {!isLoggedIn && (
              <Link
                to="/admin/login"
                className="block rounded-lg px-4 py-2 text-sm hover:bg-blue-50"
              >
                🔐 Đăng nhập
              </Link>
            )}

            {isLoggedIn && (
              <>
                <Link
                  to="/admin/students"
                  className="block rounded-lg px-4 py-2 text-sm hover:bg-blue-50"
                >
                  👥 Quản lý sinh viên
                </Link>

                <Link
                  to="/admin/exams"
                  className="block rounded-lg px-4 py-2 text-sm hover:bg-blue-50"
                >
                  📝 Quản lý kỳ thi
                </Link>

                <Link
                  to="/admin/results"
                  className="block rounded-lg px-4 py-2 text-sm hover:bg-blue-50"
                >
                  📊 Quản lý kết quả
                </Link>

                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-1 w-full rounded-lg px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  🚪 Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= RIGHT: HOME ================= */}
      <Link
        to="/"
        className="
          rounded-full bg-gradient-to-r from-blue-600 to-indigo-600
          px-6 py-2.5 text-sm font-bold text-white
          shadow-lg hover:opacity-90
        "
      >
        Trang chủ
      </Link>
    </nav>
  );
};

export default Navbar;
