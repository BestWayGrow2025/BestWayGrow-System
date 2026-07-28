👉 REPOSITORY FILE: admin_franchise_authority.html 👉 KNOWLEDGE BASE: KB_010 👉 LAYER: Admin → Franchise Management Layer 👉 CATEGORY: Franchise Authority Interface 👉 PURPOSE: Provides the administrative interface for managing Franchise requests, reviewing authority actions, refreshing request data, and initiating Franchise account administration functions. 👉 POSITION: Admin → Franchise Administration → Franchise Authority Panel 👉 LOADED BY: Franchise Administration Navigation 👉 ENTRY FUNCTION: HTML Document Initialization (Controller handled by admin_franchise_authority.js) 👉 DEPENDENCIES: admin_franchise_authority.js 👉 GLOBAL EXPORTS: None (UI document delegates all operational logic to the controller) 👉 USER INTERFACE: Displays Franchise Authority header, Refresh button, Reset User Password button, and Franchise Request List panel. 👉 REQUEST MANAGEMENT: Provides a dedicated request container for displaying all pending and processed Franchise administration requests. 👉 ADMIN CONTROLS: Includes administrative actions for refreshing authority records and initiating user password reset operations. 👉 LAYOUT: Enterprise card-based administrative interface with separate control and request management sections. 👉 CONTROLLER INTEGRATION: All business logic, authority validation, request processing, and administrative operations are executed by admin_franchise_authority.js. 👉 NAVIGATION ROLE: Serves as the central Franchise Authority administration interface within the Admin Management module. 👉 SECURITY: Administrative functionality is controlled exclusively through the associated Franchise Authority Controller. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Franchise Authority Interface providing structured Franchise request administration, authority operation controls, controller-driven management workflow, and production-grade Franchise Administration support.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
👉 REPOSITORY FILE: admin_franchise_authority.js
👉 KNOWLEDGE BASE: KB_011
👉 LAYER: Admin → Franchise Management Layer
👉 CATEGORY: Franchise Authority Controller
👉 PURPOSE:
Manages Franchise request monitoring, processes administrator approval and rejection actions, refreshes Franchise request records, and controls Franchise Authority dashboard operations.
👉 POSITION:  Admin → Franchise Administration → Authority Controller
👉 LOADED BY:   admin_franchise_authority.html
👉 ENTRY FUNCTION:   bindFranchiseAuthorityEvents()
👉 DEPENDENCIES:
getFranchiseRequests(), approveFranchiseRequest(), rejectFranchiseRequest(), DOM API

👉 GLOBAL EXPORTS:
loadFranchiseRequests()
approveFranchise()
rejectFranchise()
resetUserPassword()

👉 INITIALIZATION:
Automatically binds interface events and loads Franchise requests after DOM initialization.

👉 REQUEST MANAGEMENT:
Retrieves Franchise request records through getFranchiseRequests(), dynamically renders request information, and refreshes the interface after administrative actions.

👉 REQUEST DISPLAY:
Generates Franchise request records containing:
- Request ID
- User ID
- Request Status
- Approve Action
- Reject Action

👉 APPROVAL WORKFLOW:
Executes Franchise approval through approveFranchiseRequest() when the authority function is available and refreshes the request list after processing.

👉 REJECTION WORKFLOW:
Executes Franchise rejection through rejectFranchiseRequest() when the authority function is available and refreshes the request list after processing.

👉 PASSWORD MANAGEMENT:
Provides resetUserPassword() administrative entry point.

CURRENT STATUS:
- Password reset interface exists
- Full password reset execution logic is not yet connected

👉 EVENT MANAGEMENT:
Registers:
- Refresh button action
- Reset Password button action
and initializes automatic request loading.

👉 LOGGING:
Currently provides operational console logging for:
- Franchise approval action
- Franchise rejection action
- Password reset request action
Future integration can connect these events with centralized audit storage.

👉 SECURITY:
Administrative actions are executed only through dedicated authority functions when available.

Current protection includes:
- Controlled function execution
- Limited authority exposure
- Controller-based workflow separation

👉 CURRENT IMPLEMENTATION:
Uses:
- DOM-based dashboard control
- External Franchise request authority functions
- Dynamic request rendering
No direct database/API persistence exists in the current repository implementation.

