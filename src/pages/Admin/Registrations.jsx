import { useEffect, useMemo, useState } from 'react';
import { getAdminRegistrations, getAdminSessions } from '../../services/api.js';

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [regs, sess] = await Promise.all([
          getAdminRegistrations(),
          getAdminSessions(),
        ]);
        setRegistrations(regs || []);
        setSessions(sess || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRegistrations = useMemo(() => {
    if (selectedSession === 'all') return registrations;
    return registrations.filter(
      (item) =>
        item.sessionId === selectedSession ||
        item.session?.id === selectedSession ||
        item.sessionName === selectedSession,
    );
  }, [registrations, selectedSession]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Đăng ký thi</h1>
          <p className="text-sm text-slate-500">
            Theo dõi sinh viên đã đăng ký từng đợt thi.
          </p>
        </div>
        <select
          value={selectedSession}
          onChange={(event) => setSelectedSession(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Tất cả đợt thi</option>
          {sessions.map((session) => (
            <option key={session.id || session.name} value={session.id || session.name}>
              {session.name}
            </option>
          ))}
        </select>
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
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Đợt thi</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : filteredRegistrations.length ? (
              filteredRegistrations.map((item) => (
                <tr key={item.id || `${item.mssv}-${item.sessionId}`}>
                  <td className="px-4 py-3 font-semibold">{item.mssv}</td>
                  <td className="px-4 py-3">{item.fullName}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.phone}</td>
                  <td className="px-4 py-3">
                    {item.sessionName || item.session?.name || 'Chưa rõ'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                      {item.status || 'Đã đăng ký'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
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

export default Registrations;

