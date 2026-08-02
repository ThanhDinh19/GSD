/*
  Ví dụ dữ liệu cho GSD:
  - Module/màn hình
  - Permission
  - Role
  - Workflow Xem xét -> Duyệt -> Theo dõi
  Chạy sau authorization_workflow_schema.sql
*/
SET NOCOUNT ON;
GO

/* 1. Module */
MERGE app.modules t
USING (VALUES
 ('SYSTEM',N'Hệ thống','/system','settings',100),
 ('GSD',N'Quản lý GSD','/gsd','activity',10),
 ('SEWING',N'Quy trình may','/sewing','factory',20),
 ('OPERATION_CLUSTER',N'Kho cụm công đoạn','/operation-clusters','layers',30)
)s(module_code,module_name,route_prefix,icon_key,sort_order)
ON t.module_code=s.module_code
WHEN MATCHED THEN UPDATE SET module_name=s.module_name,route_prefix=s.route_prefix,icon_key=s.icon_key,sort_order=s.sort_order
WHEN NOT MATCHED THEN INSERT(module_code,module_name,route_prefix,icon_key,sort_order,status_id)
VALUES(s.module_code,s.module_name,s.route_prefix,s.icon_key,s.sort_order,0);
GO

/* 2. Màn hình */
DECLARE @system_id INT=(SELECT id FROM app.modules WHERE module_code='SYSTEM');
DECLARE @gsd_id INT=(SELECT id FROM app.modules WHERE module_code='GSD');
DECLARE @sewing_id INT=(SELECT id FROM app.modules WHERE module_code='SEWING');
DECLARE @cluster_id INT=(SELECT id FROM app.modules WHERE module_code='OPERATION_CLUSTER');

MERGE app.screens t
USING (VALUES
 (@system_id,'SYSTEM.EMPLOYEES',N'Nhân viên','/system/employees','SYSTEM_EMPLOYEES',10),
 (@system_id,'SYSTEM.USERS',N'Tài khoản','/system/users','SYSTEM_USERS',20),
 (@system_id,'SYSTEM.ROLES',N'Vai trò và phân quyền','/system/roles','SYSTEM_ROLES',30),
 (@system_id,'SYSTEM.SCREENS',N'Màn hình hệ thống','/system/screens','SYSTEM_SCREENS',40),
 (@system_id,'SYSTEM.WORKFLOW',N'Quy trình duyệt','/system/workflows','SYSTEM_WORKFLOWS',50),
 (@system_id,'SYSTEM.AUDIT',N'Nhật ký hệ thống','/system/audit-logs','SYSTEM_AUDIT',60),
 (@gsd_id,'GSD.ANALYSIS',N'Phân tích GSD','/gsd-analysis','GSD_ANALYSIS',10),
 (@sewing_id,'SEWING.PROCESS',N'Quy trình may','/sewing-process','SEWING_PROCESS',10),
 (@cluster_id,'OPERATION_CLUSTER.MAIN',N'Kho cụm công đoạn','/operation-clusters','OPERATION_CLUSTER_MAIN',10)
)s(module_id,screen_code,screen_name,route_path,component_key,sort_order)
ON t.screen_code=s.screen_code
WHEN MATCHED THEN UPDATE SET module_id=s.module_id,screen_name=s.screen_name,route_path=s.route_path,component_key=s.component_key,sort_order=s.sort_order
WHEN NOT MATCHED THEN INSERT(module_id,screen_code,screen_name,route_path,component_key,screen_type_code,is_menu,sort_order,status_id)
VALUES(s.module_id,s.screen_code,s.screen_name,s.route_path,s.component_key,'PAGE',1,s.sort_order,0);
GO

