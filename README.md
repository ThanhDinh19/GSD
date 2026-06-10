# Hướng dẫn Chạy Dự án (Developer Guide)

Tài liệu này hướng dẫn cách cài đặt và khởi chạy dự án bao gồm **Backend (Node.js/Express)** kết nối với **SQL Server** và **Frontend (Vite/React)** sử dụng cấu trúc lưới **Syncfusion Spreadsheet**.

---

## 1. Yêu cầu Hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/) (Khuyến nghị phiên bản 18 trở lên)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server) đang chạy (cổng mặc định `1433`)

---

## 2. Khởi tạo Cơ sở dữ liệu (Database Setup)
Trước tiên, bạn cần khởi tạo database trong SQL Server:
1. Mở công cụ quản lý cơ sở dữ liệu (ví dụ: **SQL Server Management Studio - SSMS** hoặc **Azure Data Studio**).
2. Mở tệp SQL cài đặt: [database_setup.sql](file:///d:/Thispc/DemoApp/database_setup.sql).
3. Chạy toàn bộ file script này để:
   - Tạo cơ sở dữ liệu `demo_db`.
   - Tạo các bảng: `employees` (Nhân sự), `routing_data` (Quy trình Routing), và `mapping_configs` (Cấu hình ánh xạ Excel).
   - Nạp dữ liệu mẫu ban đầu.

---

## 3. Cài đặt và Chạy Backend
Backend chịu trách nhiệm cung cấp các API lấy/lưu dữ liệu động và cấu hình ánh xạ từ SQL Server.

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Cấu hình tệp môi trường `.env`:
   - Mở file [backend/.env](file:///d:/Thispc/DemoApp/backend/.env) và cập nhật thông tin kết nối SQL Server (nếu cần):
     ```env
     DB_USER="sa"
     DB_PASSWORD="your_password"
     DB_SERVER=localhost
     DB_PORT=1433
     DB_NAME=demo_db
     PORT=5000
     ```
4. Khởi chạy máy chủ backend:
   ```bash
   npm start
   ```
   *Máy chủ API Backend sẽ chạy tại: **http://localhost:5000***

---

## 4. Cài đặt và Chạy Frontend
Frontend cung cấp giao diện trực quan sử dụng Syncfusion Spreadsheet để tải, sửa và đồng bộ dữ liệu với cơ sở dữ liệu SQL Server.

1. Di chuyển vào thư mục frontend:
   ```bash
   cd ../frontend
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Cấu hình tệp môi trường `.env`:
   - Copy file cấu hình mẫu `.env.example` thành `.env` (nếu chưa có):
     ```bash
     cp .env.example .env
     ```
   - Cấu hình file [frontend/.env](file:///d:/Thispc/DemoApp/frontend/.env) với các thông tin:
     ```env
     VITE_PORT=3000
     VITE_API_URL=http://localhost:5000
     VITE_SYNCFUSION_LICENSE=key_lincese_name
     ```
4. Khởi chạy máy chủ frontend:
   ```bash
   npm run dev
   ```
   *Ứng dụng Web Frontend sẽ chạy tại: **http://localhost:3000***
