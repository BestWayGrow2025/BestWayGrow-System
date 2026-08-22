KB_001 — admin_activity_audit_controller.js

MODULE: ADMIN KB: KB_001 FILE TYPE: JavaScript Controller PRIMARY ROLE: Admin Activity Audit Controller

FUNCTION 10 named functions + 1 anonymous DOMContentLoaded callback

FUNCTION NAME initAdminActivityAudit() initAdminAuditPage() redirectLogin() authenticateAdminAudit() bindAdminAuditEvents() goAdminDashboard() getAdminAuditRoleClass() loadAdminActivityLogs() applyAdminAuditFilter() clearAdminActivityLogs()

FUNCTION LOCATION All named functions are in KB_001

FUNCTION ROLE Page initialization, authentication, event binding, navigation, role display, log loading, filtering, clearing

FUNCTION OWNER KB_001

FUNCTION CALLER DOMContentLoaded → initAdminActivityAudit() Internal functions call related functions within KB_001

FUNCTION CALLEE initAdminActivityAudit() → initAdminAuditPage() → authenticateAdminAudit() → bindAdminAuditEvents() → loadAdminActivityLogs()

DUPLICATE DATA Not determined in FIRST DOCUMENTS phase

FUNCTION EXPORT window.initAdminActivityAudit window.loadAdminActivityLogs window.applyAdminAuditFilter window.clearAdminActivityLogs

RULE Admin audit page requires authenticated active admin access

RULE LOCATION authenticateAdminAudit()

AUTHORITY Authentication/session authority is externally referenced

AUTHORITY LOCATION getSession() getCurrentUser() hasRole() destroySession()

DEPENDENCY initCoreSystem() getSession() getCurrentUser() hasRole() destroySession() getActivityLogs() logActivity() filterLogsAdvanced() clearActivityLogs()

DEPENDENCY OWNER To be located from repository documentation / related actual files

DEPENDENCY DIRECTION KB_001 → Core/session/activity functions

FILE ROLE Admin audit controller

MODULE ADMIN

MODULE RELATION Admin activity audit controller ↔ admin activity audit dashboard

CROSS-MODULE RELATION Core initialization and session functions referenced

FLOW DOMContentLoaded → initAdminActivityAudit() → initAdminAuditPage() → authenticateAdminAudit() → bindAdminAuditEvents() → loadAdminActivityLogs()

ENTRY POINT DOMContentLoaded

EXIT / REDIRECT redirectLogin() → admin_auth.html

EXECUTION SEQUENCE Page load → initialization → authentication → event binding → log loading

STATE adminAuditSession

STATE adminAuditUser

STATE MUTATION adminAuditSession = getSession() adminAuditUser = getCurrentUser()

DATA Activity log records

DATA FIELDS role userId action time

DATA SOURCE getActivityLogs()

DATA FILTER userId role keyword

DATA FILTER SOURCE filterLogsAdvanced()

DATA CLEAR clearActivityLogs()

STORAGE No direct storage API in KB_001

EVENT DOMContentLoaded

EVENT HANDLERS backBtn refreshBtn applyBtn clearBtn

EVENT ACTIONS backBtn → goAdminDashboard() refreshBtn → loadAdminActivityLogs() applyBtn → applyAdminAuditFilter() clearBtn → clearAdminActivityLogs()

LOCK No explicit lock in KB_001

SECURITY Session existence and active-account checks

AUTHENTICATION getSession() getCurrentUser()

AUTHORIZATION hasRole("admin")

ACCOUNT STATUS accountStatus / status

VALIDATION Session, user, role, and active-status validation

ERROR HANDLING try/catch in initAdminActivityAudit()

FAILURE PATH redirectLogin()

SESSION DESTRUCTION destroySession()

NAVIGATION admin_auth.html admin_dashboard.html

UI DOM TARGETS backBtn refreshBtn applyBtn clearBtn logs filterUser filterRole filterKeyword

UI OUTPUT Activity logs rendered into #logs

ROLE DISPLAY getAdminAuditRoleClass()

ROLE VALUES ADMIN SYSTEM_ADMIN ERROR default ""

LOG ORDER logs.slice().reverse()

LOG VIEW ACTION logActivity( adminAuditUser.userId, "ADMIN", "Viewed activity logs" )

FILTER ACTION filterLogsAdvanced({ userId, role, keyword })

CLEAR ACTION clearActivityLogs()

CONFIRMATION confirm("Delete all activity logs?")