/* 3. Permission matrix */
DECLARE @matrix TABLE(screen_code VARCHAR(100),action_code VARCHAR(50));
INSERT INTO @matrix VALUES
 ('SYSTEM.EMPLOYEES','VIEW'),('SYSTEM.EMPLOYEES','CREATE'),('SYSTEM.EMPLOYEES','UPDATE'),('SYSTEM.EMPLOYEES','DELETE'),
 ('SYSTEM.USERS','VIEW'),('SYSTEM.USERS','CREATE'),('SYSTEM.USERS','UPDATE'),('SYSTEM.USERS','LOCK'),('SYSTEM.USERS','RESET_PASSWORD'),
 ('SYSTEM.ROLES','VIEW'),('SYSTEM.ROLES','MANAGE'),('SYSTEM.SCREENS','VIEW'),('SYSTEM.SCREENS','MANAGE'),
 ('SYSTEM.WORKFLOW','VIEW'),('SYSTEM.WORKFLOW','MANAGE'),('SYSTEM.AUDIT','VIEW'),
 ('GSD.ANALYSIS','VIEW'),('GSD.ANALYSIS','CREATE'),('GSD.ANALYSIS','UPDATE'),('GSD.ANALYSIS','DELETE'),
 ('GSD.ANALYSIS','SUBMIT'),('GSD.ANALYSIS','REVIEW'),('GSD.ANALYSIS','APPROVE'),('GSD.ANALYSIS','REJECT'),
 ('GSD.ANALYSIS','RETURN'),('GSD.ANALYSIS','MONITOR'),('GSD.ANALYSIS','EXPORT'),
 ('SEWING.PROCESS','VIEW'),('SEWING.PROCESS','CREATE'),('SEWING.PROCESS','UPDATE'),('SEWING.PROCESS','DELETE'),
 ('SEWING.PROCESS','SUBMIT'),('SEWING.PROCESS','REVIEW'),('SEWING.PROCESS','APPROVE'),('SEWING.PROCESS','REJECT'),('SEWING.PROCESS','MONITOR'),('SEWING.PROCESS','EXPORT'),
 ('OPERATION_CLUSTER.MAIN','VIEW'),('OPERATION_CLUSTER.MAIN','CREATE'),('OPERATION_CLUSTER.MAIN','UPDATE'),('OPERATION_CLUSTER.MAIN','DELETE'),
 ('OPERATION_CLUSTER.MAIN','SUBMIT'),('OPERATION_CLUSTER.MAIN','REVIEW'),('OPERATION_CLUSTER.MAIN','APPROVE'),('OPERATION_CLUSTER.MAIN','REJECT'),('OPERATION_CLUSTER.MAIN','MONITOR'),('OPERATION_CLUSTER.MAIN','EXPORT');

INSERT INTO auth.permissions(screen_id,action_id,permission_code,permission_name,status_id)
SELECT s.id,a.id,CONCAT(s.screen_code,'.',a.action_code),CONCAT(s.screen_name,N' - ',a.action_name),0
FROM @matrix m
JOIN app.screens s ON s.screen_code=m.screen_code
JOIN app.actions a ON a.action_code=m.action_code
WHERE NOT EXISTS(
 SELECT 1 FROM auth.permissions p WHERE p.screen_id=s.id AND p.action_id=a.id
);
GO

/* 4. Role */
MERGE auth.roles t
USING (VALUES
 ('SYSTEM_ADMIN',N'Quản trị hệ thống','SYSTEM',1,1),
 ('GSD_EDITOR',N'Nhân viên khai báo GSD','BUSINESS',0,20),
 ('IE_REVIEWER',N'Người xem xét IE','WORKFLOW',0,30),
 ('IE_APPROVER',N'Người duyệt IE','WORKFLOW',0,40),
 ('AUDITOR',N'Người kiểm tra nhật ký','SYSTEM',0,50)
)s(role_code,role_name,role_type_code,is_system_role,priority_no)
ON t.role_code=s.role_code
WHEN MATCHED THEN UPDATE SET role_name=s.role_name,role_type_code=s.role_type_code,is_system_role=s.is_system_role,priority_no=s.priority_no
WHEN NOT MATCHED THEN INSERT(role_code,role_name,role_type_code,is_system_role,priority_no,status_id)
VALUES(s.role_code,s.role_name,s.role_type_code,s.is_system_role,s.priority_no,0);
GO

/* 5. Cấp quyền mẫu */
DECLARE @admin INT=(SELECT id FROM auth.roles WHERE role_code='SYSTEM_ADMIN');
INSERT INTO auth.role_permissions(role_id,permission_id,scope_code,status_id)
SELECT @admin,p.id,'ALL',0 FROM auth.permissions p
WHERE NOT EXISTS(SELECT 1 FROM auth.role_permissions rp WHERE rp.role_id=@admin AND rp.permission_id=p.id AND rp.scope_code='ALL');

