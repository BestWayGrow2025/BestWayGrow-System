❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️

♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
👉 REPOSITORY FILE: admin_activity_audit_controller.js
👉 KNOWLEDGE BASE: KB_001
👉 LAYER: Admin → Activity Audit Layer
👉 CATEGORY: Admin Activity Audit Controller
👉 PURPOSE: Controls the Admin Activity Audit Dashboard, authenticates administrators, loads activity logs, applies audit filters, manages log viewing operations, and provides secure read-only audit monitoring.
👉 POSITION: Admin → Audit Management → Activity Audit Controller
👉 LOADED BY: admin_activity_audit_dashboard.html
👉 ENTRY FUNCTION: initAdminActivityAudit()
👉 INITIALIZATION: Automatically executes after DOMContentLoaded, initializes the Core System, authenticates the administrator, binds dashboard events, and loads activity audit logs.
👉 AUTHENTICATION: Validates administrator session using getSession(), getCurrentUser(), hasRole("admin"), and verifies active account status before allowing dashboard access.
👉 ACCESS CONTROL: Automatically redirects unauthorized, invalid, inactive, or expired sessions to admin_auth.html through redirectLogin().
👉 NAVIGATION: Provides secure navigation back to the Admin Dashboard through goAdminDashboard().
👉 EVENT MANAGEMENT: Registers Back, Refresh, Apply Filter, and Clear Log button events during controller initialization.
👉 AUDIT LOG MANAGEMENT: Loads activity logs, reverses chronological order, formats timestamps, applies role-based styling, and displays logs inside the audit dashboard.
👉 FILTER ENGINE: Supports advanced filtering by User ID, Role, and Keyword using filterLogsAdvanced().
👉 LOG CLEARING: Allows administrator-confirmed deletion of activity logs using clearActivityLogs() followed by automatic dashboard refresh.
👉 ROLE DISPLAY: Applies visual role indicators for ADMIN, SYSTEM_ADMIN, ERROR, and default activity records.
👉 AUDIT RECORDING: Records administrator activity whenever audit logs are viewed using logActivity().
👉 DEPENDENCIES: initCoreSystem(), getSession(), destroySession(), getCurrentUser(), hasRole(), getActivityLogs(), filterLogsAdvanced(), clearActivityLogs(), logActivity()
👉 GLOBAL EXPORTS: initAdminActivityAudit(), loadAdminActivityLogs(), applyAdminAuditFilter(), clearAdminActivityLogs()
👉 SECURITY: Administrator-only access, authenticated session validation, account status verification, protected dashboard routing, and read-only audit monitoring architecture.
👉 WORKFLOW: DOM Ready → Core Initialization → Administrator Authentication → Event Registration → Load Audit Logs → Filter/View Logs → Optional Log Clearing → Activity Recording.
👉 STATUS: ✅ VERIFIED
👉 REMARKS: Enterprise-grade Admin Activity Audit Controller providing secure administrator authentication, centralized audit log monitoring, advanced filtering, dashboard integration, and production-ready read-only activity auditing.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
👉 REPOSITORY FILE: admin_activity_audit_dashboard.html
👉 KNOWLEDGE BASE: KB_002
👉 LAYER: Admin → Audit & Monitoring Layer
👉 CATEGORY: Admin Activity Audit Dashboard
👉 PURPOSE: Provides the administrative user interface for viewing, filtering, refreshing, and monitoring platform activity logs in a secure read-only environment.
👉 POSITION: Admin → Audit Management → Activity Audit Dashboard
👉 LOADED BY: Admin Activity Audit Module
👉 ENTRY FILE: admin_activity_audit_dashboard.html
👉 CONNECTED CONTROLLER: admin_activity_audit_controller.js
👉 DEPENDENCIES: core_boot_manager.js, core_initializer.js, core_session_authority.js, admin_activity_audit_controller.js
👉 UI COMPONENTS: Page Header, Back Button, Refresh Button, User Filter, Role Filter, Keyword Search, Apply Button, Clear Logs Button, Activity Log Display Container
👉 INPUT ELEMENTS: #filterUser, #filterRole, #filterKeyword
👉 ACTION BUTTONS: #backBtn, #refreshBtn, #applyBtn, #clearBtn
👉 DISPLAY CONTAINER: #logs
👉 AUTHENTICATION: Protected through Core Session Authority before controller initialization.
👉 SECURITY: Read-only administrative dashboard with authenticated access.
👉 FILTER SUPPORT: User ID Filter, Role Filter, Keyword Filter
👉 AUDIT VIEW: Displays chronological administrative activity records supplied by the controller.
👉 NAVIGATION: Back navigation to Admin Dashboard.
👉 PAGE TYPE: Administrative Monitoring Dashboard
👉 SCRIPT LOAD ORDER: Core Boot Manager → Core Initializer → Core Session Authority → Admin Activity Audit Controller
👉 INITIALIZATION FLOW: HTML Load → Core Initialization → Session Validation → Controller Initialization → Activity Log Rendering
👉 STATUS: ✅ VERIFIED
👉 REMARKS: Enterprise administrative audit dashboard providing secure activity monitoring, filtering capabilities, refresh operations, and centralized audit log visualization following the platform's standardized Core initialization sequence.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
👉 REPOSITORY FILE: admin_auth.html 👉 KNOWLEDGE BASE: KB_003 👉 LAYER: Admin → Authentication Layer 👉 CATEGORY: Admin Authentication Login Page 👉 PURPOSE: Provides the secure administrative login interface for authenticating authorized administrators before granting access to the Admin Control Panel. 👉 POSITION: Admin → Authentication → Login Interface 👉 LOADED BY: Browser Initial Page Request 👉 ENTRY FILE: admin_auth.html 👉 CONNECTED CONTROLLER: admin_auth.js 👉 DEPENDENCIES: core_boot_manager.js, core_initializer.js, core_session_authority.js, admin_auth.js 👉 UI COMPONENTS: Login Container, Admin ID Input, Password Input, Login Button, Status Message Area 👉 INPUT ELEMENTS: #adminId, #password 👉 ACTION BUTTONS: #loginBtn 👉 DISPLAY ELEMENT: #msg 👉 AUTHENTICATION: Uses Core Session Authority and Admin Authentication Controller for secure login validation. 👉 SECURITY: Password field masking, authenticated session creation, protected administrator access. 👉 PAGE TYPE: Administrative Login Interface 👉 SCRIPT LOAD ORDER: Core Boot Manager → Core Initializer → Core Session Authority → Admin Authentication Controller 👉 INITIALIZATION FLOW: HTML Load → Core Boot → Core Initialization → Session Authority Ready → Admin Authentication Controller Initialization 👉 NAVIGATION: Successful authentication redirects to the Administrative Dashboard. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise administrative authentication interface providing secure administrator login, standardized Core boot sequence integration, protected session initialization, and controlled access to the BWG Administration System.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
👉 REPOSITORY FILE: admin_auth.js 👉 KNOWLEDGE BASE: KB_004 👉 LAYER: Admin → Authentication Layer 👉 CATEGORY: Admin Authentication Controller 👉 PURPOSE: Authenticates administrator credentials, validates administrator role and account status, creates secure admin sessions, records login activity, and redirects authenticated administrators to the Admin Dashboard. 👉 POSITION: Admin → Authentication → Login Controller 👉 LOADED BY: admin_auth.html 👉 ENTRY FUNCTION: initAdminLogin() via DOMContentLoaded Event 👉 DEPENDENCIES: getUsers(), getSession(), setSession(), logActivity(), core_session_authority.js 👉 GLOBAL EXPORTS: submitAdminLogin 👉 CORE FUNCTIONS: bindAdminLoginEvents(), checkExistingAdminSession(), submitAdminLogin(), verifyPassword(), showAdminMessage(), unlockAdminLogin() 👉 AUTHENTICATION: Validates Admin ID, Password, Role, Account Status, and Existing Session. 👉 SECURITY: Login lock protection, duplicate submission prevention, role verification, session authority integration, password verification, inactive account blocking. 👉 SESSION MANAGEMENT: Automatically creates authenticated admin session and redirects authenticated administrators. 👉 AUDIT LOGGING: Records successful administrator login activity through the platform audit system. 👉 REDIRECTION: Automatically redirects authenticated administrators to admin_dashboard.html after successful login. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise-grade administrative authentication controller providing secure administrator login, session creation, role validation, duplicate login protection, activity logging, and seamless integration with the Core Authentication and Session Authority infrastructure.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
👉 REPOSITORY FILE: admin_dashboard.html 👉 KNOWLEDGE BASE: KB_005 👉 LAYER: Admin → Dashboard Presentation Layer 👉 CATEGORY: Admin Dashboard Interface 👉 PURPOSE: Provides the primary administrative dashboard interface, navigation menu, system access entry point, and central workspace for all administrative operations. 👉 POSITION: Admin → Dashboard → Main Interface 👉 LOADED BY: Admin Authentication Process (admin_auth.js) 👉 ENTRY FUNCTION: Dashboard loads automatically through admin_dashboard_controller.js after successful admin authentication. 👉 DEPENDENCIES: core_boot_manager.js, core_initializer.js, core_session_authority.js, admin_dashboard_controller.js 👉 GLOBAL EXPORTS: None (HTML Presentation Layer) 👉 UI COMPONENTS: Dashboard Header, Welcome Section, Logout Button, Navigation Menu, Dynamic Content Container. 👉 NAVIGATION MODULES: Home, Users, PIN, Wallet, Income, System, Reports. 👉 AUTHENTICATION: Dashboard access depends on active authenticated Admin Session validated by Core Session Authority. 👉 LAYOUT STRUCTURE: Responsive single-page administrative dashboard with centralized content rendering area. 👉 CONTENT CONTAINER: mainContent dynamically populated by Dashboard Controller according to selected administrative module. 👉 SECURITY: Session validation handled through Core Session Authority before dashboard initialization. 👉 BOOT PROCESS: Core Boot Manager initializes platform services before Dashboard Controller execution. 👉 INITIALIZATION: Core Initializer prepares enterprise environment before dashboard rendering. 👉 SESSION MANAGEMENT: Uses Core Session Authority for authentication verification, session validation, and logout handling. 👉 ROLE: Enterprise administrative control center acting as the primary navigation gateway for all administrator functions. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Admin Dashboard providing authenticated access to all administrative modules through a centralized navigation interface, secured by Core Boot, Initialization, and Session Authority infrastructure.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
👉 REPOSITORY FILE: admin_dashboard_controller.js 👉 KNOWLEDGE BASE: KB_006 👉 LAYER: Admin → Dashboard Control Layer 👉 CATEGORY: Admin Dashboard Controller 👉 PURPOSE: Controls the complete Admin Dashboard lifecycle including authentication, dashboard initialization, menu navigation, module loading, user rendering, session validation, auto-refresh, and logout operations. 👉 POSITION: Admin → Dashboard → Main Controller 👉 LOADED BY: admin_dashboard.html 👉 ENTRY FUNCTION: startAdminDashboard() 👉 DEPENDENCIES: initCoreSystem(), getSession(), getUserById(), logoutSession(), getUsers(), getAdminTreeView() 👉 GLOBAL EXPORTS: startAdminDashboard(), loadHome(), loadUsers(), renderUsers(), loadPinsUI(), logout(), openAdminTreeView(), getAdminFullTree() 👉 INITIALIZATION: Initializes Core System, validates Admin Session, binds dashboard events, loads Home dashboard, and starts automatic refresh service. 👉 AUTHENTICATION: Validates authenticated Admin Session before permitting dashboard access and redirects unauthorized users to admin_auth.html. 👉 SESSION MANAGEMENT: Reads active session through Core Session Authority and safely destroys invalid sessions during logout. 👉 DASHBOARD MODULES: Home, Users, PIN Management, Wallet, Income, System, Reports. 👉 NAVIGATION: Uses centralized menu routing with click-lock protection to prevent duplicate execution during page switching. 👉 AUTO REFRESH: Refreshes active User Management view every 5 seconds while preserving dashboard responsiveness. 👉 USER MANAGEMENT: Retrieves repository users, filters standard users, and dynamically renders the User List table. 👉 TREE MANAGEMENT: Provides secure entry point for Enterprise User Tree visualization through Admin Tree APIs. 👉 PLACEHOLDER MODULES: PIN, Wallet, Income, System, Reports, and Tree modules are safely routed using placeholder loaders until module execution. 👉 SECURITY: Enforces Admin-only dashboard access, validates account identity, and blocks unauthorized dashboard execution. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Admin Dashboard Controller providing secure authentication, centralized navigation, dynamic module routing, automatic refresh management, user administration, and production-grade dashboard lifecycle control.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
👉 REPOSITORY FILE: admin_escrow_control_authority.js 👉 KNOWLEDGE BASE: KB_007 👉 LAYER: Admin → Escrow Management Layer 👉 CATEGORY: Admin Escrow Control Authority 👉 PURPOSE: Provides administrative authority for monitoring escrow records, approving or rejecting escrow requests, enforcing administrator access, and maintaining escrow activity auditing. 👉 POSITION: Admin → Financial Administration → Escrow Control Authority 👉 LOADED BY: Admin Dashboard / Financial Administration Module 👉 ENTRY FUNCTION: loadEscrowAdminPanel() 👉 DEPENDENCIES: getSession(), loadEscrows(), updateEscrowStatus(), logActivity() 👉 GLOBAL EXPORTS: loadEscrowAdminPanel(), approveEscrow(), rejectEscrow() 👉 AUTHENTICATION: Verifies authenticated Admin Session before permitting any escrow administration operation. 👉 AUTHORITY CONTROL: Blocks unauthorized access and redirects invalid sessions to admin_auth.html. 👉 ESCROW MANAGEMENT: Retrieves escrow records, displays escrow administration table, and provides approval/rejection workflow. 👉 APPROVAL PROCESS: Updates escrow status to APPROVED, records audit activity, and refreshes the administration panel. 👉 REJECTION PROCESS: Updates escrow status to REJECTED, records audit activity, and refreshes the administration panel. 👉 AUDIT LOGGING: Records every administrative escrow decision through the enterprise Activity Log system. 👉 DATA PROTECTION: Escrow values are sanitized using safeHtml() before rendering to prevent HTML injection. 👉 USER INTERFACE: Generates a secure administrative escrow table containing Escrow ID, User ID, Amount, Status, and Action controls. 👉 SECURITY: Restricts escrow administration exclusively to authenticated administrators using session-based authorization. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Escrow Control Authority providing secure administrator verification, escrow approval and rejection workflow, activity auditing, secure HTML rendering, and production-grade financial administration control.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
👉 REPOSITORY FILE: admin_franchise_auth.html 👉 KNOWLEDGE BASE: KB_008 👉 LAYER: Admin → Franchise Authentication Layer 👉 CATEGORY: Franchise Authentication Interface 👉 PURPOSE: Provides the secure login interface for Franchise Administrators, collects authentication credentials, and initializes the Franchise Administration authentication workflow. 👉 POSITION: Admin → Franchise Portal → Login Interface 👉 LOADED BY: Direct Browser Entry 👉 ENTRY FUNCTION: HTML Document Initialization (DOMContentLoaded handled by admin_franchise_auth_controller.js) 👉 DEPENDENCIES: core_boot_manager.js, core_initializer.js, core_session_authority.js, admin_franchise_auth_controller.js 👉 GLOBAL EXPORTS: None (UI document delegates all logic to the controller) 👉 USER INTERFACE: Displays Franchise ID input, Password input, Login button, and Authentication Status message panel. 👉 AUTHENTICATION FORM: Accepts Franchise Administrator credentials for secure session validation. 👉 CORE INITIALIZATION: Loads Core Boot Manager, Core Initializer, and Session Authority before executing Franchise Authentication Controller. 👉 CONTROLLER INTEGRATION: Delegates all authentication logic, session validation, credential verification, and login processing to admin_franchise_auth_controller.js. 👉 LAYOUT: Responsive centered authentication card with enterprise login styling for Franchise Administration access. 👉 SECURITY: Password field uses masked input and authentication processing is performed exclusively by the controller layer. 👉 NAVIGATION ROLE: Acts as the official entry page for Franchise Administrator authentication. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Franchise Authentication Interface providing secure administrator login UI, controlled Core initialization sequence, controller-driven authentication workflow, and production-grade Franchise Administration access.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
👉 REPOSITORY FILE: admin_franchise_auth_controller.js
👉 KNOWLEDGE BASE: KB_009
👉 LAYER: Admin → Franchise Authentication Layer
👉 CATEGORY: Franchise Authentication Controller
👉 PURPOSE:
Controls Franchise Administrator authentication, validates login credentials, manages Franchise login sessions, and securely redirects authenticated users to the Franchise Dashboard.