ALERT alert("Logs cleared")

GLOBAL ACCESS window.initAdminActivityAudit window.loadAdminActivityLogs window.applyAdminAuditFilter window.clearAdminActivityLogs

RELATED FILES / REFERENCES admin_activity_audit_dashboard.html admin_auth.html admin_dashboard.html External function files to be located: initCoreSystem() getSession() getCurrentUser() hasRole() destroySession() getActivityLogs() logActivity() filterLogsAdvanced() clearActivityLogs()

STATUS FIRST DOCUMENTS DATA PLACEMENT: RECORDED PROBLEM/SOLUTION: NOT ANALYZED

FUNCTION REGISTER

F001 → initAdminActivityAudit() → Controller initialization → KB_001 F002 → initAdminAuditPage() → Core initialization trigger → KB_001 F003 → redirectLogin() → Session destruction + login redirect → KB_001 F004 → authenticateAdminAudit() → Admin session/user/role/status checks → KB_001 F005 → bindAdminAuditEvents() → Dashboard event binding → KB_001 F006 → goAdminDashboard() → Admin dashboard navigation → KB_001 F007 → getAdminAuditRoleClass() → Role-to-UI-class mapping → KB_001 F008 → loadAdminActivityLogs() → Load/render activity logs → KB_001 F009 → applyAdminAuditFilter() → Collect filters and load filtered logs → KB_001 F010 → clearAdminActivityLogs() → Confirm and trigger log clearing → KB_001 F011 → DOMContentLoaded callback → Page startup trigger → KB_001

EXTERNAL FUNCTION REGISTER

E001 → initCoreSystem() → external dependency E002 → getSession() → external session dependency E003 → getCurrentUser() → external user/session dependency E004 → hasRole() → external authorization dependency E005 → destroySession() → external session dependency E006 → getActivityLogs() → external activity-log dependency E007 → logActivity() → external activity-log dependency E008 → filterLogsAdvanced() → external filtering dependency E009 → clearActivityLogs() → external activity-log dependency

END KB_001 KB_002 — admin_activity_audit_dashboard.html

MODULE: ADMIN KB: KB_002 FILE TYPE: HTML Dashboard PRIMARY ROLE: Admin Activity Audit Dashboard UI

FUNCTION No named JavaScript functions defined in KB_002 UI event targets are defined for controller functions

FUNCTION NAME No local functions Referenced controller functions: goAdminDashboard() loadAdminActivityLogs() applyAdminAuditFilter() clearAdminActivityLogs()

FUNCTION LOCATION Referenced functions are supplied by admin_activity_audit_controller.js

FUNCTION ROLE Displays admin activity logs, filtering controls, navigation, refresh, and clear-log controls

FUNCTION OWNER UI structure → KB_002 Function execution → admin_activity_audit_controller.js

FUNCTION CALLER Controller event binding connects: backBtn → goAdminDashboard() refreshBtn → loadAdminActivityLogs() applyBtn → applyAdminAuditFilter() clearBtn → clearAdminActivityLogs()

FUNCTION CALLEE No local functions Controller functions execute against this dashboard's DOM

DUPLICATE DATA No duplicate data structure defined in KB_002

FUNCTION EXPORT None

RULE Dashboard provides activity-log viewing and filtering controls

RULE LOCATION UI structure in KB_002

AUTHORITY No business/authentication authority defined here Authentication is supplied through loaded Core/controller scripts

AUTHORITY LOCATION Loaded: core_session_authority.js admin_activity_audit_controller.js

DEPENDENCY core_boot_manager.js core_initializer.js core_session_authority.js admin_activity_audit_controller.js

DEPENDENCY OWNER Boot → core_boot_manager.js Initialization → core_initializer.js Session → core_session_authority.js Page controller → admin_activity_audit_controller.js

DEPENDENCY DIRECTION KB_002 → Core scripts + Admin controller

FILE ROLE Admin Activity Audit Dashboard UI

MODULE ADMIN

MODULE RELATION Dashboard ↔ admin_activity_audit_controller.js

CROSS-MODULE RELATION Dashboard loads Core boot, initialization, and session layers

FLOW Page load → Core scripts load → Admin controller loads → DOMContentLoaded → controller initializes dashboard → activity logs displayed

ENTRY POINT HTML page load / DOMContentLoaded handled by controller

EXIT / NAVIGATION Back button → admin_dashboard.html through controller

