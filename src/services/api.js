const API_URL = import.meta.env.VITE_API_URL;

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
});

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    throw new Error(message);
  }
  return data;
};

const buildUrl = (path) => {
  // SỬA LỖI: Thêm fallback về localhost nếu chưa cấu hình .env để tránh sập app
  const baseUrl = API_URL || 'http://localhost:5000/api';
  const base = baseUrl.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), options);
  return handleResponse(response);
};

// --- API METHODS ---

export const getStudentById = (mssv) =>
  // Lưu ý: Backend tìm theo path param hoặc query param tuỳ setup.
  // Ở đây giả định Backend route là /students/:mssv (như cấu hình server.js cũ)
  // Nếu Backend dùng query ?masv=... thì sửa lại dòng dưới.
  request(`/students/${encodeURIComponent(mssv)}`, {
    method: 'GET',
    headers: defaultHeaders(),
  });

export const registerForExam = (payload) =>
  // SỬA LỖI: Endpoint đúng là /registrations (khớp với server.js)
  request('/registrations', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

// THÊM MỚI: Hàm gửi OTP
export const sendOtp = (payload) =>
  request('/registrations/send-otp', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

export const adminLogin = async (credentials) => {
  const data = await request('/admin/login', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(credentials),
  });

  if (data?.token) {
    localStorage.setItem('exam_token', data.token);
  }
  return data;
};

const authHeaders = () => {
  const token = localStorage.getItem('exam_token');
  if (!token) return defaultHeaders();
  return {
    ...defaultHeaders(),
    Authorization: `Bearer ${token}`,
  };
};

export const getAdminStudents = () =>
  request('/admin/students', {
    method: 'GET',
    headers: authHeaders(),
  });

export const getAdminSessions = () =>
  request('/admin/sessions', {
    method: 'GET',
    headers: authHeaders(),
  });

export const createAdminSession = (payload) =>
  request('/admin/sessions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });