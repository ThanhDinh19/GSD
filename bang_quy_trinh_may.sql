CREATE TABLE sewing_process_headers (
    id INT IDENTITY(1, 1) PRIMARY KEY,
    -- ID tự tăng, khóa chính của chứng từ quy trình may

    document_code VARCHAR(32) NOT NULL,
    -- Mã chứng từ quy trình may. Ví dụ: QTM-2026-0001

    customer_id INT NULL,
    -- ID khách hàng lấy từ master customer, chỉ lưu tham chiếu logic, không tạo FK

    customer_code VARCHAR(32) NULL,
    -- Mã khách hàng snapshot tại thời điểm tạo chứng từ

    customer_name NVARCHAR(100) NULL,
    -- Tên khách hàng snapshot tại thời điểm tạo chứng từ

    item_code VARCHAR(32) NULL,
    -- Mã hàng / style / mã sản phẩm

    production_line NVARCHAR(50) NULL,
    -- Chuyền sản xuất. Ví dụ: Line 1, Line 2, Chuyền A

    production_round INT NULL,
    -- Lần sản xuất. Ví dụ: lần 1, lần 2

    working_hours DECIMAL(6, 2) NOT NULL DEFAULT 9,
    -- Thời gian làm việc trong ngày, đơn vị giờ. Ví dụ: 9 giờ/ngày

    manpower INT NULL,
    -- Tổng nhân sự của chuyền

    production_manpower INT NULL,
    -- Nhân sự trực tiếp sản xuất, dùng để tính nhịp sản xuất và định mức

    quantity DECIMAL(18, 2) NULL,
    -- Số lượng sản phẩm cần sản xuất

    effective_date DATETIME2 NULL,
    -- Ngày áp dụng quy trình may

    issued_date DATETIME2 NULL,
    -- Ngày ban hành chứng từ quy trình may

    price_mode VARCHAR(32) NOT NULL DEFAULT 'GSD',
    -- Kiểu tính đơn giá:
    -- GSD      = tính đơn giá theo SAM GSD gốc
    -- ADJUSTED = tính đơn giá theo SAM điều chỉnh

    status_id TINYINT NOT NULL DEFAULT 0,
    -- Trạng thái chứng từ. Theo quy ước hiện tại: 0 = active, 1 = inactive

    note NVARCHAR(500) NULL,
    -- Ghi chú chung của chứng từ

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Ngày giờ tạo chứng từ

    updated_at DATETIME2 NULL
    -- Ngày giờ cập nhật gần nhất
);

select * from sewing_process_headers

CREATE UNIQUE INDEX UX_sewing_process_headers_document_code
ON sewing_process_headers(document_code);
-- Chặn trùng mã chứng từ quy trình may


CREATE TABLE sewing_process_summaries (
    id INT IDENTITY(1, 1) PRIMARY KEY,
    -- ID tự tăng, khóa chính của bảng tổng hợp

    document_code VARCHAR(32) NOT NULL,
    -- Mã chứng từ quy trình may, dùng để liên kết logic với sewing_process_headers.document_code

    total_time DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Tổng thời gian quy trình may sau khi cộng các công đoạn

    c1 DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- C1 theo công thức sheet, thường = total_time / 60

    total_sam_gsd DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Tổng SAM GSD gốc của toàn bộ công đoạn

    takt_time DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Nhịp sản xuất. Thường = total_time / production_manpower

    c3 DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- C3 theo công thức sheet, thường = takt_time / 60

    c4 DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- C4 theo công thức sheet, thường = total_time / total_sam_gsd

    standard_output DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Định mức sản lượng tính theo thời gian làm việc và nhân sự sản xuất

    c5 DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- C5 theo công thức sheet, thường liên quan sản lượng / thời gian làm việc

    c6 DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- C6 theo công thức sheet, thường là sản lượng theo SAM GSD gốc

    total_standard_price DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Tổng đơn giá chuẩn của toàn bộ công đoạn

    total_price_by_output DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Tổng đơn giá theo định mức sản lượng

    average_price DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Đơn giá bình quân

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Ngày giờ tạo bản tổng hợp

    updated_at DATETIME2 NULL
    -- Ngày giờ cập nhật gần nhất
);