👉 POSITION:Admin → Franchise Portal → Authentication Controller
👉 LOADED BY:  admin_franchise_auth.html
👉 ENTRY FUNCTION:   DOMContentLoaded

👉 DEPENDENCIES:
getUsers(), localStorage, core_boot_manager.js, core_initializer.js, core_session_authority.js
👉 GLOBAL EXPORTS:   None
👉 INITIALIZATION:
Executes page initialization, authentication setup, event binding, and existing Franchise session verification after page load.
👉 AUTHENTICATION:
Validates Franchise ID, password, account role, and active account status before granting dashboard access.
👉 USER VERIFICATION:
Retrieves repository users through getUsers() and verifies:
- Matching Franchise userId
- Franchise role authorization
- Valid password credentials
- Active account status
👉 PASSWORD HANDLING:
Supports stored password compatibility through safeDecode() Base64-decoded verification while maintaining compatibility with existing credential storage format.
👉 SESSION MANAGEMENT:
Creates and stores authenticated Franchise session data using localStorage under the loggedInFranchise key.

Stored session information:  - Franchise userId

Existing active Franchise sessions are detected and automatically restored.
👉 LOGIN PROCESS:
Authentication workflow:
1. Receive Franchise ID and Password input
2. Validate required fields
3. Load repository users
4. Find matching Franchise account
5. Verify password
6. Confirm active status
7. Store Franchise session
8. Redirect to admin_franchise_dashboard.html
👉 EVENT MANAGEMENT:
Registers Login button click event and prevents duplicate authentication execution through login request locking.
👉 AUTO REDIRECTION:
Detects existing loggedInFranchise session and redirects authenticated Franchise users directly to the Franchise Dashboard.
👉 SECURITY:
Implements:
- Invalid credential rejection
- Franchise role validation
- Active account verification
- Missing user system protection
- Duplicate login execution protection
- Controlled dashboard access
👉 CURRENT IMPLEMENTATION:
Authentication currently depends on:
- Repository user storage
- getUsers() data access
- localStorage session persistence
- Controller-level credential validation
👉 FUTURE INTEGRATION READY:
Can be extended with:
- Central authentication API
- Advanced password hashing
- Multi-factor authentication
- Enterprise identity provider integration

👉 STATUS:
✅ VERIFIED
👉 REMARKS:
Enterprise Franchise Authentication Controller providing secure credential verification, repository user validation, localStorage session persistence, safeDecode password compatibility, duplicate login protection, automatic dashboard redirection, and production-aligned Franchise Administrator authentication workflow.
