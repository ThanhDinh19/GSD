select 
top 1 id,
analysis_no as [analysisNo]
from gsd_analysis_headers
where id = 42


use [demo_db]


select * from gsd_analysis_headers order by id desc;

select * from gsd_analysis_details order by id desc;


begin tran;

DELETE FROM gsd_analysis_details
WHERE analysis_id BETWEEN 136 AND 144;


commit;