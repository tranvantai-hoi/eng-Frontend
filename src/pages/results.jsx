import { useState } from 'react';
import { Link } from 'react-router-dom';

const Results = () => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('Vui lòng nhập mã sinh viên');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    // --- GIẢ LẬP GỌI API (Bạn sẽ thay thế phần này bằng fetch tới backend) ---
    setTimeout(() => {
      // Demo: Nếu nhập "123" thì có kết quả, ngược lại thì không tìm thấy
      if (studentId === '123') {
        setResult({
          fullname: 'Nguyễn Văn A',
          studentId: '123',
          examDate: '20/12/2025',
          reading: 8.5,
          listening: 7.0,
          total: 7.75,
          status: 'Đã có điểm',
          pass: true
        });
      } else {
        setError('Không tìm thấy thông tin thí sinh hoặc chưa có kết quả.');
      }
      setLoading(false);
    }, 1000);
    // ------------------------------------------------------------------------
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Tra cứu kết quả</h1>
        <p className="text-slate-600">Nhập mã sinh viên để xem điểm thi hoặc trạng thái đăng ký</p>
      </div>

      {/* Form tìm kiếm */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            placeholder="Nhập mã sinh viên (Ví dụ: 123)"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}
      </div>

      {/* Kết quả hiển thị */}
      {result && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 animate-fade-in-up">
          {/* Header Card */}
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-blue-900">{result.fullname}</h2>
              <p className="text-sm text-blue-700">MSV: {result.studentId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {result.pass ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
            </span>
          </div>

          {/* Body Card */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Kỹ năng Đọc</p>
                <p className="text-xl font-bold text-slate-800">{result.reading}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Kỹ năng Nghe</p>
                <p className="text-xl font-bold text-slate-800">{result.listening}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-slate-600 font-medium">Tổng điểm trung bình:</span>
              <span className="text-3xl font-bold text-blue-600">{result.total}</span>
            </div>
            
            <div className="text-center pt-2">
                <p className="text-xs text-slate-400">Ngày thi: {result.examDate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nút quay lại */}
      <div className="text-center">
        <Link to="/" className="text-sm text-slate-500 hover:text-blue-600 font-medium">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default Results;