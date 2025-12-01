import { useEffect, useState } from 'react';
import { getAdminStudents } from '../../services/api.js';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminStudents();
        setStudents(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Danh sách sinh viên</h1>
        <p className="text-sm text-slate-500">Dữ liệu đồng bộ từ hệ thống đào tạo.</p>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">MSSV</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Khoa/Lớp</th>
              <th className="px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : students.length ? (
              students.map((student) => (
                <tr key={student.mssv}>
                  <td className="px-4 py-3 font-semibold">{student.mssv}</td>
                  <td className="px-4 py-3">{student.fullName}</td>
                  <td className="px-4 py-3">{student.faculty || student.className}</td>
                  <td className="px-4 py-3">{student.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Students;

