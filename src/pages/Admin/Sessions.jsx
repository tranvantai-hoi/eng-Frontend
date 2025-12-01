import { useEffect, useState } from 'react';
import { createAdminSession, getAdminSessions } from '../../services/api.js';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', date: '' });
  const [creating, setCreating] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminSessions();
      setSessions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.name || !form.date) {
      setError('Tên đợt thi và ngày thi là bắt buộc.');
      return;
    }
    setError('');
    setCreating(true);
    try {
      await createAdminSession(form);
      setForm({ name: '', date: '' });
      await loadSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Đợt thi</h1>
        <p className="text-sm text-slate-500">Quản lý và mở đợt thi mới cho sinh viên.</p>
      </div>
      <form onSubmit={handleCreate} className="card grid gap-4 md:grid-cols-[2fr_1fr_auto]">
        <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Tên đợt thi
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Đợt thi tháng 12"
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Ngày thi
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="btn-primary" type="submit" disabled={creating}>
          {creating ? 'Đang tạo...' : 'Tạo đợt thi'}
        </button>
      </form>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Danh sách đợt thi</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : sessions.length ? (
          <ul className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <li
                key={session.id || session.name}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{session.name}</p>
                  <p className="text-sm text-slate-500">
                    {session.date
                      ? new Date(session.date).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                  {session.status || 'Đang mở'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Chưa có đợt thi nào.</p>
        )}
      </div>
    </section>
  );
};

export default Sessions;

