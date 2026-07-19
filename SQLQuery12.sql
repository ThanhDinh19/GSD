select 
top 1 id,
analysis_no as [analysisNo]
from gsd_analysis_headers
where id = 42


use [demo_db]


select * from gsd_analysis_headers order by id desc;

select * from gsd_analysis_details order by id desc;


select * from source_action_details;

select * from source_action_headers;
select * from sources;

select * from gsd_codes;

select s.id, sh.source_id, s.source_code, s.source_name, s.note, sh.total_actions, sh.total_tmu, sd.action_name, gsd.action_name
from sources s
left join source_action_headers sh on s.id = sh.source_id
left join source_action_details sd on sh.id = sd.header_id
left join gsd_codes gsd on sd.gsd_code_id = gsd.id
where s.id = 13

select 
	gsd_d.source_action_detail_id,
	gsd_d.action_name,
	sd.action_name
from gsd_analysis_details gsd_d
left join source_action_details sd on gsd_d.source_action_detail_id = sd.id

select * from gsd_analysis_headers;
select * from gsd_analysis_details;

select * 
from gsd_analysis_details gsd_d 
left join source_action_details sd on gsd_d.source_action_detail_id = sd.id
left join gsd_codes gsd on gsd_d.gsd_code_id = gsd.id
left join source_action_headers sah on sd.header_id = sah.id
left join sources s on s.id = sah.source_id
where gsd_d.source_action_detail_id = 200;

select * from source_action_headers
select * from source_action_details
select * from sources;

select * from gsd_codes;

use [demo_db]

select * from machine_equipments

select * from machine_equipments_test;

    SELECT
      a.id AS [id],
      a.analysis_no AS [analysisNo],
      a.analysis_date AS [analysisDate],
      a.operation_name AS [operationName],

      s.source_code AS [sourceCode],
      m.machine_code AS [machineCode],
      m.machine_name AS [machineName],
      m.code_mmtb AS [codeMMTB],

      a.total_tmu AS [totalTmu],
      a.total_manual_seconds AS [totalManualSeconds],
      a.machine_seconds AS [machineSeconds],
      a.total_smv_before_difficulty AS [totalSmvBeforeDifficulty],
      a.difficulty_seconds AS [difficultySeconds],
      a.final_smv AS [finalSmv],
      a.skill_grade AS [skillGrade],
      a.created_at AS [createdAt]
    FROM gsd_analysis_headers a
    LEFT JOIN sources s ON a.source_id = s.id
    LEFT JOIN machine_equipments_test m ON a.machine_id = m.id
    ORDER BY a.id DESC


select * from departments_test;

