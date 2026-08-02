/*
  SQL Server - Authorization / Data Scope / Workflow / Audit
  - Không dùng FOREIGN KEY
  - Bảng tạo mới qua frontend dùng IDENTITY
  - Liên kết logic qua *_id và *_code
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name='hr') EXEC('CREATE SCHEMA hr');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name='app') EXEC('CREATE SCHEMA app');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name='auth') EXEC('CREATE SCHEMA auth');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name='workflow') EXEC('CREATE SCHEMA workflow');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name='audit') EXEC('CREATE SCHEMA audit');
GO

/* ========================= HR ========================= */
IF OBJECT_ID('hr.employees','U') IS NULL
CREATE TABLE hr.employees(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  employee_code VARCHAR(32) NOT NULL,
  full_name NVARCHAR(200) NOT NULL,
  preferred_name NVARCHAR(100) NULL,
  department_code VARCHAR(32) NULL,
  position_code VARCHAR(50) NULL,
  job_title NVARCHAR(150) NULL,
  manager_employee_id BIGINT NULL,
  work_email VARCHAR(255) NULL,
  personal_email VARCHAR(255) NULL,
  phone_number VARCHAR(30) NULL,
  employment_type_code VARCHAR(30) NULL,
  hire_date DATE NULL,
  probation_end_date DATE NULL,
  termination_date DATE NULL,
  status_id TINYINT NOT NULL DEFAULT 0,
  extra_data_json NVARCHAR(MAX) NULL CHECK(extra_data_json IS NULL OR ISJSON(extra_data_json)=1),
  created_by_user_id BIGINT NULL,
  updated_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
GO
CREATE UNIQUE INDEX UX_hr_employees_code ON hr.employees(employee_code);
CREATE UNIQUE INDEX UX_hr_employees_work_email ON hr.employees(work_email) WHERE work_email IS NOT NULL;
CREATE INDEX IX_hr_employees_department ON hr.employees(department_code,status_id);
CREATE INDEX IX_hr_employees_manager ON hr.employees(manager_employee_id);
GO

/* ========================= AUTH USER ========================= */
IF OBJECT_ID('auth.users','U') IS NULL
CREATE TABLE auth.users(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  employee_id BIGINT NULL,
  username VARCHAR(100) NOT NULL,
  login_email VARCHAR(255) NULL,
  password_hash NVARCHAR(500) NOT NULL,
  password_algo VARCHAR(30) NOT NULL DEFAULT 'ARGON2ID',
  must_change_password BIT NOT NULL DEFAULT 1,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until DATETIME2 NULL,
  last_login_at DATETIME2 NULL,
  password_changed_at DATETIME2 NULL,
  token_version INT NOT NULL DEFAULT 1,
  is_system_account BIT NOT NULL DEFAULT 0,
  status_id TINYINT NOT NULL DEFAULT 0,
  extra_data_json NVARCHAR(MAX) NULL CHECK(extra_data_json IS NULL OR ISJSON(extra_data_json)=1),
  created_by_user_id BIGINT NULL,
  updated_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
GO
CREATE UNIQUE INDEX UX_auth_users_username ON auth.users(username);
CREATE UNIQUE INDEX UX_auth_users_login_email ON auth.users(login_email) WHERE login_email IS NOT NULL;
CREATE INDEX IX_auth_users_employee ON auth.users(employee_id,status_id);
GO

IF OBJECT_ID('auth.password_history','U') IS NULL
CREATE TABLE auth.password_history(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  password_hash NVARCHAR(500) NOT NULL,
  password_algo VARCHAR(30) NOT NULL,
  changed_by_user_id BIGINT NULL,
  changed_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE INDEX IX_auth_password_history_user ON auth.password_history(user_id,changed_at DESC);
GO

IF OBJECT_ID('auth.sessions','U') IS NULL
CREATE TABLE auth.sessions(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  session_key UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
  user_id BIGINT NOT NULL,
  refresh_token_hash NVARCHAR(500) NOT NULL,
  device_id VARCHAR(200) NULL,
  ip_address VARCHAR(64) NULL,
  user_agent NVARCHAR(1000) NULL,
  expires_at DATETIME2 NOT NULL,
  last_used_at DATETIME2 NULL,
  revoked_at DATETIME2 NULL,
  revoked_by_user_id BIGINT NULL,
  revoke_reason NVARCHAR(500) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE UNIQUE INDEX UX_auth_sessions_key ON auth.sessions(session_key);
CREATE INDEX IX_auth_sessions_user ON auth.sessions(user_id,expires_at,revoked_at);
GO

/* ========================= APP CATALOG ========================= */
IF OBJECT_ID('app.modules','U') IS NULL
CREATE TABLE app.modules(
  id INT IDENTITY(1,1) PRIMARY KEY,
  module_code VARCHAR(50) NOT NULL,
  module_name NVARCHAR(150) NOT NULL,
  description NVARCHAR(500) NULL,
  route_prefix NVARCHAR(200) NULL,
  icon_key VARCHAR(100) NULL,
  sort_order INT NOT NULL DEFAULT 1,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_by_user_id BIGINT NULL,
  updated_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_app_modules_code ON app.modules(module_code);
GO

IF OBJECT_ID('app.screens','U') IS NULL
CREATE TABLE app.screens(
  id INT IDENTITY(1,1) PRIMARY KEY,
  module_id INT NOT NULL,
  parent_screen_id INT NULL,
  screen_code VARCHAR(100) NOT NULL,
  screen_name NVARCHAR(200) NOT NULL,
  description NVARCHAR(500) NULL,
  route_path NVARCHAR(300) NULL,
  component_key VARCHAR(150) NULL,
  screen_type_code VARCHAR(30) NOT NULL DEFAULT 'PAGE' CHECK(screen_type_code IN('PAGE','GROUP','TAB','REPORT','DASHBOARD','SYSTEM')),
  icon_key VARCHAR(100) NULL,
  is_menu BIT NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 1,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_by_user_id BIGINT NULL,
  updated_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_app_screens_code ON app.screens(screen_code);
CREATE INDEX IX_app_screens_menu ON app.screens(module_id,parent_screen_id,status_id,is_menu,sort_order);
GO

IF OBJECT_ID('app.actions','U') IS NULL
CREATE TABLE app.actions(
  id INT IDENTITY(1,1) PRIMARY KEY,
  action_code VARCHAR(50) NOT NULL,
  action_name NVARCHAR(150) NOT NULL,
  action_group_code VARCHAR(30) NOT NULL DEFAULT 'DATA' CHECK(action_group_code IN('READ','DATA','WORKFLOW','EXPORT','SYSTEM')),
  is_workflow_action BIT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 1,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE UNIQUE INDEX UX_app_actions_code ON app.actions(action_code);
GO

/* ========================= ROLE / PERMISSION / SCOPE ========================= */
IF OBJECT_ID('auth.scope_types','U') IS NULL
CREATE TABLE auth.scope_types(
  id INT IDENTITY(1,1) PRIMARY KEY,
  scope_code VARCHAR(30) NOT NULL,
  scope_name NVARCHAR(150) NOT NULL,
  description NVARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 1,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE UNIQUE INDEX UX_auth_scope_types_code ON auth.scope_types(scope_code);
GO

IF OBJECT_ID('auth.permissions','U') IS NULL
CREATE TABLE auth.permissions(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  screen_id INT NOT NULL,
  action_id INT NOT NULL,
  permission_code VARCHAR(200) NOT NULL,
  permission_name NVARCHAR(250) NOT NULL,
  is_sensitive BIT NOT NULL DEFAULT 0,
  require_reason BIT NOT NULL DEFAULT 0,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_by_user_id BIGINT NULL,
  updated_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_auth_permissions_code ON auth.permissions(permission_code);
CREATE UNIQUE INDEX UX_auth_permissions_screen_action ON auth.permissions(screen_id,action_id);
GO

IF OBJECT_ID('auth.roles','U') IS NULL
CREATE TABLE auth.roles(
  id INT IDENTITY(1,1) PRIMARY KEY,
  role_code VARCHAR(100) NOT NULL,
  role_name NVARCHAR(200) NOT NULL,
  description NVARCHAR(1000) NULL,
  role_type_code VARCHAR(30) NOT NULL DEFAULT 'BUSINESS' CHECK(role_type_code IN('SYSTEM','BUSINESS','WORKFLOW','TEMPORARY')),
  priority_no INT NOT NULL DEFAULT 100,
  is_system_role BIT NOT NULL DEFAULT 0,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_by_user_id BIGINT NULL,
  updated_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_auth_roles_code ON auth.roles(role_code);
GO

IF OBJECT_ID('auth.user_roles','U') IS NULL
CREATE TABLE auth.user_roles(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role_id INT NOT NULL,
  department_code VARCHAR(32) NULL,
  valid_from DATETIME2 NULL,
  valid_to DATETIME2 NULL,
  status_id TINYINT NOT NULL DEFAULT 0,
  assigned_by_user_id BIGINT NULL,
  assigned_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  note NVARCHAR(500) NULL,
  row_version ROWVERSION
);
CREATE INDEX IX_auth_user_roles_user ON auth.user_roles(user_id,status_id,valid_from,valid_to);
CREATE INDEX IX_auth_user_roles_role ON auth.user_roles(role_id,status_id);
GO

IF OBJECT_ID('auth.role_permissions','U') IS NULL
CREATE TABLE auth.role_permissions(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id BIGINT NOT NULL,
  scope_code VARCHAR(30) NOT NULL DEFAULT 'NONE',
  scope_config_json NVARCHAR(MAX) NULL CHECK(scope_config_json IS NULL OR ISJSON(scope_config_json)=1),
  status_id TINYINT NOT NULL DEFAULT 0,
  granted_by_user_id BIGINT NULL,
  granted_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_auth_role_permissions ON auth.role_permissions(role_id,permission_id,scope_code);
CREATE INDEX IX_auth_role_permissions_permission ON auth.role_permissions(permission_id,status_id);
GO

IF OBJECT_ID('auth.user_permission_overrides','U') IS NULL
CREATE TABLE auth.user_permission_overrides(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  effect_code VARCHAR(10) NOT NULL CHECK(effect_code IN('ALLOW','DENY')),
  scope_code VARCHAR(30) NOT NULL DEFAULT 'NONE',
  scope_config_json NVARCHAR(MAX) NULL CHECK(scope_config_json IS NULL OR ISJSON(scope_config_json)=1),
  valid_from DATETIME2 NULL,
  valid_to DATETIME2 NULL,
  status_id TINYINT NOT NULL DEFAULT 0,
  granted_by_user_id BIGINT NULL,
  granted_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  note NVARCHAR(500) NULL,
  row_version ROWVERSION
);
CREATE INDEX IX_auth_user_overrides_user ON auth.user_permission_overrides(user_id,permission_id,status_id,valid_from,valid_to);
GO

IF OBJECT_ID('auth.permission_scope_values','U') IS NULL
CREATE TABLE auth.permission_scope_values(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  source_type_code VARCHAR(30) NOT NULL CHECK(source_type_code IN('ROLE_PERMISSION','USER_OVERRIDE')),
  source_id BIGINT NOT NULL,
  value_type_code VARCHAR(30) NOT NULL CHECK(value_type_code IN('DEPARTMENT','USER','EMPLOYEE','DOCUMENT_TYPE','WORKFLOW_STATUS','CUSTOM')),
  value_code NVARCHAR(200) NOT NULL,
  status_id TINYINT NOT NULL DEFAULT 0,
  created_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE INDEX IX_auth_scope_values_source ON auth.permission_scope_values(source_type_code,source_id,status_id);
GO

/* Field-level access: dùng khi cần ẩn/mask giá, lương, dữ liệu nhạy cảm */
IF OBJECT_ID('app.screen_fields','U') IS NULL
CREATE TABLE app.screen_fields(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  screen_id INT NOT NULL,
  field_code VARCHAR(150) NOT NULL,
  field_name NVARCHAR(200) NOT NULL,
  data_path NVARCHAR(300) NULL,
  is_sensitive BIT NOT NULL DEFAULT 0,
  default_access_code VARCHAR(20) NOT NULL DEFAULT 'VIEW' CHECK(default_access_code IN('VIEW','EDIT','MASK','HIDE')),
  default_mask_type VARCHAR(30) NULL,
  sort_order INT NOT NULL DEFAULT 1,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_app_screen_fields ON app.screen_fields(screen_id,field_code);
GO

IF OBJECT_ID('auth.role_field_access','U') IS NULL
CREATE TABLE auth.role_field_access(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  role_id INT NOT NULL,
  screen_field_id BIGINT NOT NULL,
  access_code VARCHAR(20) NOT NULL CHECK(access_code IN('VIEW','EDIT','MASK','HIDE')),
  mask_type VARCHAR(30) NULL,
  status_id TINYINT NOT NULL DEFAULT 0,
  granted_by_user_id BIGINT NULL,
  granted_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE UNIQUE INDEX UX_auth_role_field_access ON auth.role_field_access(role_id,screen_field_id);
GO

/* ========================= WORKFLOW ========================= */
IF OBJECT_ID('workflow.document_types','U') IS NULL
CREATE TABLE workflow.document_types(
  id INT IDENTITY(1,1) PRIMARY KEY,
  document_type_code VARCHAR(100) NOT NULL,
  document_type_name NVARCHAR(200) NOT NULL,
  screen_code VARCHAR(100) NULL,
  business_table_name NVARCHAR(300) NOT NULL,
  business_id_column VARCHAR(100) NOT NULL DEFAULT 'id',
  business_no_column VARCHAR(100) NULL,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_workflow_document_types ON workflow.document_types(document_type_code);
GO

IF OBJECT_ID('workflow.documents','U') IS NULL
CREATE TABLE workflow.documents(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  document_type_code VARCHAR(100) NOT NULL,
  business_id BIGINT NOT NULL,
  document_no VARCHAR(100) NULL,
  document_title NVARCHAR(500) NULL,
  created_by_user_id BIGINT NOT NULL,
  owner_user_id BIGINT NULL,
  owner_employee_id BIGINT NULL,
  owner_department_code VARCHAR(32) NULL,
  workflow_status_code VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  current_step_code VARCHAR(100) NULL,
  current_assignee_user_id BIGINT NULL,
  current_assignee_role_code VARCHAR(100) NULL,
  submitted_at DATETIME2 NULL,
  completed_at DATETIME2 NULL,
  cancelled_at DATETIME2 NULL,
  extra_data_json NVARCHAR(MAX) NULL CHECK(extra_data_json IS NULL OR ISJSON(extra_data_json)=1),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_workflow_documents_business ON workflow.documents(document_type_code,business_id);
CREATE INDEX IX_workflow_documents_owner ON workflow.documents(owner_department_code,owner_user_id,workflow_status_code);
CREATE INDEX IX_workflow_documents_assignee ON workflow.documents(current_assignee_user_id,workflow_status_code);
GO

IF OBJECT_ID('workflow.definitions','U') IS NULL
CREATE TABLE workflow.definitions(
  id INT IDENTITY(1,1) PRIMARY KEY,
  workflow_code VARCHAR(100) NOT NULL,
  workflow_name NVARCHAR(200) NOT NULL,
  document_type_code VARCHAR(100) NOT NULL,
  version_no INT NOT NULL DEFAULT 1,
  definition_status_code VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK(definition_status_code IN('DRAFT','ACTIVE','INACTIVE','ARCHIVED')),
  effective_from DATETIME2 NULL,
  effective_to DATETIME2 NULL,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_by_user_id BIGINT NULL,
  updated_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_workflow_definitions ON workflow.definitions(workflow_code,version_no);
GO

IF OBJECT_ID('workflow.steps','U') IS NULL
CREATE TABLE workflow.steps(
  id INT IDENTITY(1,1) PRIMARY KEY,
  workflow_definition_id INT NOT NULL,
  step_code VARCHAR(100) NOT NULL,
  step_name NVARCHAR(200) NOT NULL,
  step_order INT NOT NULL,
  step_type_code VARCHAR(30) NOT NULL CHECK(step_type_code IN('START','REVIEW','APPROVE','MONITOR','NOTIFY','END')),
  required_permission_code VARCHAR(200) NULL,
  assignment_type_code VARCHAR(50) NOT NULL DEFAULT 'ROLE' CHECK(assignment_type_code IN('USER','ROLE','DEPARTMENT_ROLE','CREATOR_MANAGER','OWNER_MANAGER','PREVIOUS_ACTOR','CUSTOM')),
  assignee_user_id BIGINT NULL,
  assignee_role_code VARCHAR(100) NULL,
  assignee_department_code VARCHAR(32) NULL,
  minimum_approvals INT NOT NULL DEFAULT 1,
  allow_reject BIT NOT NULL DEFAULT 1,
  allow_return BIT NOT NULL DEFAULT 1,
  allow_delegate BIT NOT NULL DEFAULT 0,
  allow_self_action BIT NOT NULL DEFAULT 0,
  sla_hours INT NULL,
  status_id TINYINT NOT NULL DEFAULT 0,
  config_json NVARCHAR(MAX) NULL CHECK(config_json IS NULL OR ISJSON(config_json)=1),
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE UNIQUE INDEX UX_workflow_steps ON workflow.steps(workflow_definition_id,step_code);
GO

IF OBJECT_ID('workflow.transitions','U') IS NULL
CREATE TABLE workflow.transitions(
  id INT IDENTITY(1,1) PRIMARY KEY,
  workflow_definition_id INT NOT NULL,
  from_step_code VARCHAR(100) NOT NULL,
  action_code VARCHAR(50) NOT NULL,
  to_step_code VARCHAR(100) NULL,
  target_document_status_code VARCHAR(30) NOT NULL,
  priority_no INT NOT NULL DEFAULT 100,
  condition_json NVARCHAR(MAX) NULL CHECK(condition_json IS NULL OR ISJSON(condition_json)=1),
  status_id TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE INDEX IX_workflow_transitions ON workflow.transitions(workflow_definition_id,from_step_code,action_code,status_id,priority_no);
GO

IF OBJECT_ID('workflow.instances','U') IS NULL
CREATE TABLE workflow.instances(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  workflow_document_id BIGINT NOT NULL,
  workflow_definition_id INT NOT NULL,
  definition_version_no INT NOT NULL,
  current_step_id INT NULL,
  current_step_code VARCHAR(100) NULL,
  instance_status_code VARCHAR(30) NOT NULL DEFAULT 'RUNNING' CHECK(instance_status_code IN('RUNNING','COMPLETED','REJECTED','CANCELLED','SUSPENDED')),
  started_by_user_id BIGINT NOT NULL,
  started_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  completed_at DATETIME2 NULL,
  cancelled_at DATETIME2 NULL,
  last_action_code VARCHAR(50) NULL,
  extra_data_json NVARCHAR(MAX) NULL CHECK(extra_data_json IS NULL OR ISJSON(extra_data_json)=1),
  updated_at DATETIME2 NULL,
  row_version ROWVERSION
);
CREATE INDEX IX_workflow_instances_document ON workflow.instances(workflow_document_id,instance_status_code,started_at DESC);
GO

IF OBJECT_ID('workflow.tasks','U') IS NULL
CREATE TABLE workflow.tasks(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  workflow_instance_id BIGINT NOT NULL,
  workflow_document_id BIGINT NOT NULL,
  workflow_step_id INT NOT NULL,
  task_code VARCHAR(100) NULL,
  assignee_type_code VARCHAR(30) NOT NULL CHECK(assignee_type_code IN('USER','ROLE','DEPARTMENT_ROLE')),
  assignee_user_id BIGINT NULL,
  assignee_role_code VARCHAR(100) NULL,
  assignee_department_code VARCHAR(32) NULL,
  claimed_by_user_id BIGINT NULL,
  task_status_code VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK(task_status_code IN('PENDING','CLAIMED','COMPLETED','CANCELLED','EXPIRED','SKIPPED')),
  result_action_code VARCHAR(50) NULL,
  action_comment NVARCHAR(2000) NULL,
  assigned_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  opened_at DATETIME2 NULL,
  claimed_at DATETIME2 NULL,
  due_at DATETIME2 NULL,
  completed_at DATETIME2 NULL,
  completed_by_user_id BIGINT NULL,
  extra_data_json NVARCHAR(MAX) NULL CHECK(extra_data_json IS NULL OR ISJSON(extra_data_json)=1),
  row_version ROWVERSION
);
CREATE INDEX IX_workflow_tasks_user ON workflow.tasks(assignee_user_id,task_status_code,due_at);
CREATE INDEX IX_workflow_tasks_role ON workflow.tasks(assignee_role_code,assignee_department_code,task_status_code,due_at);
CREATE INDEX IX_workflow_tasks_document ON workflow.tasks(workflow_document_id,task_status_code);
GO

IF OBJECT_ID('workflow.watchers','U') IS NULL
CREATE TABLE workflow.watchers(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  workflow_document_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  watcher_type_code VARCHAR(30) NOT NULL DEFAULT 'USER',
  receive_notification BIT NOT NULL DEFAULT 1,
  status_id TINYINT NOT NULL DEFAULT 0,
  created_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE UNIQUE INDEX UX_workflow_watchers ON workflow.watchers(workflow_document_id,user_id);
GO

IF OBJECT_ID('workflow.delegations','U') IS NULL
CREATE TABLE workflow.delegations(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  from_user_id BIGINT NOT NULL,
  to_user_id BIGINT NOT NULL,
  role_code VARCHAR(100) NULL,
  document_type_code VARCHAR(100) NULL,
  valid_from DATETIME2 NOT NULL,
  valid_to DATETIME2 NOT NULL,
  status_id TINYINT NOT NULL DEFAULT 0,
  reason NVARCHAR(500) NULL,
  created_by_user_id BIGINT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  row_version ROWVERSION
);
CREATE INDEX IX_workflow_delegations ON workflow.delegations(from_user_id,status_id,valid_from,valid_to);
GO

IF OBJECT_ID('workflow.action_logs','U') IS NULL
CREATE TABLE workflow.action_logs(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  workflow_instance_id BIGINT NOT NULL,
  workflow_document_id BIGINT NOT NULL,
  workflow_task_id BIGINT NULL,
  actor_user_id BIGINT NOT NULL,
  action_code VARCHAR(50) NOT NULL,
  from_step_code VARCHAR(100) NULL,
  to_step_code VARCHAR(100) NULL,
  from_status_code VARCHAR(30) NULL,
  to_status_code VARCHAR(30) NULL,
  comment NVARCHAR(2000) NULL,
  action_data_json NVARCHAR(MAX) NULL CHECK(action_data_json IS NULL OR ISJSON(action_data_json)=1),
  request_id UNIQUEIDENTIFIER NULL,
  ip_address VARCHAR(64) NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE INDEX IX_workflow_action_logs_document ON workflow.action_logs(workflow_document_id,created_at DESC);
GO

/* ========================= AUDIT ========================= */
IF OBJECT_ID('audit.application_logs','U') IS NULL
CREATE TABLE audit.application_logs(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  request_id UNIQUEIDENTIFIER NULL,
  occurred_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  user_id BIGINT NULL,
  employee_id BIGINT NULL,
  username VARCHAR(100) NULL,
  screen_code VARCHAR(100) NULL,
  permission_code VARCHAR(200) NULL,
  action_code VARCHAR(50) NOT NULL,
  entity_type_code VARCHAR(100) NULL,
  entity_id NVARCHAR(100) NULL,
  document_type_code VARCHAR(100) NULL,
  document_no VARCHAR(100) NULL,
  http_method VARCHAR(10) NULL,
  endpoint NVARCHAR(500) NULL,
  success BIT NOT NULL,
  http_status INT NULL,
  duration_ms INT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent NVARCHAR(1000) NULL,
  message NVARCHAR(2000) NULL,
  metadata_json NVARCHAR(MAX) NULL CHECK(metadata_json IS NULL OR ISJSON(metadata_json)=1)
);
CREATE INDEX IX_audit_application_user ON audit.application_logs(user_id,occurred_at DESC);
CREATE INDEX IX_audit_application_entity ON audit.application_logs(entity_type_code,entity_id,occurred_at DESC);
GO

IF OBJECT_ID('audit.data_change_logs','U') IS NULL
CREATE TABLE audit.data_change_logs(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  request_id UNIQUEIDENTIFIER NULL,
  occurred_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  user_id BIGINT NULL,
  entity_type_code VARCHAR(100) NOT NULL,
  entity_id NVARCHAR(100) NOT NULL,
  action_code VARCHAR(20) NOT NULL CHECK(action_code IN('INSERT','UPDATE','DELETE','RESTORE')),
  before_json NVARCHAR(MAX) NULL CHECK(before_json IS NULL OR ISJSON(before_json)=1),
  after_json NVARCHAR(MAX) NULL CHECK(after_json IS NULL OR ISJSON(after_json)=1),
  changed_fields_json NVARCHAR(MAX) NULL CHECK(changed_fields_json IS NULL OR ISJSON(changed_fields_json)=1),
  reason NVARCHAR(1000) NULL
);
CREATE INDEX IX_audit_change_entity ON audit.data_change_logs(entity_type_code,entity_id,occurred_at DESC);
GO

IF OBJECT_ID('audit.login_logs','U') IS NULL
CREATE TABLE audit.login_logs(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id BIGINT NULL,
  username VARCHAR(100) NULL,
  session_key UNIQUEIDENTIFIER NULL,
  success BIT NOT NULL,
  failure_reason_code VARCHAR(50) NULL,
  failure_message NVARCHAR(500) NULL,
  ip_address VARCHAR(64) NULL,
  user_agent NVARCHAR(1000) NULL,
  occurred_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE INDEX IX_audit_login_username ON audit.login_logs(username,occurred_at DESC);
GO

IF OBJECT_ID('app.notifications','U') IS NULL
CREATE TABLE app.notifications(
  id BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  notification_type_code VARCHAR(50) NOT NULL,
  title NVARCHAR(300) NOT NULL,
  content NVARCHAR(MAX) NULL,
  related_entity_type VARCHAR(100) NULL,
  related_entity_id NVARCHAR(100) NULL,
  route_path NVARCHAR(500) NULL,
  is_read BIT NOT NULL DEFAULT 0,
  read_at DATETIME2 NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE INDEX IX_app_notifications_user ON app.notifications(user_id,is_read,created_at DESC);
GO

/* ========================= SEED ========================= */
MERGE app.actions t USING(VALUES
 ('VIEW',N'Xem','READ',0,1),('CREATE',N'Tạo mới','DATA',0,2),('UPDATE',N'Cập nhật','DATA',0,3),
 ('DELETE',N'Xóa','DATA',0,4),('SUBMIT',N'Trình duyệt','WORKFLOW',1,5),('REVIEW',N'Xem xét','WORKFLOW',1,6),
 ('APPROVE',N'Duyệt','WORKFLOW',1,7),('REJECT',N'Từ chối','WORKFLOW',1,8),('RETURN',N'Trả lại','WORKFLOW',1,9),
 ('CANCEL',N'Hủy','WORKFLOW',1,10),('MONITOR',N'Theo dõi','WORKFLOW',1,11),('ASSIGN',N'Phân công','WORKFLOW',1,12),
 ('EXPORT',N'Xuất dữ liệu','EXPORT',0,13),('PRINT',N'In','EXPORT',0,14),('MANAGE',N'Quản trị','SYSTEM',0,15),
 ('LOCK',N'Khóa tài khoản','SYSTEM',0,16),('RESET_PASSWORD',N'Đặt lại mật khẩu','SYSTEM',0,17)
)s(action_code,action_name,action_group_code,is_workflow_action,sort_order)
ON t.action_code=s.action_code
WHEN MATCHED THEN UPDATE SET action_name=s.action_name,action_group_code=s.action_group_code,is_workflow_action=s.is_workflow_action,sort_order=s.sort_order
WHEN NOT MATCHED THEN INSERT(action_code,action_name,action_group_code,is_workflow_action,sort_order,status_id)
VALUES(s.action_code,s.action_name,s.action_group_code,s.is_workflow_action,s.sort_order,0);
GO

MERGE auth.scope_types t USING(VALUES
 ('NONE',N'Không áp dụng phạm vi',1),('OWN',N'Do chính người dùng tạo',2),('DEPARTMENT',N'Phòng ban hiện tại',3),
 ('DEPARTMENT_TREE',N'Phòng ban và phòng ban con',4),('ASSIGNED',N'Được giao xử lý',5),
 ('CREATED_OR_ASSIGNED',N'Do mình tạo hoặc được giao',6),('ALL',N'Toàn bộ dữ liệu',7),('CUSTOM',N'Tùy chỉnh',8)
)s(scope_code,scope_name,sort_order)
ON t.scope_code=s.scope_code
WHEN MATCHED THEN UPDATE SET scope_name=s.scope_name,sort_order=s.sort_order
WHEN NOT MATCHED THEN INSERT(scope_code,scope_name,sort_order,status_id) VALUES(s.scope_code,s.scope_name,s.sort_order,0);
GO

/* ========================= VIEWS ========================= */
CREATE OR ALTER VIEW auth.v_user_effective_permissions AS
WITH active_roles AS(
 SELECT ur.user_id,ur.role_id,r.role_code,r.role_name
 FROM auth.user_roles ur
 JOIN auth.roles r ON r.id=ur.role_id
 JOIN auth.users u ON u.id=ur.user_id
 WHERE ur.status_id=0 AND r.status_id=0 AND u.status_id=0
 AND (ur.valid_from IS NULL OR ur.valid_from<=SYSDATETIME())
 AND (ur.valid_to IS NULL OR ur.valid_to>=SYSDATETIME())
), grants AS(
 SELECT ar.user_id,ar.role_id,ar.role_code,ar.role_name,rp.permission_id,rp.scope_code,rp.scope_config_json,'ROLE' source_type
 FROM active_roles ar JOIN auth.role_permissions rp ON rp.role_id=ar.role_id WHERE rp.status_id=0
 UNION ALL
 SELECT uo.user_id,NULL,NULL,NULL,uo.permission_id,uo.scope_code,uo.scope_config_json,'USER_OVERRIDE'
 FROM auth.user_permission_overrides uo JOIN auth.users u ON u.id=uo.user_id
 WHERE uo.status_id=0 AND u.status_id=0 AND uo.effect_code='ALLOW'
 AND (uo.valid_from IS NULL OR uo.valid_from<=SYSDATETIME())
 AND (uo.valid_to IS NULL OR uo.valid_to>=SYSDATETIME())
)
SELECT DISTINCT g.user_id,g.role_id,g.role_code,g.role_name,p.id permission_id,p.permission_code,p.permission_name,
 s.id screen_id,s.screen_code,s.screen_name,s.route_path,s.component_key,a.id action_id,a.action_code,a.action_name,
 g.scope_code,g.scope_config_json,g.source_type
FROM grants g
JOIN auth.permissions p ON p.id=g.permission_id
JOIN app.screens s ON s.id=p.screen_id
JOIN app.actions a ON a.id=p.action_id
WHERE p.status_id=0 AND s.status_id=0 AND a.status_id=0
AND NOT EXISTS(
 SELECT 1 FROM auth.user_permission_overrides d
 WHERE d.user_id=g.user_id AND d.permission_id=g.permission_id AND d.effect_code='DENY' AND d.status_id=0
 AND (d.valid_from IS NULL OR d.valid_from<=SYSDATETIME())
 AND (d.valid_to IS NULL OR d.valid_to>=SYSDATETIME())
);
GO

CREATE OR ALTER VIEW app.v_user_navigation AS
SELECT DISTINCT ep.user_id,m.id module_id,m.module_code,m.module_name,m.icon_key module_icon_key,m.sort_order module_sort_order,
 s.id screen_id,s.parent_screen_id,s.screen_code,s.screen_name,s.route_path,s.component_key,s.icon_key screen_icon_key,s.sort_order screen_sort_order,s.config_json
FROM auth.v_user_effective_permissions ep
JOIN app.screens s ON s.id=ep.screen_id
JOIN app.modules m ON m.id=s.module_id
WHERE ep.action_code='VIEW' AND s.is_menu=1 AND s.status_id=0 AND m.status_id=0;
GO

CREATE OR ALTER VIEW workflow.v_pending_tasks AS
SELECT t.id task_id,t.workflow_instance_id,t.workflow_document_id,t.workflow_step_id,t.assignee_type_code,t.assignee_user_id,
 t.assignee_role_code,t.assignee_department_code,t.task_status_code,t.assigned_at,t.due_at,
 d.document_type_code,d.business_id,d.document_no,d.document_title,d.owner_department_code,d.workflow_status_code,d.current_step_code,
 s.step_code,s.step_name,s.step_type_code,s.required_permission_code
FROM workflow.tasks t
JOIN workflow.documents d ON d.id=t.workflow_document_id
JOIN workflow.steps s ON s.id=t.workflow_step_id
WHERE t.task_status_code IN('PENDING','CLAIMED');
GO

/* ========================= ALTER BẢNG HIỆN CÓ ========================= */
IF OBJECT_ID('dbo.departments_test','U') IS NOT NULL
BEGIN
 IF COL_LENGTH('dbo.departments_test','created_by_user_id') IS NULL ALTER TABLE dbo.departments_test ADD created_by_user_id BIGINT NULL;
 IF COL_LENGTH('dbo.departments_test','updated_by_user_id') IS NULL ALTER TABLE dbo.departments_test ADD updated_by_user_id BIGINT NULL;
 IF COL_LENGTH('dbo.departments_test','created_at') IS NULL ALTER TABLE dbo.departments_test ADD created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME();
 IF COL_LENGTH('dbo.departments_test','updated_at') IS NULL ALTER TABLE dbo.departments_test ADD updated_at DATETIME2 NULL;
 IF COL_LENGTH('dbo.departments_test','row_version') IS NULL ALTER TABLE dbo.departments_test ADD row_version ROWVERSION;
END;
GO

DECLARE @tables TABLE(schema_name SYSNAME,table_name SYSNAME);
INSERT INTO @tables VALUES('dbo','gsd_analysis_headers'),('dbo','sewing_process_headers'),('dbo','operation_cluster_headers');
DECLARE @s SYSNAME,@t SYSNAME,@f NVARCHAR(500),@q NVARCHAR(MAX);
DECLARE c CURSOR LOCAL FAST_FORWARD FOR SELECT schema_name,table_name FROM @tables;
OPEN c; FETCH NEXT FROM c INTO @s,@t;
WHILE @@FETCH_STATUS=0
BEGIN
 SET @f=QUOTENAME(@s)+'.'+QUOTENAME(@t);
 IF OBJECT_ID(@s+'.'+@t,'U') IS NOT NULL
 BEGIN
  SET @q='';
  IF COL_LENGTH(@s+'.'+@t,'created_by_user_id') IS NULL SET @q+='ALTER TABLE '+@f+' ADD created_by_user_id BIGINT NULL;';
  IF COL_LENGTH(@s+'.'+@t,'updated_by_user_id') IS NULL SET @q+='ALTER TABLE '+@f+' ADD updated_by_user_id BIGINT NULL;';
  IF COL_LENGTH(@s+'.'+@t,'owner_user_id') IS NULL SET @q+='ALTER TABLE '+@f+' ADD owner_user_id BIGINT NULL;';
  IF COL_LENGTH(@s+'.'+@t,'owner_employee_id') IS NULL SET @q+='ALTER TABLE '+@f+' ADD owner_employee_id BIGINT NULL;';
  IF COL_LENGTH(@s+'.'+@t,'owner_department_code') IS NULL SET @q+='ALTER TABLE '+@f+' ADD owner_department_code VARCHAR(32) NULL;';
  IF COL_LENGTH(@s+'.'+@t,'workflow_document_id') IS NULL SET @q+='ALTER TABLE '+@f+' ADD workflow_document_id BIGINT NULL;';
  IF COL_LENGTH(@s+'.'+@t,'workflow_status_code') IS NULL SET @q+='ALTER TABLE '+@f+' ADD workflow_status_code VARCHAR(30) NOT NULL DEFAULT ''DRAFT'';';
  IF COL_LENGTH(@s+'.'+@t,'current_workflow_step_code') IS NULL SET @q+='ALTER TABLE '+@f+' ADD current_workflow_step_code VARCHAR(100) NULL;';
  IF COL_LENGTH(@s+'.'+@t,'current_assignee_user_id') IS NULL SET @q+='ALTER TABLE '+@f+' ADD current_assignee_user_id BIGINT NULL;';
  IF COL_LENGTH(@s+'.'+@t,'is_deleted') IS NULL SET @q+='ALTER TABLE '+@f+' ADD is_deleted BIT NOT NULL DEFAULT 0;';
  IF COL_LENGTH(@s+'.'+@t,'deleted_by_user_id') IS NULL SET @q+='ALTER TABLE '+@f+' ADD deleted_by_user_id BIGINT NULL;';
  IF COL_LENGTH(@s+'.'+@t,'deleted_at') IS NULL SET @q+='ALTER TABLE '+@f+' ADD deleted_at DATETIME2 NULL;';
  IF COL_LENGTH(@s+'.'+@t,'row_version') IS NULL SET @q+='ALTER TABLE '+@f+' ADD row_version ROWVERSION;';
  IF LEN(@q)>0 EXEC sp_executesql @q;
 END;
 FETCH NEXT FROM c INTO @s,@t;
END
CLOSE c; DEALLOCATE c;
GO

/* ========================= ORPHAN CHECK ========================= */
-- Do không dùng FOREIGN KEY, chạy định kỳ bằng SQL Agent hoặc job backend.
SELECT u.id user_id,u.username,u.employee_id
FROM auth.users u LEFT JOIN hr.employees e ON e.id=u.employee_id
WHERE u.employee_id IS NOT NULL AND e.id IS NULL;

SELECT ur.id,ur.user_id,ur.role_id
FROM auth.user_roles ur
LEFT JOIN auth.users u ON u.id=ur.user_id
LEFT JOIN auth.roles r ON r.id=ur.role_id
WHERE u.id IS NULL OR r.id IS NULL;

SELECT rp.id,rp.role_id,rp.permission_id
FROM auth.role_permissions rp
LEFT JOIN auth.roles r ON r.id=rp.role_id
LEFT JOIN auth.permissions p ON p.id=rp.permission_id
WHERE r.id IS NULL OR p.id IS NULL;
GO