👉 FUTURE INTEGRATION READY:
Can be extended with:
- Admin permission matrix
- Central audit journal integration
- Approval authority hierarchy
- Notification workflow
- Enterprise request persistence layer

👉 STATUS: ✅ VERIFIED
👉 REMARKS:
Enterprise Franchise Authority Controller providing centralized Franchise request monitoring, approval and rejection workflow handling, dynamic request rendering, controlled administrative actions, future audit integration readiness, and production-aligned Franchise Administration management.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️ 
👉 REPOSITORY FILE: admin_franchise_dashboard.html 👉 KNOWLEDGE BASE: KB_012 👉 LAYER: Admin → Franchise Management Layer 👉 CATEGORY: Franchise Dashboard Interface 👉 PURPOSE: Provides the primary Franchise Administration dashboard for displaying Franchise profile information, system status, managed users, and administrative dashboard controls. 👉 POSITION: Admin → Franchise Administration → Franchise Dashboard 👉 LOADED BY: Franchise Login Authentication (admin_franchise_auth_controller.js) 👉 ENTRY FUNCTION: HTML Document Initialization (Controller handled by admin_franchise_dashboard_controller.js) 👉 DEPENDENCIES: core_boot_manager.js, core_initializer.js, core_session_authority.js, admin_franchise_dashboard_controller.js 👉 GLOBAL EXPORTS: None (Presentation layer only) 👉 USER INTERFACE: Displays Franchise Dashboard title, Logout button, Profile section, System Status section, and Users Under You management panel. 👉 PROFILE PANEL: Provides dedicated display area for authenticated Franchise profile information through the Profile container. 👉 SYSTEM STATUS PANEL: Displays operational system information and Franchise dashboard status through the System container. 👉 USER MANAGEMENT PANEL: Provides dynamic container for displaying users assigned under the authenticated Franchise account. 👉 LAYOUT: Enterprise card-based dashboard layout with modular administrative sections for scalable Franchise management. 👉 CONTROLLER INTEGRATION: All authentication, session validation, data retrieval, dashboard rendering, and business logic are handled by admin_franchise_dashboard_controller.js. 👉 SECURITY: Dashboard access and operational validation are enforced exclusively by the associated Franchise Dashboard Controller. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Franchise Dashboard Interface providing authenticated Franchise administration, modular dashboard presentation, dynamic controller-driven content rendering, and production-grade Franchise Management architecture.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️ 
👉 REPOSITORY FILE: admin_franchise_dashboard_controller.js
👉 KNOWLEDGE BASE: KB_013
👉 LAYER: Admin → Franchise Management Layer
👉 CATEGORY: Franchise Dashboard Controller
👉 PURPOSE:
Controls Franchise Dashboard authentication, profile rendering, system status monitoring, downline user management, session validation, periodic dashboard refresh, and logout operations.
👉 POSITION:  Admin → Franchise Administration → Dashboard Controller
👉 LOADED BY:   admin_franchise_dashboard.html
👉 ENTRY FUNCTION:
initPage()
authPage()
bindEvents()
loadPage()

👉 DEPENDENCIES:
getSession()
destroySession()
getCurrentUser()
hasRole()
getSystemSettings()
getUsers()
logActivity()
core_boot_manager.js
core_initializer.js
core_session_authority.js

👉 GLOBAL EXPORTS:
None
(Controller operates through DOM lifecycle and dashboard events)

👉 INITIALIZATION:
Automatically initializes the Franchise Dashboard after DOM loading, performs authentication checks, binds dashboard controls, and loads operational information.

👉 AUTHENTICATION:
Validates:
- Active Franchise session
- Current user identity
- Franchise role authorization
- Account active status
- Franchise system access permission

Unauthorized users are redirected to:
admin_franchise_auth.html

👉 SESSION MANAGEMENT:
Uses Core Session Authority functions:
- getSession()
- getCurrentUser()
- destroySession()

Protects dashboard access through controlled session validation.

👉 PROFILE MANAGEMENT:
Displays authenticated Franchise profile information:

- Franchise User ID
- Username
- Account Status