EXECUTION SEQUENCE Core boot → Core initialization → Session authority → Admin controller → Dashboard event binding → Log loading

STATE No JavaScript state variables defined in KB_002

UI STATE #logs content Filter input values Selected role

STATE MUTATION DOM content inside #logs is changed by loadAdminActivityLogs()

DATA Activity log display data

DATA FIELDS User ID Role Action Time

DATA SOURCE Controller obtains activity logs externally through getActivityLogs()

DATA FILTER filterUser filterRole filterKeyword

DATA FILTER SOURCE Controller → filterLogsAdvanced()

DATA CLEAR Clear Logs button → clearAdminActivityLogs()

STORAGE No direct storage API in KB_002

EVENT DOM events are handled by admin_activity_audit_controller.js

EVENT HANDLERS backBtn refreshBtn applyBtn clearBtn

EVENT ACTIONS backBtn → goAdminDashboard() refreshBtn → loadAdminActivityLogs() applyBtn → applyAdminAuditFilter() clearBtn → clearAdminActivityLogs()

LOCK No explicit lock

SECURITY No direct security logic Page depends on controller/session authentication

AUTHENTICATION core_session_authority.js loaded

AUTHORIZATION Handled by admin_activity_audit_controller.js using session/role authority

ACCOUNT STATUS Not handled in HTML

VALIDATION No business validation in HTML Filter values are collected by controller

ERROR HANDLING No JavaScript error handling in KB_002

FAILURE PATH Authentication failure is handled by controller

SESSION DESTRUCTION Not handled in KB_002

NAVIGATION Back control → controller → admin_dashboard.html

UI DOM TARGETS backBtn refreshBtn applyBtn clearBtn filterUser filterRole filterKeyword logs

UI OUTPUT #logs displays activity audit records

ROLE DISPLAY CSS classes: .admin .system .error

ROLE VALUES ADMIN SYSTEM_ADMIN USER

LOG ORDER Not controlled by KB_002 Controller reverses log order

LOG VIEW ACTION Not defined in KB_002 Controller calls logActivity()

FILTER ACTION Apply button provides: userId role keyword to controller

CLEAR ACTION Clear Logs button invokes controller clear operation

CONFIRMATION Confirmation handled by clearAdminActivityLogs()

ALERT Alert handled by controller

GLOBAL ACCESS No global functions defined in KB_002

RELATED FILES admin_activity_audit_controller.js core_boot_manager.js core_initializer.js core_session_authority.js admin_dashboard.html admin_auth.html

STATUS FIRST DOCUMENTS DATA PLACEMENT: RECORDED PROBLEM/SOLUTION: NOT ANALYZED

FILE ELEMENT REGISTER

UI001 → backBtn → Back navigation control → KB_002 UI002 → refreshBtn → Refresh logs control → KB_002 UI003 → filterUser → User ID filter → KB_002 UI004 → filterRole → Role filter → KB_002 UI005 → filterKeyword → Action keyword filter → KB_002 UI006 → applyBtn → Apply filter control → KB_002 UI007 → clearBtn → Clear logs control → KB_002 UI008 → logs → Activity log display container → KB_002

SCRIPT REGISTER

S001 → core_boot_manager.js → Core boot dependency S002 → core_initializer.js → Core initialization dependency S003 → core_session_authority.js → Session dependency S004 → admin_activity_audit_controller.js → Admin dashboard controller

END KB_002 KB_003 — admin_auth.html

MODULE: ADMIN KB: KB_003 FILE TYPE: HTML Authentication Page PRIMARY ROLE: Admin Login UI