DECLARE @editor INT=(SELECT id FROM auth.roles WHERE role_code='GSD_EDITOR');
INSERT INTO auth.role_permissions(role_id,permission_id,scope_code,status_id)
SELECT @editor,p.id,
 CASE WHEN p.permission_code IN('GSD.ANALYSIS.VIEW','GSD.ANALYSIS.UPDATE','GSD.ANALYSIS.DELETE') THEN 'OWN' ELSE 'NONE' END,0
FROM auth.permissions p
WHERE p.permission_code IN('GSD.ANALYSIS.VIEW','GSD.ANALYSIS.CREATE','GSD.ANALYSIS.UPDATE','GSD.ANALYSIS.DELETE','GSD.ANALYSIS.SUBMIT','GSD.ANALYSIS.EXPORT')
AND NOT EXISTS(SELECT 1 FROM auth.role_permissions rp WHERE rp.role_id=@editor AND rp.permission_id=p.id);

DECLARE @reviewer INT=(SELECT id FROM auth.roles WHERE role_code='IE_REVIEWER');
INSERT INTO auth.role_permissions(role_id,permission_id,scope_code,status_id)
SELECT @reviewer,p.id,
 CASE WHEN p.permission_code='GSD.ANALYSIS.VIEW' THEN 'DEPARTMENT'
      WHEN p.permission_code IN('GSD.ANALYSIS.REVIEW','GSD.ANALYSIS.REJECT','GSD.ANALYSIS.RETURN') THEN 'ASSIGNED'
      ELSE 'NONE' END,0
FROM auth.permissions p
WHERE p.permission_code IN('GSD.ANALYSIS.VIEW','GSD.ANALYSIS.REVIEW','GSD.ANALYSIS.REJECT','GSD.ANALYSIS.RETURN','GSD.ANALYSIS.MONITOR')
AND NOT EXISTS(SELECT 1 FROM auth.role_permissions rp WHERE rp.role_id=@reviewer AND rp.permission_id=p.id);

DECLARE @approver INT=(SELECT id FROM auth.roles WHERE role_code='IE_APPROVER');
INSERT INTO auth.role_permissions(role_id,permission_id,scope_code,status_id)
SELECT @approver,p.id,
 CASE WHEN p.permission_code IN('GSD.ANALYSIS.VIEW','GSD.ANALYSIS.APPROVE','GSD.ANALYSIS.REJECT') THEN 'ASSIGNED' ELSE 'NONE' END,0
FROM auth.permissions p
WHERE p.permission_code IN('GSD.ANALYSIS.VIEW','GSD.ANALYSIS.APPROVE','GSD.ANALYSIS.REJECT','GSD.ANALYSIS.MONITOR')
AND NOT EXISTS(SELECT 1 FROM auth.role_permissions rp WHERE rp.role_id=@approver AND rp.permission_id=p.id);
GO

/* 6. Loại chứng từ */
MERGE workflow.document_types t
USING(VALUES
 ('GSD_ANALYSIS',N'Phân tích GSD','GSD.ANALYSIS','dbo.gsd_analysis_headers','id','analysis_no'),
 ('SEWING_PROCESS',N'Quy trình may','SEWING.PROCESS','dbo.sewing_process_headers','id','document_code'),
 ('OPERATION_CLUSTER',N'Kho cụm công đoạn','OPERATION_CLUSTER.MAIN','dbo.operation_cluster_headers','id','document_code')
)s(document_type_code,document_type_name,screen_code,business_table_name,business_id_column,business_no_column)
ON t.document_type_code=s.document_type_code
WHEN MATCHED THEN UPDATE SET document_type_name=s.document_type_name,screen_code=s.screen_code,business_table_name=s.business_table_name,business_id_column=s.business_id_column,business_no_column=s.business_no_column
WHEN NOT MATCHED THEN INSERT(document_type_code,document_type_name,screen_code,business_table_name,business_id_column,business_no_column,status_id)
VALUES(s.document_type_code,s.document_type_name,s.screen_code,s.business_table_name,s.business_id_column,s.business_no_column,0);
GO

