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
  if (!API_URL) {
    throw new Error('Thiếu cấu hình VITE_API_URL. Vui lòng kiểm tra file .env');
  }
  const base = API_URL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), options);
  return handleResponse(response);
};

// --- PUBLIC APIS (Sinh viên) ---

export const getStudentById = (mssv) =>
  request(`/students?masv=${encodeURIComponent(mssv)}`, {
    method: 'GET',
    headers: defaultHeaders(),
  });

// [MỚI] Hàm cập nhật thông tin liên hệ (Email/SĐT)
// Hàm này sẽ được gọi ở cuối Step 2 trong Register.jsx
export const updateStudentInfo = (payload) =>
  request('/students/update-contact', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

export const registerForExam = (payload) =>
  request('/registrations/register', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

// [MỚI] Hàm lấy đợt thi đang Active
export const getActiveExamRound = () =>
  request('/exam-rounds/active', {
    method: 'GET',
    headers: defaultHeaders(),
  });

// [MỚI] Hàm gửi OTP 
export const createOtp = (payload) =>
  request('/otp/create-otp', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

export const verifyOtp = ({ email, otp }) =>
  request(`/otp/verify-otp?email=${email}&otp=${otp}`, {
    method: 'GET',
    headers: defaultHeaders(),
  });

// --- ADMIN APIS (Quản trị viên) ---

export const adminLogin = async (credentials) => {
  // SỬA: Gọi vào endpoint /users/login thay vì /users
  const data = await request('/users/login', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(credentials),
  });

  // Lưu token vào localStorage nếu đăng nhập thành công
  if (data?.token) {
    localStorage.setItem('exam_token', data.token);
    // Lưu thêm thông tin user nếu cần hiển thị tên
    localStorage.setItem('user_info', JSON.stringify(data.user));
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

export const getAdminRegistrations = () =>
  request('/admin/registrations', {
    method: 'GET',
    headers: authHeaders(),
  });