FUNCTION No local functions
FUNCTION NAME No local named functions Referenced controller: admin_auth.js
FUNCTION LOCATION Login execution is external in admin_auth.js
FUNCTION ROLE Collects Admin ID and password and provides Login action
FUNCTION OWNER UI → KB_003 Authentication execution → admin_auth.js
FUNCTION CALLER loginBtn → controller event handling
FUNCTION CALLEE No local function
DUPLICATE DATA No local data logic
FUNCTION EXPORT None
RULE Admin login requires Admin ID and password input
RULE LOCATION UI fields in KB_003; authentication rule is external
AUTHORITY Authentication authority is external
AUTHORITY LOCATION core_session_authority.js and admin_auth.js
DEPENDENCY core_boot_manager.js core_initializer.js core_session_authority.js admin_auth.js
DEPENDENCY OWNER Boot → core_boot_manager.js Initialization → core_initializer.js Session → core_session_authority.js Admin login → admin_auth.js
DEPENDENCY DIRECTION KB_003 → Core + Admin authentication scripts
FILE ROLE Admin login interface
MODULE ADMIN
MODULE RELATION Admin login UI ↔ admin_auth.js
CROSS-MODULE RELATION Uses Core boot/initialization/session layers
FLOW Page load → Core scripts → admin_auth.js → login interaction
ENTRY POINT HTML page load
EXIT / NAVIGATION Controlled by admin_auth.js
EXECUTION SEQUENCE Boot → initialization → session layer → admin authentication controller
STATE No local JavaScript state
UI STATE adminId value password value msg content
STATE MUTATION DOM values/messages are handled by controller
DATA Admin ID Password
DATA FIELDS adminId password
DATA SOURCE User-entered login values
DATA FILTER No filter
DATA FILTER SOURCE None
DATA CLEAR Not defined in HTML
STORAGE No direct storage API
EVENT Login button interaction
EVENT HANDLERS loginBtn
EVENT ACTIONS Login → admin_auth.js
LOCK No explicit lock
SECURITY Password field uses type="password" Authentication handled externally
AUTHENTICATION admin_auth.js + Core session layer
AUTHORIZATION External authentication/session logic
ACCOUNT STATUS External authentication logic
VALIDATION External controller
ERROR HANDLING Message container #msg supplied for controller output
FAILURE PATH External controller
SESSION DESTRUCTION Not defined in KB_003
NAVIGATION External controller
UI DOM TARGETS adminId password loginBtn msg
UI OUTPUT #msg displays authentication status
ROLE DISPLAY No role display logic
ROLE VALUES No role values defined
LOG ORDER Not applicable
LOG VIEW ACTION Not defined
FILTER ACTION Not applicable
CLEAR ACTION Not defined
CONFIRMATION Not defined
ALERT Not defined
GLOBAL ACCESS No global functions
RELATED FILES admin_auth.js core_boot_manager.js core_initializer.js core_session_authority.js
STATUS FIRST DOCUMENTS DATA PLACEMENT: RECORDED PROBLEM/SOLUTION: NOT ANALYZED
UI REGISTER

UI001 → adminId → Admin ID input → KB_003 UI002 → password → Password input → KB_003 UI003 → loginBtn → Login button → KB_003 UI004 → msg → Authentication message output → KB_003

SCRIPT REGISTER

S001 → core_boot_manager.js → Core boot dependency S002 → core_initializer.js → Core initialization dependency S003 → core_session_authority.js → Session dependency S004 → admin_auth.js → Admin authentication controller

END KB_003 KB_004 — admin_auth.js

MODULE: ADMIN KB: KB_004 FILE TYPE: JavaScript Controller PRIMARY ROLE: Admin Authentication Controller

FUNCTION 8 named functions + 2 anonymous callbacks

FUNCTION NAME F001 bindAdminLoginEvents() F002 checkExistingAdminSession() F003 submitAdminLogin() F004 verifyPassword() F005 showAdminMessage() F006 unlockAdminLogin() F007 Anonymous DOMContentLoaded callback F008 Anonymous password keypress callback F009 Anonymous users.find() callback F010 Anonymous setTimeout() callback

FUNCTION LOCATION All named functions are in KB_004

FUNCTION ROLE Login event binding, existing-session detection, credential validation, password verification, session creation, activity logging, UI messaging, login-lock release

FUNCTION OWNER Admin authentication controller → KB_004 Session creation → external session authority User lookup → external user/data authority Activity logging → external activity authority

FUNCTION CALLER DOMContentLoaded → bindAdminLoginEvents() DOMContentLoaded → checkExistingAdminSession() loginBtn → submitAdminLogin() Enter key → submitAdminLogin() submitAdminLogin() → verifyPassword() submitAdminLogin() → showAdminMessage() submitAdminLogin() → unlockAdminLogin()

FUNCTION CALLEE submitAdminLogin() → getUsers() → verifyPassword() → setSession() → logActivity() → showAdminMessage() → unlockAdminLogin()

DUPLICATE DATA User records are read through getUsers() No local user storage is defined

FUNCTION EXPORT window.submitAdminLogin

RULE Only an active user with role "admin" and valid credentials may complete admin login

RULE LOCATION submitAdminLogin() checkExistingAdminSession()

AUTHORITY Authentication controller uses external authorities

