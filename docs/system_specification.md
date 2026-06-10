# Tài liệu Đặc tả Hệ thống (System Specification)

## 1. Cấu hình Syncfusion License
Hệ thống sử dụng thư viện Syncfusion Spreadsheet yêu cầu đăng ký License Key để không hiển thị thông báo bản dùng thử.

### Thiết kế chuyển đổi License Key ra file môi trường (.env)
- Khóa bản quyền (License Key) được cấu hình trong file `.env` của frontend dưới dạng biến môi trường:
  ```env
  VITE_SYNCFUSION_LICENSE=Ngo9BigBOggjHTQxAR8/V1JHaF1cXmhPYVFxWmFZfVhgdVVMYVxbR3VPMyBoS35RcEVmW3dfcHVVRWdVUkR2VEFe
  ```
- Trong code Frontend (tại component `ExcelEmployeeView.tsx`), giá trị khóa bản quyền sẽ được đọc động từ biến môi trường `import.meta.env.VITE_SYNCFUSION_LICENSE` trước khi gọi hàm `registerLicense()`.
- Dự phòng: Nếu biến môi trường trống hoặc không tồn tại, hệ thống sẽ sử dụng giá trị mặc định (License Key trial cũ) để đảm bảo không bị lỗi giao diện.