CREATE TABLE sewing_process_lines (
    id INT IDENTITY(1, 1) PRIMARY KEY,
    -- ID tự tăng, khóa chính của dòng quy trình may

    document_code VARCHAR(32) NOT NULL,
    -- Mã chứng từ quy trình may hiện tại

    source_document_code VARCHAR(32) NULL,
    -- Mã chứng từ nguồn bên Kho cụm công đoạn.
    -- Ví dụ lấy công đoạn từ chứng từ 2026B15 thì lưu 2026B15

    source_line_id INT NULL,
    -- ID dòng công đoạn gốc bên Kho cụm công đoạn, chỉ lưu tham chiếu logic

    line_no INT NOT NULL,
    -- Số dòng hiển thị trong bảng quy trình may

    cluster_no INT NULL,
    -- STT cụm công đoạn

    cluster_name NVARCHAR(100) NULL,
    -- Tên cụm công đoạn snapshot tại thời điểm lấy dữ liệu

    operation_code VARCHAR(32) NULL,
    -- Mã công đoạn GSD / mã thao tác / mã nghiệp vụ nếu có

    operation_name NVARCHAR(200) NOT NULL,
    -- Tên công đoạn may. Ví dụ: Ráp vai, Tra tay, May lai

    line_order INT NULL,
    -- Thứ tự sắp xếp công đoạn trong quy trình

    skill_grade_id INT NULL,
    -- ID bậc tay nghề lấy từ master skill_grade, chỉ lưu tham chiếu logic

    skill_grade_level INT NULL,
    -- Cấp bậc tay nghề snapshot. Ví dụ: 2, 3, 4, 5

    machine_id INT NULL,
    -- ID máy lấy từ master machine_equipments, chỉ lưu tham chiếu logic

    machine_code VARCHAR(32) NULL,
    -- Mã máy snapshot tại thời điểm tạo quy trình

    machine_name NVARCHAR(200) NULL,
    -- Tên máy snapshot tại thời điểm tạo quy trình

    sam_gsd DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- SAM GSD gốc của công đoạn

    salary_coefficient DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Hệ số lương theo bậc tay nghề tại thời điểm tạo quy trình

    labor_count DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Số lao động / nhân sự cần cho công đoạn này

    standard_price DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Đơn giá chuẩn của công đoạn

    required_efficiency DECIMAL(18, 4) NULL,
    -- Hiệu suất yêu cầu hoặc hệ số điều chỉnh do người dùng nhập

    adjusted_sam DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- SAM sau điều chỉnh theo hiệu suất yêu cầu

    used_efficiency DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Hiệu suất thực tế đang dùng để tính toán

    total_actions INT NOT NULL DEFAULT 0,
    -- Tổng số thao tác GSD cấu thành công đoạn này

    sewing_employee NVARCHAR(200) NULL,
    -- Người may / nhân viên may phụ trách công đoạn, nếu có

    cbc_time DECIMAL(18, 4) NULL,
    -- Thời gian CBC nếu sheet có dùng cột CBC

    note NVARCHAR(200) NULL,
    -- Ghi chú cho từng dòng công đoạn

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Ngày giờ tạo dòng công đoạn

    updated_at DATETIME2 NULL
    -- Ngày giờ cập nhật gần nhất
);


