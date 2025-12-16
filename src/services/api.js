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

export const updateStudentInfo = (payload) =>
  request('/students/update-contact', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

  export const updateStudentFullInfo = (payload) =>
    request('/students/update', {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(payload),
    });
  
// [MỚI] Gọi API nhập Excel
export const importStudents = (studentList) =>
  request('/students/import', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(studentList),
  });

export const registerForExam = (payload) =>
  request('/registrations/register', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  });

export const getActiveExamRound = () =>
  request('/exam-rounds/active', {
    method: 'GET',
    headers: defaultHeaders(),
  });

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
  const data = await request('/users/login', {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(credentials),
  });

  if (data?.token) {
    localStorage.setItem('exam_token', data.token);
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
  request('/students', {
    method: 'GET',
    headers: authHeaders(),
  });


export const getAdminRegistrations = () =>
  request('/admin/registrations', {
    method: 'GET',
    headers: authHeaders(),
  });

export const changePassword = (payload) =>
  request('/users/change-password', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

// --- [MỚI] USER MANAGEMENT APIS ---
// Bổ sung các hàm này để Users.jsx hoạt động

export const getUsers = () =>
  request('/users', {
    method: 'GET',
    headers: authHeaders(),
  });

export const createUser = (payload) =>
  request('/users/create', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

export const updateUser = (payload) =>
  request('/users/update', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

//Quản lý đợt thi 
export const getAdminSessions = () =>
    request('/exam-rounds/', {
      method: 'GET',
      headers: authHeaders(),
    });
  
  export const createAdminSession = (payload) =>
    request('/exam-rounds/', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  
  // [MỚI] Cập nhật đợt thi
  export const updateAdminSession = (id, payload) =>
    request(`/exam-rounds/${id}`, { 
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  
  // [MỚI] Xóa đợt thi
  export const deleteAdminSession = (id) =>
    request(`/exam-rounds/${id}`, { 
      method: 'DELETE',
      headers: authHeaders(),
    });