# Cổng đăng ký thi tiếng Anh

Frontend được xây dựng bằng React + Vite + TailwindCSS để phục vụ quy trình đăng ký thi tiếng Anh và khu vực quản trị đơn giản.

## Yêu cầu hệ thống

- Node.js >= 18
- npm >= 9

## Cài đặt & chạy dev

```bash
cp env.example .env # hoặc tự tạo file .env với biến VITE_API_URL
npm install
npm run dev
```

Ứng dụng mặc định chạy tại `http://localhost:5173`.

## Build production

```bash
npm run build
npm run preview # kiểm tra bundle trước khi deploy
```

Artifacts nằm trong thư mục `dist/`.

## Deploy lên Vercel

1. Tạo project mới trên Vercel và kết nối repo này.
2. Thiết lập biến môi trường `VITE_API_URL` trong phần Project Settings → Environment Variables.
3. Chọn framework preset là **Vite** (build command `npm run build`, output `dist`).
4. Deploy. Vercel sẽ tự động chạy `npm install` + `npm run build`.

## Cấu trúc chính

```
src/
 ├─ components/      # Navbar, Input
 ├─ pages/           # Home, Register, Success, Admin/*
 ├─ services/        # api.js
 ├─ App.jsx
 ├─ main.jsx
 ├─ index.css
```

## Kết nối backend

Các API được gọi thông qua `services/api.js` với base URL `import.meta.env.VITE_API_URL`.

| API | Method | Mục đích |
| --- | --- | --- |
| `/students/:mssv` | GET | Tra cứu thông tin sinh viên |
| `/register` | POST | Gửi đăng ký thi |
| `/admin/login` | POST | Đăng nhập quản trị |
| `/admin/students` | GET | Danh sách sinh viên |
| `/admin/sessions` | GET/POST | Danh sách & tạo đợt thi |
| `/admin/registrations` | GET | Danh sách đăng ký |

## Build tool & styling

- React Router v6 cho điều hướng.
- TailwindCSS cho styling utility-first.
- Fetch API native, không dùng thư viện HTTP bên thứ ba.