AUTHORITY LOCATION getUsers() verifyPassword() setSession() logActivity() getSession()

DEPENDENCY getSession() getUsers() verifyPassword() setSession() logActivity() DOM elements admin_dashboard.html

DEPENDENCY OWNER Session → Core session authority User records → User/data authority Activity logging → Activity/audit authority Password verification → KB_004 UI → admin_auth.html

DEPENDENCY DIRECTION KB_004 → Core/User/Activity authorities

FILE ROLE Admin login execution controller

MODULE ADMIN

MODULE RELATION KB_003 admin_auth.html ↕ KB_004 admin_auth.js ↕ Core session/user/activity authorities

CROSS-MODULE RELATION ADMIN → CORE session authority ADMIN → USER data authority ADMIN → activity/audit authority

FLOW Page load → bind events → check existing session → submit login → get users → validate admin → verify password → create session → log activity → dashboard

ENTRY POINT DOMContentLoaded callback

EXIT / REDIRECT Existing valid admin session → admin_dashboard.html

Successful login → admin_dashboard.html

EXECUTION SEQUENCE

Bind login events

Check existing session

Read credentials

Validate input

Get users

Find matching admin

Verify password

Check active status

Set session

Log activity

Show success

Redirect dashboard

STATE ADMIN_LOGIN_LOCK

STATE VALUES true / false

STATE MUTATION submitAdminLogin() → ADMIN_LOGIN_LOCK = true

unlockAdminLogin() → ADMIN_LOGIN_LOCK = false

DATA Admin ID Password User records Session data

DATA FIELDS READ user.userId user.role user.password user.status session.userId session.role

DATA SOURCE getUsers() getSession()

DATA FILTER User ID Role = admin Password match

DATA FILTER SOURCE users.find()

DATA CLEAR No persistent data clear

STORAGE No direct storage API Session handled by setSession()

EVENT DOMContentLoaded Login click Password Enter key

EVENT HANDLERS loginBtn password keypress

EVENT ACTIONS submitAdminLogin()

LOCK ADMIN_LOGIN_LOCK prevents repeated submission

SECURITY Credential validation Admin-role validation Active-account validation Login submission lock

AUTHENTICATION getUsers() verifyPassword()

AUTHORIZATION user.role === "admin"

ACCOUNT STATUS admin.status === "active"

VALIDATION ID/password required Admin record required Password must match Account must be active

ERROR HANDLING Password verification try/catch Activity logging try/catch

FAILURE PATH Invalid input → message → unlock

Missing user authority → message → unlock

Invalid login → message → unlock

Inactive account → message → unlock

SESSION DESTRUCTION Not performed in this file

NAVIGATION admin_dashboard.html

UI DOM TARGETS loginBtn adminId password msg

UI OUTPUT showAdminMessage()

ROLE DISPLAY No UI role display

ROLE VALUES admin ADMIN

LOG ORDER Login activity is written after successful session creation

LOG VIEW ACTION logActivity( admin.userId, "ADMIN", "Admin Login" )

FILTER ACTION users.find() matches: userId role password

CLEAR ACTION No account/data clearing

CONFIRMATION None

ALERT showAdminMessage() falls back to alert()

GLOBAL ACCESS window.submitAdminLogin

RELATED FILES KB_003 — admin_auth.html core_session_authority.js User authority/data provider containing getUsers() Activity authority containing logActivity() admin_dashboard.html

STATUS FIRST-DOCUMENT DATA PLACEMENT: RECORDED PROBLEM/SOLUTION: NOT ANALYZED

FUNCTION REGISTER

F001 → bindAdminLoginEvents() → Login event binding → KB_004 F002 → checkExistingAdminSession() → Existing session check → KB_004 F003 → submitAdminLogin() → Main admin login flow → KB_004 F004 → verifyPassword() → Password verification → KB_004 F005 → showAdminMessage() → Login message display → KB_004 F006 → unlockAdminLogin() → Login lock release → KB_004 F007 → DOMContentLoaded callback → Page startup → KB_004 F008 → password keypress callback → Enter-key login → KB_004 F009 → users.find callback → Admin record matching → KB_004 F010 → setTimeout callback → Delayed dashboard redirect → KB_004

EXTERNAL FUNCTION REGISTER

E001 → getSession() → Existing session retrieval E002 → getUsers() → User record retrieval E003 → setSession() → Session creation E004 → logActivity() → Activity recording

END KB_004
