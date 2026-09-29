-- Danh mục loại cân bằng
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'balance_types' AND xtype = 'U')
BEGIN
    CREATE TABLE balance_types (
        id int identity(1, 1) primary key,
        balance_type_code varchar(50) not null unique,
        balance_type_name nvarchar(255) not null,
        status_id tinyint not null default 0,
        created_at datetime2 not null default sysdatetime(),

        constraint FK_balance_type_status foreign key (status_id) references master_status(id)
    );

    PRINT 'Da tao bang balance_types';
END
ELSE
BEGIN
    PRINT 'Bang balance_types da ton tai';
END
GO

SELECT * FROM balance_types;
