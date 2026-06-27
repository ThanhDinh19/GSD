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

use [demo_db]

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


USE demo_db;
GO

DECLARE @clusterId INT = 6;

MERGE machine_equipments AS target
USING (
    VALUES
    (N'MMTB0001', N'Máy Lập trình khổ 1400x900mm', N'LT90', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0002', N'Máy Lập Trình 800x350mm', N'LT35', 0.94, 4.5, 3000, NULL, NULL, NULL, 0),
    (N'MMTB0003', N'Máy lập trình khổ 800x550mm', N'LT55', 0.94, 4.5, 3000, NULL, NULL, NULL, 0),
    (N'MMTB0004', N'Máy Lập Trình Khung 30x20mm', N'LTNho', 0.94, 4.5, 3000, NULL, NULL, NULL, 0),
    (N'MMTB0005', N'Máy 1K điện tử', N'1K', 0.94, 4.5, 5000, NULL, NULL, NULL, 0),
    (N'MMTB0006', N'Máy 1K thường', N'1K', 0.94, 4.5, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0007', N'Máy 1 Kim Xén', N'1KXen', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0008', N'Máy 1 Kim Xén viền', N'1KXen', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0009', N'Máy 1 Kim Xén Cơ', N'1KXen', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0010', N'Máy 1 Kim Cào', N'1KC', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0011', N'Máy 1 Kim Chống Nhăn', N'1KCN', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0012', N'Máy 1 Kim Cùi Chỏ - Đầu Nhỏ', N'1KDaunho', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0013', N'Máy 1 kim dùng lên lai quần', N'1KLai', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0014', N'Máy 1 Kim Thân Dài', N'1KTD', 0.94, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0015', N'Máy 1 Kim Móch Xích', N'1KMX', 1.01, 4, 3000, NULL, NULL, NULL, 0),
    (N'MMTB0016', N'Máy 2K điện tử', N'2K', 1.06, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0017', N'Máy 2K Thường', N'2K', 1.08, 4, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0018', N'Máy 2 Kim Móc Xích', N'2KMX', 0.85, 4, 3000, NULL, NULL, NULL, 0),
    (N'MMTB0019', N'Máy 3 Kim Móc Xích', N'3KMX', 0.85, 4, 3000, NULL, NULL, NULL, 0),
    (N'MMTB0020', N'Máy Đánh Bông 4K6C Fatseam', N'4K6C', 0.85, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0021', N'Máy Cuốn Sườn 2 Kim', N'Cuonsuon', 0.85, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0022', N'Máy Cuốn Sườn 3 Kim', N'Cuonsuon', 0.85, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0023', N'Đánh Bông đầu nhỏ', N'KSNho', 1.01, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0024', N'Đánh Bông đầu trung', N'KSTrung', 1.01, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0025', N'Đánh Bông xén lai', N'KSXenlai', 1.01, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0026', N'Đánh Bông đầu bằng', N'KSbang', 1.01, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0027', N'Đánh Bông đầu heo', N'KSHeo', 1.01, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0028', N'Kansai 4K', N'KSLung4K', 1.12, 4.5, 2500, NULL, NULL, NULL, 0),
    (N'MMTB0029', N'Kansai 12K', N'KSLung12K', 1.08, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0030', N'Máy Kansai Lưng 13K', N'KSLung13K', 1.12, 4.5, 1400, NULL, NULL, NULL, 0),
    (N'MMTB0031', N'Kansai 21K', N'KSLung21K', 1.12, 4.5, 1400, NULL, NULL, NULL, 0),
    (N'MMTB0032', N'Máy kansai lưng 23K', N'KSLung23K', 1.12, 4.5, 1400, NULL, NULL, NULL, 0),
    (N'MMTB0033', N'Máy Đột', N'Maydot', 1.01, 4.5, 2500, NULL, NULL, NULL, 0),
    (N'MMTB0034', N'Máy Săm Lai', N'Samlai', 1.01, 4.5, 3500, NULL, NULL, NULL, 0),
    (N'MMTB0035', N'May đường cong', N'Duongcong', 0.77, 4.5, 3200, NULL, NULL, NULL, 0),
    (N'MMTB0036', N'Vắt Sổ 6C - Đường cong', N'VS6C', 1.01, 4.5, 2800, NULL, NULL, NULL, 0),
    (N'MMTB0037', N'Vắt Sổ 5C - Đường cong', N'VS5C', 1.01, 4.5, 2800, NULL, NULL, NULL, 0),
    (N'MMTB0038', N'Vắt Sổ 4C - Đường cong', N'VS4C', 1.01, 4.5, 3200, NULL, NULL, NULL, 0),
    (N'MMTB0039', N'Vắt sổ 4 chỉ cùi nhỏ', N'VS4CN', 1.01, 4.5, 3200, NULL, NULL, NULL, 0),
    (N'MMTB0040', N'Vắt Sổ 3C - Đường cong', N'VS3C', 1.01, 4.5, 3200, NULL, NULL, NULL, 0),
    (N'MMTB0041', N'Vắt Sổ 1 Lớp', N'VS3C', 1.01, 4.5, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0042', N'Vắt Sổ 5C - Đường thẳng', N'VS5C', 1.01, 4.5, 6000, NULL, NULL, NULL, 0),
    (N'MMTB0043', N'Vắt Sổ 4C - Đường thẳng', N'VS4C', 1.01, 4.5, 6000, NULL, NULL, NULL, 0),
    (N'MMTB0044', N'Vắt Sổ 3C - Đường thẳng', N'VS3C', 1.01, 4.5, 6000, NULL, NULL, NULL, 0),
    (N'MMTB0045', N'Vắt Sổ 6C - Đường thẳng', N'VS6C', 1.01, 4.5, 6000, NULL, NULL, NULL, 0),
    (N'MMTB0046', N'Máy Mỗ Túi tự động', N'MotuiTD', 1.03, 4, 4500, NULL, NULL, NULL, 0),
    (N'MMTB0047', N'Máy 1 Kim ZicZac', N'Ziczac', 1.21, 8, 4000, NULL, NULL, NULL, 0),
    (N'MMTB0048', N'Ép Seam', N'Seam', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0049', N'Máy Dán Keo Đa Năng', N'SeamDan', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0050', N'Máy xén keo 2 mặt', N'Seamxen', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0051', N'Máy chằn Ultra', N'Ultra', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0052', N'Máy Ép keo', N'Epkeo', 1.21, 5, 1200, NULL, NULL, NULL, 0),
    (N'MMTB0053', N'Máy Thêu', N'THEU', 2.11, 30, 800, NULL, NULL, NULL, 0),
    (N'MMTB0054', N'Máy Dập nút Hơi', N'Dapnut', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0055', N'Máy Ép Nhiệt', N'EP', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0056', N'Máy Ép Nóng', N'EP', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0057', N'Máy Ép Nóng-Lạnh Khuôn Cong', N'EPCNL', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0058', N'Máy Ép Nhiệt Khuôn Cong', N'EPCong', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0059', N'Máy Ép Keo', N'Epkeo', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0060', N'Máy Ép Nóng Lai Tròn', N'EPLAI', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0061', N'Máy ép Nóng Lạnh', N'EPNL', 0.92, 4, 1500, NULL, NULL, NULL, 0),
    (N'MMTB0062', N'Máy Bọ', N'Bo', 2.18, 30, 2000, NULL, NULL, NULL, 0),
    (N'MMTB0063', N'Máy khuy thường Điện tử', N'Khuy', 1.53, 12, 1800, NULL, NULL, NULL, 0),
    (N'MMTB0064', N'Máy Khuy thường', N'Khuy', 1.53, 12, 1800, NULL, NULL, NULL, 0),
    (N'MMTB0065', N'Máy Khuy mắt phụng', N'KhuyO', 1.53, 12, 1800, NULL, NULL, NULL, 0),
    (N'MMTB0066', N'Máy Đính Nút điện tử', N'Nut', 1.96, 24, 1800, NULL, NULL, NULL, 0),
    (N'MMTB0067', N'Máy Đính Nút', N'Nut', 1.96, 24, 1800, NULL, NULL, NULL, 0),
    (N'MMTB0068', N'Bàn ủi Nhiệt', N'BAUI', 1.21, NULL, 2000, NULL, NULL, NULL, 0),
    (N'MMTB0069', N'Bàn Hút', N'BHUT', 0.92, NULL, 2000, NULL, NULL, NULL, 0),
    (N'MMTB0070', N'Máy Cắt Lazer', N'Laser', 2.11, NULL, 1800, NULL, NULL, NULL, 0),
    (N'MMTB0071', N'Máy đai thùng', N'Maydai', 0.92, NULL, 2000, NULL, NULL, NULL, 0)
) AS src (
    machine_code,
    machine_name,
    code_mmtb,
    allowance,
    stitch_count,
    machine_speed,
    default_smv,
    skill_grade,
    note,
    status_id
)
ON target.machine_code = src.machine_code

WHEN MATCHED THEN
    UPDATE SET
        target.machine_name = src.machine_name,
        target.cluster_id = @clusterId,
        target.code_mmtb = src.code_mmtb,
        target.allowance = src.allowance,
        target.stitch_count = src.stitch_count,
        target.machine_speed = src.machine_speed,
        target.default_smv = src.default_smv,
        target.skill_grade = src.skill_grade,
        target.note = src.note,
        target.status_id = src.status_id

WHEN NOT MATCHED THEN
    INSERT (
        machine_code,
        machine_name,
        cluster_id,
        code_mmtb,
        allowance,
        stitch_count,
        machine_speed,
        default_smv,
        skill_grade,
        note,
        status_id
    )
    VALUES (
        src.machine_code,
        src.machine_name,
        @clusterId,
        src.code_mmtb,
        src.allowance,
        src.stitch_count,
        src.machine_speed,
        src.default_smv,
        src.skill_grade,
        src.note,
        src.status_id
    );
GO




USE demo_db;
GO

;WITH ClusterSource AS (
    SELECT DISTINCT
        cluster_code,
        cluster_name,
        status_id
    FROM (
        VALUES
        (N'Lượt-Đính-Ghim (GH)', N'Lượt-Đính-Ghim (GH)', 0),
        (N'Lượt-Đính-Ghim-Gắn Phụ Liệu (GHPL)', N'Lượt-Đính-Ghim-Gắn Phụ Liệu (GHPL)', 0),
        (N'May Kê - Gấp (MC)', N'May Kê - Gấp (MC)', 0),
        (N'Viền Cử Gá (KV)', N'Viền Cử Gá (KV)', 0),
        (N'Chần, Nhồi, Lập Trình Gòn - Lông Vịt (TRDN)', N'Chần, Nhồi, Lập Trình Gòn - Lông Vịt (TRDN)', 0),
        (N'Gấp, Diễu (GD)', N'Gấp, Diễu (GD)', 0),
        (N'ÉP Cử Gá, Ép Dập (EC)', N'ÉP Cử Gá, Ép Dập (EC)', 0),
        (N'Cuốn Lai, Miệng Túi (CG)', N'Cuốn Lai, Miệng Túi (CG)', 0),
        (N'Mí Diễu (MD)', N'Mí Diễu (MD)', 0),
        (N'Quay Rập (Pát, Nắp Túi Chi tiết Nhỏ,…) (QU)', N'Quay Rập (Pát, Nắp Túi Chi tiết Nhỏ,…) (QU)', 0),
        (N'Ép SEAM (ES)', N'Ép SEAM (ES)', 0),
        (N'Vắt Sổ (VS)', N'Vắt Sổ (VS)', 0),
        (N'Ép Dán (DA)', N'Ép Dán (DA)', 0),
        (N'Mỗ Túi (BT)', N'Mỗ Túi (BT)', 0),
        (N'Ép Dán Cử Gá (EKD)', N'Ép Dán Cử Gá (EKD)', 0),
        (N'Lộn Từ Trong Ra Ngoài (LO)', N'Lộn Từ Trong Ra Ngoài (LO)', 0),
        (N'Đính Bọ, Đục Lỗ (BĐ)', N'Đính Bọ, Đục Lỗ (BĐ)', 0),
        (N'LUỒN (LU)', N'LUỒN (LU)', 0),
        (N'Ủi (LA)', N'Ủi (LA)', 0),
        (N'Đo Và Cắt (Đ&C)', N'Đo Và Cắt (Đ&C)', 0),
        (N'Lấy Dấu - Sang Dấu (SD)', N'Lấy Dấu - Sang Dấu (SD)', 0)
    ) AS src(cluster_code, cluster_name, status_id)
)
INSERT INTO clusters (
    cluster_code,
    cluster_name,
    status_id
)
SELECT
    src.cluster_code,
    src.cluster_name,
    src.status_id
FROM ClusterSource src
WHERE NOT EXISTS (
    SELECT 1
    FROM clusters c
    WHERE c.cluster_code = src.cluster_code
);
GO

    
select * from [master_status]
select * from [sources]
select * from [machine_equipments]
select * from [gsd_codes]


use [demo_db]

SELECT
    s.id AS source_id,
    s.source_code,
    s.source_name,

    h.id AS header_id,
    h.total_actions,
    h.total_tmu,

    d.id AS detail_id,
    d.line_no,
    d.gsd_code_id,

    g.action_code,
    d.action_name,
    d.gsd_code,
    d.code_new,
    d.frequency,
    d.tmu,
    CAST((ISNULL(d.tmu, 0) * ISNULL(d.frequency, 1)) / 27.8 AS DECIMAL(18,6)) AS seconds,
    d.note
FROM sources s
LEFT JOIN source_action_headers h 
    ON h.source_id = s.id
LEFT JOIN source_action_details d 
    ON d.header_id = h.id
LEFT JOIN gsd_codes g 
    ON g.id = d.gsd_code_id
ORDER BY
    s.id,
    d.line_no;



select * from [source_action_details]

select * from [source_action_headers]
select * from [sources]
select * from [machine_equipments]


update [machine_equipments]
set cluster_id = NULL
where cluster_id IS NOT NULL

select
    id,
    header_id,
    gsd_code_id,
    action_name
from [source_action_details]
where header_id = 11





IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='machine_equipments_test' and xtype='U')
    BEGIN
      CREATE TABLE machine_equipments_test (
        id INT IDENTITY(1,1) PRIMARY KEY,

        machine_code NVARCHAR(16) NOT NULL UNIQUE,   -- Mã MMTB
        machine_name NVARCHAR(256) NOT NULL,         -- Tên MMTB

        cluster_id INT NULL,                         -- Cụm

        code_mmtb NVARCHAR(16) NULL,                 -- Code
        allowance DECIMAL(5,2) NULL,                 -- Hao phí
        stitch_count DECIMAL(5,2) NULL,              -- Số mũi chỉ
        machine_speed INT NULL,                      -- Tốc độ máy

        default_smv DECIMAL(5,2) NULL,               -- SMV
        skill_grade CHAR(1) NULL,                    -- Bậc CĐ

        note NVARCHAR(256) NULL,
        status_id TINYINT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
      )
    END


ALTER TABLE machine_equipments_test
ADD attached_action_time DECIMAL(5, 2) NOT NULL DEFAULT 4.4;

select st.status_name, m.machine_name
from master_status as st with(nolock), machine_equipments_test as m with(nolock)
where st.id = m.status_id


select * from machine_equipments_test with(nolock)

update machine_equipments_test
set machine_name = N'Máy đai thùng test'
where machine_code = 'MMTB0071'


DELETE FROM machine_equipments_test;

SET IDENTITY_INSERT machine_equipments_test ON;

INSERT INTO machine_equipments_test (
    id,
    machine_code,
    machine_name,
    cluster_id,
    code_mmtb,
    allowance,
    stitch_count,
    machine_speed,
    default_smv,
    skill_grade,
    note,
    status_id,
    created_at
)
SELECT
    id,
    machine_code,
    machine_name,
    cluster_id,
    code_mmtb,
    allowance,
    stitch_count,
    machine_speed,
    default_smv,
    skill_grade,
    note,
    status_id,
    created_at
FROM machine_equipments;

SET IDENTITY_INSERT machine_equipments_test OFF;










SELECT
      m.id,
      m.machine_code AS machineCode,
      m.machine_name AS machineName,

      m.cluster_id AS clusterId,

      m.code_mmtb AS codeMmtb,
      m.allowance,
      m.stitch_count AS stitchCount,
      m.machine_speed AS machineSpeed,

      m.default_smv AS defaultSmv,
      m.skill_grade AS skillGrade,

      m.note,
      m.status_id AS statusId,
      s.status_name AS statusName,
      m.created_at AS createdAt
    FROM machine_equipments m
    LEFT JOIN master_status s ON m.status_id = s.id
    ORDER BY m.id DESC



select * from machine_equipments with(nolock)

select * from gsd_analysis_details with(nolock)

select * from gsd_analysis_headers with(nolock)

select * from gsd_codes with(nolock)
where seconds = '0.160000'


SELECT
    id,
    machine_code AS [machineCode],
    machine_name AS [machineName],
    stitch_count AS [stitchCount],
    machine_speed AS [machineSpeed],
    allowance AS [allowance],
    skill_grade AS [skillGrade]
FROM machine_equipments_test
WHERE id = 3




    SELECT
      m.id,
      m.machine_code AS machineCode,
      m.machine_name AS machineName,

      m.cluster_id AS clusterId,

      m.code_mmtb AS codeMmtb,
      m.allowance,
      m.stitch_count AS stitchCount,
      m.machine_speed AS machineSpeed,

      m.default_smv AS defaultSmv,
      m.skill_grade AS skillGrade,

      m.note,
      m.status_id AS statusId,
      s.status_name AS statusName,
      m.created_at AS createdAt,
      m.attached_action_time
    FROM machine_equipments_test m
    LEFT JOIN master_status s ON m.status_id = s.id
    ORDER BY m.id DESC  