through the dashboard profile container.

👉 SYSTEM MONITORING:
Displays current platform operational settings:

- Registration Status
- Franchise Access Status
- Lock Mode Status
- Queue Status
- Withdrawal Status

using getSystemSettings().

👉 DOWNLINE MANAGEMENT:
Retrieves users through getUsers() and filters directly introduced users using:

introducerId === currentUser.userId

Displays:
- User ID
- User Name
- Active Status
- Wallet Balance

👉 WALLET DISPLAY:
Current implementation displays user wallet information from:

user.wallet

Future financial integration can connect with centralized wallet and ledger modules.

👉 AUTO REFRESH:
Automatically refreshes:
- System status
- Downline user information

every 4000 milliseconds.

Refresh process is controlled through refreshTimer.

👉 ACTIVITY LOGGING:
Records dashboard events through logActivity():

- Dashboard opening
- Franchise logout

Future integration can connect with enterprise audit journal.

👉 LOGOUT WORKFLOW:
Logout process:

1. Stop dashboard refresh timer
2. Record logout activity
3. Destroy active session
4. Redirect to Franchise Authentication page

👉 SECURITY:
Implements:

- Role verification
- Session validation
- Account status checking
- Franchise access permission checking
- Controlled logout handling

👉 CURRENT IMPLEMENTATION:
Uses:
- Core session authority
- Local repository user data
- System settings provider
- DOM-based dashboard rendering

No direct financial transaction processing exists inside this controller.

👉 FUTURE INTEGRATION READY:
Can be extended with:

