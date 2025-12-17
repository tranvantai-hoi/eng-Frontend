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

// Gọi API nhập Excel
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
  
  // [SỬA LẠI] Dùng query string thay vì body cho GET request
  export const getRegistrationById = (mssv, roundId) =>
    request(`/registrations/by-id?mssv=${encodeURIComponent(mssv)}&roundId=${encodeURIComponent(roundId)}`, {
      method: 'GET',
      headers: defaultHeaders(),
    });
  
  export const getRegistrationsByRound = (roundId) =>
    request(`/registrations/by-round/${roundId}`, {
      method: 'GET',
      headers: authHeaders(), // Cần quyền admin/staff
    });

  export const updateRegistrationStatus = (mssv, roundId, status) => 
      request('/registrations/status', { 
        method: 'PUT', 
        headers: authHeaders(), 
        body: JSON.stringify({ mssv, roundId, status }) 
      });
    
  export const deleteRegistration = (mssv, roundId) => 
      request(`/registrations?mssv=${mssv}&roundId=${roundId}`, { 
        method: 'DELETE', 
        headers: authHeaders() 
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

export const updateStudentFullInfo = (payload) =>
  request('/students/update', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

// --- [ĐÃ TÍCH HỢP] Hàm Xóa Sinh Viên ---
export const deleteStudent = (mssv) =>
  request('/students/delete', { // Endpoint backend cần khớp (POST /delete hoặc DELETE /:id)
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ mssv }), // Gửi MSSV trong body
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

// --- USER MANAGEMENT APIS ---

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

// Cập nhật đợt thi
export const updateAdminSession = (id, payload) =>
  request(`/exam-rounds/${id}`, { 
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

// Xóa đợt thi
export const deleteAdminSession = (id) =>
  request(`/exam-rounds/${id}`, { 
    method: 'DELETE',
    headers: authHeaders(),
  });
// Xóa user
  export const deleteUser = (id) =>
    request(`/users/${id}`, { 
      method: 'DELETE',
      headers: authHeaders(),
    });