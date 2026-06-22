-- ========================================================
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU SQL SERVER
-- Tên CSDL mặc định: demo_db
-- ========================================================

-- 1. Tạo Cơ sở dữ liệu (Nếu chưa tồn tại)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'demo_db')
BEGIN
    CREATE DATABASE [demo_db];
    PRINT 'Da tao co so du lieu demo_db';
END
ELSE
BEGIN
    PRINT 'Co so du lieu demo_db da ton tai';
END
GO

USE [demo_db];
GO

-- 2. Tạo bảng employees (Quản lý Nhân sự)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='employees' AND xtype='U')
BEGIN
    CREATE TABLE employees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NULL,
        email NVARCHAR(255) NULL,
        phone NVARCHAR(50) NULL,
        address NVARCHAR(500) NULL
    );
    PRINT 'Da tao bang employees';
END
ELSE
BEGIN
    PRINT 'Bang employees da ton tai';
END
GO

-- 3. Tạo bảng routing_data (Quản lý quy trình công đoạn Routing)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='routing_data' AND xtype='U')
BEGIN
    CREATE TABLE routing_data (
        id INT IDENTITY(1,1) PRIMARY KEY,
        stt INT NULL,
        op_code NVARCHAR(50) NULL,
        op_name NVARCHAR(255) NULL,
        machine NVARCHAR(50) NULL,
        sam FLOAT NULL,
        smv FLOAT NULL,
        rate FLOAT NULL,
        difficulty NVARCHAR(50) NULL,
        skill NVARCHAR(50) NULL
    );
    PRINT 'Da tao bang routing_data';
END
ELSE
BEGIN
    PRINT 'Bang routing_data da ton tai';
END
GO

-- 4. Chèn dữ liệu mẫu cho bảng employees (chỉ chèn nếu chưa có dữ liệu)
IF NOT EXISTS (SELECT 1 FROM employees)
BEGIN
    INSERT INTO employees (name, email, phone, address) VALUES
    (N'Nguyễn Văn A', N'a.nguyen@example.com', N'0901234567', N'123 Đường Lê Lợi, Quận 1, TP. HCM'),
    (N'Trần Thị B', N'b.tran@example.com', N'0912345678', N'456 Đường Nguyễn Huệ, Quận Hải Châu, Đà Nẵng'),
    (N'Phạm Văn C', N'c.pham@example.com', N'0923456789', N'789 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội');
    PRINT 'Da nap du lieu mau cho bang employees';
END
GO

-- 5. Chèn dữ liệu mẫu cho bảng routing_data (chỉ chèn nếu chưa có dữ liệu)
IF NOT EXISTS (SELECT 1 FROM routing_data)
BEGIN
    INSERT INTO routing_data (stt, op_code, op_name, machine, sam, smv, rate, difficulty, skill) VALUES
    (1, N'OP010', N'May vai thân trước', N'1N', 0.85, 0.79, 2.62, N'B', N'B'),
    (2, N'OP020', N'May vai thân sau', N'1N', 0.80, 0.74, 2.46, N'B', N'B'),
    (3, N'OP030', N'May nối vai', N'1N', 0.75, 0.70, 2.31, N'B', N'B'),
    (4, N'OP040', N'Tra tay', N'2N', 1.20, 1.12, 3.69, N'C', N'C'),
    (5, N'OP050', N'May sườn', N'1N', 0.95, 0.88, 2.92, N'B', N'B'),
    (6, N'OP060', N'May cổ', N'1N', 0.75, 0.70, 2.31, N'B', N'B'),
    (7, N'OP070', N'Gắn mũ', N'1N', 1.10, 1.02, 3.38, N'C', N'C'),
    (8, N'OP080', N'May khóa kéo', N'1N', 1.40, 1.30, 4.31, N'C', N'B'),
    (9, N'OP090', N'May túi', N'1N', 1.50, 1.39, 4.62, N'C', N'B'),
    (10, N'OP100', N'May lai áo', N'1N', 0.90, 0.83, 2.77, N'B', N'B'),
    (11, N'OP110', N'Ép seam', N'SP', 0.90, 0.83, 2.77, N'B', N'B'),
    (12, N'OP120', N'Kiểm tra & hoàn thiện', N'BÀN', 1.25, 1.16, 3.85, N'B', N'B');
    PRINT 'Da nap du lieu mau cho bang routing_data';
