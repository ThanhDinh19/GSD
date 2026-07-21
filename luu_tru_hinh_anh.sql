CREATE TABLE media_files (
    id INT IDENTITY(1,1) PRIMARY KEY,
    image_url NVARCHAR(500) NOT NULL,
    image_file_name NVARCHAR(255) NULL,
    note NVARCHAR(255) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL
);


CREATE TABLE sewing_process_image_links (
    sewing_process_id INT NOT NULL,
    media_file_id INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,

    PRIMARY KEY (sewing_process_id, media_file_id),

    FOREIGN KEY (sewing_process_id)
        REFERENCES sewing_process_headers(id),

    FOREIGN KEY (media_file_id)
        REFERENCES media_files(id)
);


CREATE TABLE gsd_analysis_image_links (
    gsd_analysis_id INT NOT NULL,
    media_file_id INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,

    PRIMARY KEY (gsd_analysis_id, media_file_id),

    FOREIGN KEY (gsd_analysis_id)
        REFERENCES gsd_analysis_headers(id),
            
    FOREIGN KEY (media_file_id)
        REFERENCES media_files(id)
);

select * from sewing_process_images;
select * from media_files;

select * from sewing_process_headers;
select * from sewing_process_image_links;