CREATE TABLE sewing_process_machine_needs (
    id INT IDENTITY(1, 1) PRIMARY KEY,
    -- ID tự tăng, khóa chính của dòng nhu cầu MMTB

    document_code VARCHAR(32) NOT NULL,
    -- Mã chứng từ quy trình may hiện tại

    machine_id INT NULL,
    -- ID máy lấy từ master machine_equipments, chỉ lưu tham chiếu logic

    machine_code VARCHAR(32) NULL,
    -- Mã máy snapshot tại thời điểm tính nhu cầu MMTB

    machine_name NVARCHAR(200) NULL,
    -- Tên máy snapshot tại thời điểm tính nhu cầu MMTB

    sum_smv DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Tổng SMV/SAM của các công đoạn dùng cùng loại máy

    machine_need DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Nhu cầu máy tính ra trước khi làm tròn

    machine_quantity DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- Số lượng máy cần dùng sau khi làm tròn

    used_efficiency DECIMAL(18, 4) NULL,
    -- Hiệu suất dùng để tính nhu cầu máy

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    -- Ngày giờ tạo dòng nhu cầu MMTB

    updated_at DATETIME2 NULL
    -- Ngày giờ cập nhật gần nhất
);

CREATE TABLE sewing_process_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    document_code VARCHAR(32) NOT NULL,
    image_url NVARCHAR(500) NOT NULL,
    image_file_name NVARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 1,
    note NVARCHAR(255) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL
);


select * from operation_cluster_operations
where header_id = 44


select * from operation_cluster_headers
where document_code = '2026B234_COPY'


select * from sewing_process_headers



select * from sewing_process_images
where document_code = '2026B02'

select * from sewing_process_lines;



select * from sewing_process_machine_needs;

select * from sewing_process_summaries;

select * from gsd_analysis_details;

select * from gsd_analysis_headers;

select * from gsd_analysis_details order by analysis_id desc;

select * from operation_cluster_operations

select * from operation_cluster_headers

select 
     gd.analysis_id,
     gd.gsd_code,
     gd.action_name
from operation_cluster_operations oco
left join gsd_analysis_headers gh on oco.operation_code = gh.analysis_no
left join gsd_analysis_details gd on gh.id = gd.analysis_id
where oco.operation_code = 'PT20260710110928825'


SELECT
    gd.analysis_id,
    gd.gsd_code,
    gd.action_name
FROM gsd_analysis_details gd
INNER JOIN gsd_analysis_headers gh
    ON gh.id = gd.analysis_id
INNER JOIN operation_cluster_operations oco
    ON oco.operation_code = gh.analysis_no
WHERE oco.operation_code = 'PT20260710110928825';


SELECT
    oco.operation_code,
    gh.id AS header_id,
    gh.analysis_no,
    gd.analysis_id,
    gd.gsd_code,
    gd.action_name
FROM operation_cluster_operations oco
LEFT JOIN gsd_analysis_headers gh
    ON TRIM(oco.operation_code) = TRIM(gh.analysis_no)
LEFT JOIN gsd_analysis_details gd
    ON gd.analysis_id = gh.id
WHERE TRIM(oco.operation_code) = TRIM('PT20260710110928825');


SELECT
    id,
    analysis_no,
    LEN(analysis_no) AS text_length,
    DATALENGTH(analysis_no) AS data_length
FROM gsd_analysis_headers
WHERE analysis_no = 'PT20260710110928825';

SELECT *
FROM operation_cluster_operations
WHERE operation_code = 'PT20260710110928825';


select * from gsd_analysis_headers
select * from gsd_analysis_details


SELECT
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN (
    'operation_cluster_operations',
    'gsd_analysis_headers',
    'gsd_analysis_details'
)
ORDER BY TABLE_NAME, ORDINAL_POSITION;



DECLARE @operationCode VARCHAR(50) = 'PT20260710110928825';

SELECT
    gd.id,
    gd.analysis_id,
    gd.gsd_code,
    gd.action_name
FROM gsd_analysis_details gd
INNER JOIN gsd_analysis_headers gh
    ON gh.id = gd.analysis_id
WHERE gh.analysis_no = @operationCode
  AND EXISTS (
      SELECT 1
      FROM operation_cluster_operations oco
      WHERE oco.operation_code = @operationCode
  )
ORDER BY gd.id;

select * from operation_cluster_operations where operation_code = 'PT20260710110928825'

select * from gsd_analysis_headers where analysis_no = 'PT20260710110928825'

select * from sewing_process_lines

select * from source_action_headers;
select * from source_action_details;

select * from gsd_codes;

