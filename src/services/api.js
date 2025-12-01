import axios from 'axios';

// Cấu hình URL: Ưu tiên lấy từ môi trường, nếu không có thì dùng localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Xử lý phản hồi để trả về data sạch hoặc ném lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log lỗi ra console để dễ debug
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối.';
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// --- CÁC HÀM GỌI API ---

// 1. Lấy thông tin sinh viên
// Backend: GET /api/students/:mssv
export const getStudentById = async (mssv) => {
  // Sử dụng encodeURIComponent để đảm bảo MSSV có ký tự đặc biệt không gây lỗi URL
  const response = await api.get(`/students/${encodeURIComponent(mssv)}`);
  return response.data;
};

// 2. Gửi mã OTP (MỚI) - Khắc phục lỗi thiếu hàm này
// Backend: POST /api/registrations/send-otp
export const sendOtp = async (payload) => {
  const response = await api.post('/registrations/send-otp', payload);
  return response.data;
};

// 3. Đăng ký thi (Gửi kèm OTP)
// Backend: POST /api/registrations
export const registerForExam = async (payload) => {
  const response = await api.post('/registrations', payload);
  return response.data;
};

// --- CÁC HÀM ADMIN (Giữ nguyên nếu cần) ---
export const adminLogin = async (credentials) => {
  const response = await api.post('/admin/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('exam_token', response.data.token);
  }
  return response.data;
};

// Export default object nếu muốn dùng kiểu "api.get..."
export default api;
