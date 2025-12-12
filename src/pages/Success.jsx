import { Link, useLocation } from 'react-router-dom';

const Success = () => {
  const { state } = useLocation();
  const registration = state?.registration;

  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <div className="card w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold text-green-600">
          Đăng ký thành công!
        </h1>
        <p className="text-slate-600">
          Chúng tôi đã ghi nhận thông tin đăng ký của bạn. Email xác nhận sẽ được
          gửi trong ít phút.
        </p>
        {registration && (
          <div className="rounded-lg bg-slate-50 p-4 text-left text-sm text-slate-700">
            <p>
              <span className="font-semibold">Họ tên:</span> {registration.fullName}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {registration.email}
            </p>
            <p>
              <span className="font-semibold">SĐT:</span> {registration.phone}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="btn-primary">
            Về trang chủ
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-slate-300"
          >
            Đăng ký mới
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Success;







