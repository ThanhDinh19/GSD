use [demo_db]


CREATE TABLE department_types (
    department_type_id VARCHAR(16) NOT NULL PRIMARY KEY,
    department_type_name NVARCHAR(255) NOT NULL,
    sort_order INT NULL,
    status INT NOT NULL DEFAULT 1,

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL,

    CONSTRAINT uq_department_types_sort_order UNIQUE (sort_order),
    CONSTRAINT ck_department_types_status CHECK (status IN (0, 1))
);

select * from department_types

create table department_types_test (
    id int identity(1, 1) not null primary key,
    department_type_code varchar(16) not null unique,
    department_type_name nvarchar(255) not null,
    sort_order int null,
    status_id tinyint not null default 0,
    created_at datetime2 not null default sysdatetime(),
    updated_at datetime2 null,
    constraint FK_department_type_status foreign key (status_id) references master_status(id)
);

select * from department_types_test;

select * from departments;


CREATE TABLE departments (
    department_id VARCHAR(16) NOT NULL PRIMARY KEY,
    department_name NVARCHAR(255) NOT NULL,

    manager_employee_id VARCHAR(16) NULL,
    parent_department_id VARCHAR(16) NULL,
    department_type_id VARCHAR(16) NOT NULL,

    status INT NOT NULL DEFAULT 1,
    dissolved_at DATETIME2 NULL,

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL,

    CONSTRAINT ck_departments_status CHECK (status IN (0, 1))
);


create table departments_test (
    id int identity(1, 1) not null primary key,

    department_code VARCHAR(16) NOT NULL,
    department_name NVARCHAR(255) NOT NULL,

    manager_employee_id VARCHAR(16) NULL,
    parent_department_code VARCHAR(16) NULL,
    department_type_code VARCHAR(16) NOT NULL,

    status_id tinyint NOT NULL DEFAULT 0,
    dissolved_at DATETIME2 NULL,

    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL,
    
    constraint FK_department_status foreign key (status_id) references master_status(id)
);


select * from departments_test;


CREATE INDEX ix_departments_parent_department_id
ON departments(parent_department_id);

CREATE INDEX ix_departments_department_type_id
ON departments(department_type_id);

CREATE INDEX ix_departments_manager_employee_id
ON departments(manager_employee_id);

CREATE INDEX ix_departments_status
ON departments(status);

CREATE INDEX ix_department_types_status
ON department_types(status);

CREATE INDEX ix_employees_status
ON employees(status);

select * from employees





select * from departments;



select * from department_types;
select * from department_types_test;

select * from product_category_groups;


---------------- data test -------------------

USE demo_db;
GO

MERGE department_types AS target
USING (
    VALUES
    ('DT0001', N'Công ty', 1, 1),
    ('DT0002', N'Chi nhánh', 2, 1),
    ('DT0003', N'Khối', 3, 1),
    ('DT0004', N'Phòng ban', 4, 1),
    ('DT0005', N'Tổ/Nhóm', 5, 1)
) AS src (
    department_type_id,
    department_type_name,
    sort_order,
    status
)
ON target.department_type_id = src.department_type_id
WHEN MATCHED THEN
    UPDATE SET
        department_type_name = src.department_type_name,
        sort_order = src.sort_order,
        status = src.status,
        updated_at = SYSDATETIME()
WHEN NOT MATCHED THEN
    INSERT (
        department_type_id,
        department_type_name,
        sort_order,
        status
    )
    VALUES (
        src.department_type_id,
        src.department_type_name,
        src.sort_order,
        src.status
    );
GO

MERGE departments AS target
USING (
    VALUES
    ('D0001', N'Công ty Cổ phần Demo Việt Nam', NULL, NULL, 'DT0001', 1, NULL),
    ('D0002', N'Chi nhánh Hà Nội', NULL, 'D0001', 'DT0002', 1, NULL),
    ('D0003', N'Khối Kinh doanh', NULL, 'D0002', 'DT0003', 1, NULL),
    ('D0004', N'Phòng Bán hàng', NULL, 'D0003', 'DT0004', 1, NULL),
    ('D0005', N'Phòng Chăm sóc khách hàng', NULL, 'D0003', 'DT0004', 1, NULL),
    ('D0006', N'Khối Vận hành', NULL, 'D0002', 'DT0003', 1, NULL),
    ('D0007', N'Phòng Nhân sự', NULL, 'D0006', 'DT0004', 1, NULL),
    ('D0008', N'Phòng Kế toán', NULL, 'D0006', 'DT0004', 1, NULL),
    ('D0009', N'Chi nhánh Hồ Chí Minh', NULL, 'D0001', 'DT0002', 1, NULL),
    ('D0010', N'Phòng Marketing', NULL, 'D0009', 'DT0004', 1, NULL),
    ('D0011', N'Phòng Kho vận', NULL, 'D0009', 'DT0004', 1, NULL),
    ('D0012', N'Chi nhánh Đà Nẵng', NULL, 'D0001', 'DT0002', 0, SYSDATETIME())
) AS src (
    department_id,
    department_name,
    manager_employee_id,
    parent_department_id,
    department_type_id,
    status,
    dissolved_at
)
ON target.department_id = src.department_id
WHEN MATCHED THEN
    UPDATE SET
        department_name = src.department_name,
        manager_employee_id = src.manager_employee_id,
        parent_department_id = src.parent_department_id,
        department_type_id = src.department_type_id,
        status = src.status,
        dissolved_at = src.dissolved_at,
        updated_at = SYSDATETIME()
WHEN NOT MATCHED THEN
    INSERT (
        department_id,
        department_name,
        manager_employee_id,
        parent_department_id,
        department_type_id,
        status,
        dissolved_at
    )
    VALUES (
        src.department_id,
        src.department_name,
        src.manager_employee_id,
        src.parent_department_id,
        src.department_type_id,
        src.status,
        src.dissolved_at
    );
GO