/* 7. Workflow GSD version 1 */
IF NOT EXISTS(SELECT 1 FROM workflow.definitions WHERE workflow_code='GSD_APPROVAL' AND version_no=1)
INSERT INTO workflow.definitions(workflow_code,workflow_name,document_type_code,version_no,definition_status_code,effective_from)
VALUES('GSD_APPROVAL',N'Quy trình duyệt GSD','GSD_ANALYSIS',1,'ACTIVE',SYSDATETIME());
GO

DECLARE @wf INT=(SELECT id FROM workflow.definitions WHERE workflow_code='GSD_APPROVAL' AND version_no=1);

IF NOT EXISTS(SELECT 1 FROM workflow.steps WHERE workflow_definition_id=@wf AND step_code='REVIEW')
INSERT INTO workflow.steps(workflow_definition_id,step_code,step_name,step_order,step_type_code,required_permission_code,assignment_type_code,assignee_role_code,allow_reject,allow_return,allow_self_action,sla_hours)
VALUES(@wf,'REVIEW',N'Xem xét',10,'REVIEW','GSD.ANALYSIS.REVIEW','DEPARTMENT_ROLE','IE_REVIEWER',1,1,0,24);

IF NOT EXISTS(SELECT 1 FROM workflow.steps WHERE workflow_definition_id=@wf AND step_code='APPROVE')
INSERT INTO workflow.steps(workflow_definition_id,step_code,step_name,step_order,step_type_code,required_permission_code,assignment_type_code,assignee_role_code,allow_reject,allow_return,allow_self_action,sla_hours)
VALUES(@wf,'APPROVE',N'Duyệt',20,'APPROVE','GSD.ANALYSIS.APPROVE','ROLE','IE_APPROVER',1,1,0,24);

IF NOT EXISTS(SELECT 1 FROM workflow.steps WHERE workflow_definition_id=@wf AND step_code='MONITOR')
INSERT INTO workflow.steps(workflow_definition_id,step_code,step_name,step_order,step_type_code,required_permission_code,assignment_type_code,assignee_role_code,allow_reject,allow_return,allow_self_action,sla_hours)
VALUES(@wf,'MONITOR',N'Theo dõi sau duyệt',30,'MONITOR','GSD.ANALYSIS.MONITOR','ROLE','AUDITOR',0,0,1,NULL);
GO

/* 8. Transition */
DECLARE @wf INT=(SELECT id FROM workflow.definitions WHERE workflow_code='GSD_APPROVAL' AND version_no=1);
DECLARE @trans TABLE(from_step VARCHAR(100),action_code VARCHAR(50),to_step VARCHAR(100),target_status VARCHAR(30),priority_no INT);
INSERT INTO @trans VALUES
 ('REVIEW','REVIEW','APPROVE','WAITING_APPROVAL',10),
 ('REVIEW','RETURN',NULL,'RETURNED',20),
 ('REVIEW','REJECT',NULL,'REJECTED',30),
 ('APPROVE','APPROVE','MONITOR','APPROVED',10),
 ('APPROVE','RETURN','REVIEW','UNDER_REVIEW',20),
 ('APPROVE','REJECT',NULL,'REJECTED',30),
 ('MONITOR','MONITOR',NULL,'COMPLETED',10);

INSERT INTO workflow.transitions(workflow_definition_id,from_step_code,action_code,to_step_code,target_document_status_code,priority_no,status_id)
SELECT @wf,t.from_step,t.action_code,t.to_step,t.target_status,t.priority_no,0
FROM @trans t
WHERE NOT EXISTS(
 SELECT 1 FROM workflow.transitions x
 WHERE x.workflow_definition_id=@wf AND x.from_step_code=t.from_step AND x.action_code=t.action_code AND ISNULL(x.to_step_code,'')=ISNULL(t.to_step,'')
);
GO

/*
  9. User phải được tạo từ backend để password_hash là hash thật.

  Ví dụ sau khi backend tạo employee/user:

  DECLARE @user_id BIGINT = ...;
  DECLARE @role_id INT=(SELECT id FROM auth.roles WHERE role_code='GSD_EDITOR');
  INSERT INTO auth.user_roles(user_id,role_id,department_code,status_id,assigned_by_user_id)
  VALUES(@user_id,@role_id,'IE',0,@admin_user_id);
*/
