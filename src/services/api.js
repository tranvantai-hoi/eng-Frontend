// URL Backend: Tự động fallback về localhost nếu không có biến môi trường
const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';

// Hàm helper để gọi API
const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Parse JSON response
    let data = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi kết nối (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// --- CÁC HÀM NGHIỆP VỤ ---

// 1. Lấy thông tin sinh viên
export const getStudentById = (mssv) => {
  return request(`/students/${encodeURIComponent(mssv)}`, { method: 'GET' });
};

// 2. Gửi mã OTP (POST)
export const sendOtp = (payload) => {
  return request('/registrations/send-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// 3. Đăng ký thi (POST)
export const registerForExam = (payload) => {
  return request('/registrations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