END
GO

-- 6. Tạo bảng mapping_configs (Lưu trữ cấu hình ánh xạ Excel)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='mapping_configs' AND xtype='U')
BEGIN
    CREATE TABLE mapping_configs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        config_key NVARCHAR(50) NOT NULL UNIQUE,
        table_name NVARCHAR(100) NOT NULL,
        sheet_name NVARCHAR(100) NULL,
        start_row INT NOT NULL,
        end_row INT NOT NULL,
        mapping_items NVARCHAR(MAX) NOT NULL
    );
    PRINT 'Da tao bang mapping_configs';
END
ELSE
BEGIN
    PRINT 'Bang mapping_configs da ton tai';
END
GO

-- 7. Chèn dữ liệu cấu hình ánh xạ mặc định (chỉ chèn nếu chưa có dữ liệu)
IF NOT EXISTS (SELECT 1 FROM mapping_configs)
BEGIN
    INSERT INTO mapping_configs (config_key, table_name, sheet_name, start_row, end_row, mapping_items) VALUES
    (N'employees', N'employees', N'Employee Database', 2, 4, N'[{"excelColumn":"A","dbColumn":"name"},{"excelColumn":"B","dbColumn":"email"},{"excelColumn":"C","dbColumn":"phone"},{"excelColumn":"D","dbColumn":"address"}]'),
    (N'routing_data', N'routing_data', N'Routing Details', 2, 13, N'[{"excelColumn":"A","dbColumn":"stt"},{"excelColumn":"B","dbColumn":"op_code"},{"excelColumn":"C","dbColumn":"op_name"},{"excelColumn":"D","dbColumn":"machine"},{"excelColumn":"E","dbColumn":"sam"},{"excelColumn":"F","dbColumn":"smv"},{"excelColumn":"G","dbColumn":"rate"},{"excelColumn":"H","dbColumn":"difficulty"},{"excelColumn":"I","dbColumn":"skill"}]');
    PRINT 'Da nap du lieu cau hinh mac dinh cho bang mapping_configs';
END
GO






-- 8. Tạo bảng master_status
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='master_status' AND xtype='U')
BEGIN
    CREATE TABLE master_status (
        id TINYINT PRIMARY KEY,
        status_code NVARCHAR(20) NOT NULL UNIQUE,
        status_name NVARCHAR(100) NOT NULL
    );

    PRINT 'Da tao bang master_status';
END
ELSE
BEGIN
    PRINT 'Bang master_status da ton tai';
END
GO

-- 9. Seed master_status
IF NOT EXISTS (SELECT 1 FROM master_status WHERE id = 0)
BEGIN
    INSERT INTO master_status (id, status_code, status_name)
    VALUES (0, N'ACTIVE', N'Còn sử dụng');
END
GO

IF NOT EXISTS (SELECT 1 FROM master_status WHERE id = 1)
BEGIN
    INSERT INTO master_status (id, status_code, status_name)
    VALUES (1, N'INACTIVE', N'Không sử dụng');
END
GO

-- 10. Tạo bảng clusters
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='clusters' AND xtype='U')
BEGIN
    CREATE TABLE clusters (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cluster_code NVARCHAR(50) NOT NULL UNIQUE,
        cluster_name NVARCHAR(255) NOT NULL,
        status_id TINYINT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

        CONSTRAINT FK_clusters_status 
            FOREIGN KEY (status_id) REFERENCES master_status(id)
    );

    PRINT 'Da tao bang clusters';
END
ELSE
BEGIN
    PRINT 'Bang clusters da ton tai';
END
GO



select  * from master_status;

select * from dbo.clusters;

select * from dbo.gsd_codes;

select * from dbo.sources;

alter table sources 
alter column source_code NVARCHAR(255) NOT NULL;


select * from gsd_analysis_details;
select * from gsd_analysis_headers;



IF COL_LENGTH('gsd_analysis_details', 'repeat_count') IS NOT NULL
   AND COL_LENGTH('gsd_analysis_details', 'frequency') IS NULL
BEGIN
    EXEC sp_rename 
        'gsd_analysis_details.repeat_count',
        'frequency',
        'COLUMN';
END
GO


