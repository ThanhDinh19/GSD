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


use [demo_db]


select 
    files.image_url,
    files.image_file_name
from sewing_process_image_links links
left join media_files files on links.media_file_id = files.id
where sewing_process_id = 14


select * from sewing_process_images;
select * from media_files;

select * from sewing_process_headers;
select * from sewing_process_image_links;



  SELECT
            id AS [id],
            document_code AS [documentCode],
            image_url AS [imageUrl],
            image_file_name AS [imageFileName],
            sort_order AS [sortOrder],
            note AS [note],
            created_at AS [createdAt],
            updated_at AS [updatedAt]
        FROM sewing_process_images
        WHERE document_code = @document_code
        ORDER BY sort_order ASC, id ASC



          SELECT TOP 1 id, document_code AS [documentCode]
            FROM sewing_process_headers
            WHERE id = 14




delete from media_files
where id 