- Franchise income dashboard
- PIN inventory monitoring
- Wallet settlement view
- Financial ledger integration
- Advanced franchise analytics
👉 STATUS: ✅ VERIFIED
👉 REMARKS:
Enterprise Franchise Dashboard Controller providing secure Franchise authentication, real-time operational monitoring, introducer-based downline management, wallet visibility, automated dashboard refresh, centralized activity logging, secure session handling, and production-aligned Franchise Administration workflow.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️ 
👉 REPOSITORY FILE: admin_franchise_pin_request_controller.js 👉 KNOWLEDGE BASE: KB_014 👉 LAYER: Admin → Franchise PIN Management Layer 👉 CATEGORY: Franchise PIN Request Controller 👉 PURPOSE: Controls Franchise PIN request creation, request tracking, authentication validation, request storage, and Franchise PIN request management operations. 👉 POSITION: Admin → Franchise Administration → PIN Request Controller 👉 LOADED BY: admin_franchise_pin_request_dashboard.html 👉 ENTRY FUNCTION: initPage(), authPage(), bindEvents(), loadPage() 👉 DEPENDENCIES: getSession(), destroySession(), getCurrentUser(), hasRole(), logActivity(), localStorage, core_boot_manager.js, core_initializer.js, core_session_authority.js 👉 GLOBAL EXPORTS: None (Controller operates through DOM lifecycle and registered event handlers) 👉 INITIALIZATION: Automatically initializes the Franchise PIN Request module after DOM loading, validates authentication, binds interface events, and loads existing PIN requests. 👉 AUTHENTICATION: Verifies authenticated Franchise session, validates Franchise role, confirms active account status, and redirects unauthorized users to Franchise Login. 👉 PIN REQUEST CREATION: Generates unique Request IDs, validates requested PIN quantity, creates new PIN request records, and stores them in localStorage. 👉 REQUEST STORAGE: Maintains Franchise PIN request records including Request ID, User ID, Quantity, Status, and Creation Timestamp. 👉 REQUEST TRACKING: Displays only PIN requests belonging to the authenticated Franchise account with reverse chronological ordering. 👉 EVENT MANAGEMENT: Registers Back and Submit button events for dashboard navigation and PIN request submission. 👉 ACTIVITY LOGGING: Records every successful Franchise PIN Request creation through the centralized activity logging mechanism. 👉 NAVIGATION: Provides secure return navigation from the PIN Request module back to the Franchise Dashboard. 👉 SECURITY: Restricts PIN request operations to authenticated Franchise users with valid active accounts. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Franchise PIN Request Controller providing authenticated PIN request submission, request history management, secure local request persistence, activity auditing, and production-grade Franchise PIN Administration workflow.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️ 
👉 REPOSITORY FILE: admin_franchise_pin_request_dashboard.html 👉 KNOWLEDGE BASE: KB_015 👉 LAYER: Admin → Franchise PIN Management Layer 👉 CATEGORY: Franchise PIN Request Dashboard Interface 👉 PURPOSE: Provides the Franchise PIN Request user interface for creating PIN requests, viewing request history, and managing Franchise PIN request operations. 👉 POSITION: Admin → Franchise Administration → PIN Request Dashboard 👉 LOADED BY: Franchise Dashboard Navigation 👉 ENTRY FUNCTION: HTML Document Initialization (Controller handled by admin_franchise_pin_request_controller.js) 👉 DEPENDENCIES: core_boot_manager.js, core_initializer.js, core_session_authority.js, admin_franchise_pin_request_controller.js 👉 GLOBAL EXPORTS: None (Presentation layer only) 👉 USER INTERFACE: Displays Franchise PIN Request title, Dashboard Back button, PIN Quantity input form, Submit Request button, and PIN Request History table. 👉 REQUEST CREATION PANEL: Provides a dedicated interface for entering PIN quantity and submitting new Franchise PIN Requests. 👉 REQUEST HISTORY PANEL: Displays Request ID, Quantity, Status, and Request Date for all PIN Requests belonging to the authenticated Franchise account. 👉 TABLE STRUCTURE: Enterprise tabular layout supporting organized PIN Request tracking and status monitoring. 👉 LAYOUT: Responsive enterprise card-based dashboard with separated Request Creation and Request History modules. 👉 CONTROLLER INTEGRATION: All authentication, validation, request creation, data persistence, event handling, and dashboard rendering are managed by admin_franchise_pin_request_controller.js. 👉 SECURITY: Dashboard access, Franchise authorization, and request processing are enforced entirely by the associated controller. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Franchise PIN Request Dashboard Interface providing secure PIN Request submission, request history visualization, controller-driven business logic integration, and production-grade Franchise PIN Management architecture.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️ 
👉 REPOSITORY FILE: admin_income_audit_dashboard.html (Repository verification shows this file currently contains the Admin Income Audit controller implementation rather than HTML markup.) 👉 KNOWLEDGE BASE: KB_016 👉 LAYER: Admin → Income Audit Layer 👉 CATEGORY: Income Audit Controller 👉 PURPOSE: Controls secure Admin Income Audit access, validates administrator authority, filters income records, calculates payout totals, and provides read-only income audit reporting. 👉 POSITION: Admin → Financial Management → Income Audit Controller 👉 LOADED BY: admin_income_audit_dashboard.html 👉 ENTRY FUNCTION: initIncomeAuditPage() 👉 DEPENDENCIES: getSession(), destroySession(), getCurrentUser(), hasRole(), getIncomeLogs(), core_session_authority.js 👉 GLOBAL EXPORTS: loadIncomeAuditPage(), loadIncomeLogs(), ADMIN_INCOME_AUDIT 👉 INITIALIZATION: Automatically initializes after DOM loading, authenticates the administrator, binds dashboard events, and loads the Income Audit interface. 👉 AUTHENTICATION: Validates authenticated Admin session, verifies Admin role, confirms active account status, and redirects unauthorized users to the Admin Login page. 👉 EVENT MANAGEMENT: Registers Refresh and Filter events to reload Income Audit records dynamically. 👉 AUDIT PROCESSING: Retrieves centralized Income Logs, applies Income Type and User filters, reverses chronological order, and renders audit records into the dashboard table. 👉 REPORTING: Calculates total payout amount and total audit record count while displaying complete transaction history. 👉 READ-ONLY MODE: Operates as a production-safe read-only audit interface without modifying financial records. 👉 SESSION MANAGEMENT: Uses centralized session authority without direct localStorage session handling. 👉 SECURITY: Restricts Income Audit visibility exclusively to authenticated administrators using centralized role validation. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Income Audit Controller providing secure administrator authentication, centralized income log auditing, dynamic filtering, payout summarization, production-safe financial reporting, and repository-aligned read-only audit management. Repository note: The supplied file name is admin_income_audit_dashboard.html, but its contents are JavaScript controller logic rather than HTML.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️ 
👉 REPOSITORY FILE: admin_income_audit_controller.js (Repository verification shows this file currently contains the Admin Income Audit Dashboard HTML interface rather than controller JavaScript.) 👉 KNOWLEDGE BASE: KB_017 👉 LAYER: Admin → Income Audit Layer 👉 CATEGORY: Income Audit Dashboard Interface 👉 PURPOSE: Provides the administrator interface for viewing, filtering, and auditing all income transactions together with payout summaries and audit statistics. 👉 POSITION: Admin → Financial Management → Income Audit Dashboard 👉 LOADED BY: Direct Dashboard Navigation 👉 ENTRY FUNCTION: HTML Document Initialization (Controller handled by admin_income_audit_controller.js) 👉 DEPENDENCIES: core_boot_manager.js, core_initializer.js, core_session_authority.js, admin_income_audit_controller.js 👉 GLOBAL EXPORTS: None (Presentation layer only) 👉 USER INTERFACE: Displays Income Audit title, Summary section, Filter controls, Refresh button, and complete Income Audit table. 👉 SUMMARY PANEL: Displays Total Payout and Total Record counters for the currently filtered Income Audit dataset. 👉 FILTER PANEL: Provides Income Type selector, User ID search field, and Refresh control for dynamic audit filtering. 👉 AUDIT TABLE: Displays Date, User, Income Type, Amount, Source User, and Transaction Note for each audited income record. 👉 LAYOUT: Enterprise card-based dashboard with separated Summary, Filter, and Audit Reporting sections. 👉 CONTROLLER INTEGRATION: Business logic including authentication, filtering, audit retrieval, total calculations, and rendering is delegated to admin_income_audit_controller.js. 👉 SECURITY: Dashboard authorization and session validation are enforced entirely through the associated controller and centralized session authority. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Income Audit Dashboard Interface providing production-grade financial audit visualization, summary reporting, filtering controls, centralized controller integration, and structured administrative income monitoring. Repository note: The supplied file name is admin_income_audit_controller.js, but its contents are HTML for the Income Audit Dashboard.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
👉 REPOSITORY FILE: admin_income_dashboard.html 👉 KNOWLEDGE BASE: KB_018 👉 LAYER: Admin → Income Management Layer 👉 CATEGORY: Income Dashboard Interface 👉 PURPOSE: Provides the primary Administrator Income Dashboard interface for viewing income transactions, monitoring payout summaries, filtering income records, and reviewing financial activity. 👉 POSITION: Admin → Financial Management → Income Dashboard 👉 LOADED BY: Admin Dashboard Navigation 👉 ENTRY FUNCTION: HTML Document Initialization (Controller handled by admin_income_dashboard.js) 👉 DEPENDENCIES: core_boot_manager.js, core_initializer.js, core_session_authority.js, admin_income_dashboard.js 👉 GLOBAL EXPORTS: None (Presentation layer only) 👉 USER INTERFACE: Displays Income Dashboard header, Income Type Filter, Refresh button, Total Income summary, Total Record count, and Income Transaction table. 👉 SUMMARY PANEL: Displays dynamically updated Total Income amount and Total Record statistics generated by the controller. 👉 FILTER PANEL: Provides Income Type selection supporting All, Upgrade, Repurchase, and CTOR transaction filtering. 👉 INCOME TABLE: Displays Time, User ID, Income Type, Amount, Source User, and Transaction Note for every recorded income transaction. 👉 LAYOUT: Enterprise card-based financial dashboard with dedicated Control, Summary, and Transaction Reporting sections. 👉 CONTROLLER INTEGRATION: Authentication, authorization, data retrieval, filtering, calculations, rendering, and dashboard refresh operations are managed by admin_income_dashboard.js. 👉 SECURITY: Dashboard access and session validation are enforced through centralized session authority and the associated dashboard controller. 👉 STATUS: ✅ VERIFIED 👉 REMARKS: Enterprise Income Dashboard Interface providing production-grade financial monitoring, centralized controller integration, structured income reporting, transaction filtering, summary visualization, and repository-aligned administrative income management.

