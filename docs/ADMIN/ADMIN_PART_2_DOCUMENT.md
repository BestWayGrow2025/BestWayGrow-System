KB_005 — admin_dashboard.html

MODULE: ADMIN
KB: KB_005
FILE TYPE: HTML Dashboard
PRIMARY ROLE: Admin Dashboard UI

01. FUNCTION
No local named JavaScript functions
02. FUNCTION NAME
No local functions
03. FUNCTION LOCATION
No functions in KB_005; behavior is external
04. FUNCTION ROLE
Provides Admin dashboard UI, navigation controls,
welcome display, logout control and main content area
05. FUNCTION OWNER
Dashboard UI → KB_005
Dashboard behavior → admin_dashboard_controller.js
Session authority → core_session_authority.js
06. FUNCTION CALLER
Browser page load
admin_dashboard_controller.js handles UI actions
07. FUNCTION CALLEE
No local functions
External controller functions are loaded from
admin_dashboard_controller.js
08. DUPLICATE DATA
No local data storage
09. FUNCTION EXPORT
None
10. RULE
Admin dashboard UI is controlled by the dashboard controller
and Core session layer
11. RULE LOCATION
External controller/Core
12. AUTHORITY
Dashboard behavior → admin_dashboard_controller.js
Session → core_session_authority.js
13. AUTHORITY LOCATION
admin_dashboard_controller.js
core_session_authority.js
14. DEPENDENCY
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_dashboard_controller.js
15. DEPENDENCY OWNER
Boot → core_boot_manager.js
Initialization → core_initializer.js
Session → core_session_authority.js
Dashboard behavior → admin_dashboard_controller.js
16. DEPENDENCY DIRECTION
KB_005 → Core + Admin dashboard controller
17. FILE ROLE
Admin dashboard interface
18. MODULE
ADMIN
19. MODULE RELATION
KB_004 admin_auth.js
→ KB_005 admin_dashboard.html
20. CROSS-MODULE RELATION
Dashboard provides navigation toward Users, PIN, Wallet,
Income, System and Reports areas
21. FLOW
Page load
→ Core scripts
→ dashboard controller
→ dashboard UI
22. ENTRY POINT
HTML page load
23. EXIT / NAVIGATION
Controlled by admin_dashboard_controller.js
24. EXECUTION SEQUENCE
Boot
→ Core initialization
→ Session authority
→ Dashboard controller
→ Dashboard interaction
25. STATE
No local JavaScript state
26. UI STATE
welcome
mainContent
27. STATE MUTATION
External dashboard controller
28. DATA
Admin welcome information
Dashboard page/content state
29. DATA FIELDS
welcome
mainContent
data-page
30. DATA SOURCE
External dashboard controller/session authority
31. DATA FILTER
No local filter
32. DATA FILTER SOURCE
None
33. DATA CLEAR
No local data clearing
34. STORAGE
No direct storage API
35. EVENT
Dashboard button interactions
Logout interaction
36. EVENT HANDLERS
logoutBtn
Menu buttons with data-page values
37. EVENT ACTIONS
Logout
Home
Users
PIN
Wallet
Income
System
Reports
38. LOCK
No explicit lock
39. SECURITY
Session authority script is loaded
Dashboard access behavior is external
40. AUTHENTICATION
External Core session authority/controller
41. AUTHORIZATION
External dashboard/session authority
42. ACCOUNT STATUS
External session/controller
43. VALIDATION
External controller/session layer
44. ERROR HANDLING
No local JavaScript error handling
45. FAILURE PATH
External controller
46. SESSION DESTRUCTION
Triggered by logout control through external controller
47. NAVIGATION
Dashboard module menu:
home
users
pinmaster
wallet
income
system
reports
48. UI DOM TARGETS
welcome
logoutBtn
mainContent
menu buttons
49. UI OUTPUT
#mainContent
#welcome
50. ROLE DISPLAY
Dashboard is explicitly Admin UI
51. ROLE VALUES
No role values stored locally
52. LOG ORDER
Not defined in HTML
53. LOG VIEW ACTION
Not defined in HTML
54. FILTER ACTION
Not applicable
55. CLEAR ACTION
Not defined
56. CONFIRMATION
Not defined
57. ALERT
Not defined
58. GLOBAL ACCESS
No local global functions
59. RELATED FILES
KB_004 — admin_auth.js
admin_dashboard_controller.js
core_boot_manager.js
core_initializer.js
core_session_authority.js
60. STATUS
FIRST-DOCUMENT DATA PLACEMENT: RECORDED
PROBLEM/SOLUTION: NOT ANALYZED

UI REGISTER

UI001 → welcome → Admin welcome display → KB_005
UI002 → logoutBtn → Logout control → KB_005
UI003 → mainContent → Dynamic dashboard content → KB_005

MENU REGISTER

M001 → home → Home dashboard
M002 → users → User management
M003 → pinmaster → PIN management
M004 → wallet → Wallet
M005 → income → Income
M006 → system → System
M007 → reports → Reports

All menu controls are located in KB_005.

SCRIPT REGISTER

S001 → core_boot_manager.js → Core boot dependency
S002 → core_initializer.js → Core initialization dependency
S003 → core_session_authority.js → Session dependency
S004 → admin_dashboard_controller.js → Dashboard behavior controller

END KB_005
KB_006 — admin_dashboard_controller.js

MODULE: ADMIN
KB: KB_006
FILE TYPE: JavaScript Controller
PRIMARY ROLE: Admin Dashboard Controller

01. FUNCTION
18 named functions + anonymous callbacks

02. FUNCTION NAME
F001 startAdminDashboard()
F002 initPage()
F003 checkAuth()
F004 redirectLogin()
F005 bindEvents()
F006 startAutoRefresh()
F007 loadHome()
F008 loadUsers()
F009 renderUsers()
F010 loadPinsUI()
F011 loadWalletSafe()
F012 loadIncomeSafe()
F013 loadSystemSafe()
F014 loadReportsSafe()
F015 showPlaceholder()
F016 openAdminTreeView()
F017 getAdminFullTree()
F018 logout()

03. FUNCTION LOCATION
All named functions are in KB_006

04. FUNCTION ROLE
Dashboard startup, Core initialization, admin authentication,
navigation, module loading, user rendering, auto-refresh,
tree access, logout and UI placeholder handling

05. FUNCTION OWNER
Dashboard controller → KB_006
Session → core_session_authority.js
User data → external user authority
Tree → external tree authority
Module implementations → respective module authorities

06. FUNCTION CALLER
DOMContentLoaded → startAdminDashboard()
startAdminDashboard() → initPage()
startAdminDashboard() → checkAuth()
startAdminDashboard() → bindEvents()
startAdminDashboard() → loadHome()
startAdminDashboard() → startAutoRefresh()

Menu buttons → module loader functions
logoutBtn → logout()

07. FUNCTION CALLEE
startAdminDashboard()
→ initPage()
→ checkAuth()
→ bindEvents()
→ loadHome()
→ startAutoRefresh()

checkAuth()
→ getSession()
→ getUserById()
→ redirectLogin()

redirectLogin()
→ logoutSession()

loadHome()
→ getUsers()

loadUsers()
→ renderUsers()

getAdminFullTree()
→ getAdminTreeView()

08. DUPLICATE DATA
No local user storage.
User data is retrieved through getUsers().

09. FUNCTION EXPORT
window.startAdminDashboard
window.loadHome
window.loadUsers
window.renderUsers
window.loadPinsUI
window.logout
window.openAdminTreeView
window.getAdminFullTree

10. RULE
Dashboard requires an authenticated admin session.

11. RULE LOCATION
checkAuth()

12. AUTHORITY
Session authority is external.
User lookup is external.
Tree authority is external.

13. AUTHORITY LOCATION
getSession()
logoutSession()
getUserById()
getUsers()
getAdminTreeView()

14. DEPENDENCY
initCoreSystem()
getSession()
getUserById()
logoutSession()
getUsers()
renderUsers()
getAdminTreeView()

15. DEPENDENCY OWNER
Core initialization → Core
Session → Core session authority
User lookup → User authority
Tree lookup → Tree authority

16. DEPENDENCY DIRECTION
KB_006 → Core + User + Tree + downstream modules

17. FILE ROLE
Admin dashboard orchestration/controller

18. MODULE
ADMIN

19. MODULE RELATION
KB_005 admin_dashboard.html
↕
KB_006 admin_dashboard_controller.js

20. CROSS-MODULE RELATION
ADMIN → USER
ADMIN → PIN
ADMIN → WALLET
ADMIN → INCOME
ADMIN → SYSTEM
ADMIN → REPORTS
ADMIN → TREE
ADMIN → CORE SESSION

21. FLOW
DOMContentLoaded
→ startAdminDashboard()
→ init
→ authentication
→ event binding
→ Home
→ auto-refresh

22. ENTRY POINT
DOMContentLoaded → startAdminDashboard()

23. EXIT / REDIRECT
Authentication failure
→ redirectLogin()
→ admin_auth.html

24. EXECUTION SEQUENCE
1. Core initialization
2. Session check
3. Admin user lookup
4. Welcome display
5. Event binding
6. Home loading
7. Auto-refresh
8. Module navigation

25. STATE
adminUser
clickLock
menuBound
dashboardAutoRefresh

26. STATE VALUES
adminUser → current admin
clickLock → true/false
menuBound → true/false
dashboardAutoRefresh → interval handle

27. STATE MUTATION
checkAuth() → adminUser
bindEvents() → menuBound
menu click → clickLock
startAutoRefresh() → dashboardAutoRefresh

28. DATA
Admin session
Admin user
User list
Tree data
Dashboard content

29. DATA FIELDS READ
session.userId
session.role
user.userId
user.username
user.role
data-page

30. DATA SOURCE
getSession()
getUserById()
getUsers()
getAdminTreeView()

31. DATA FILTER
User list → role === "user"
Dashboard count → role === "user"

32. DATA FILTER SOURCE
getUsers() result

33. DATA CLEAR
Auto-refresh interval cleared before recreation
Redirect clears auto-refresh interval

34. STORAGE
No direct persistent storage

35. EVENT
DOMContentLoaded
logout click
menu button clicks
5-second auto-refresh interval

36. EVENT HANDLERS
logoutBtn
.menu button
DOMContentLoaded

37. EVENT ACTIONS
logout()
loadHome()
loadUsers()
loadPinsUI()
loadWalletSafe()
loadIncomeSafe()
loadSystemSafe()
loadReportsSafe()

38. LOCK
clickLock prevents repeated menu clicks
menuBound prevents duplicate event binding

39. SECURITY
Session role check
Admin role required
Failed authentication redirects to login
Logout clears session through logoutSession()

40. AUTHENTICATION
getSession()

41. AUTHORIZATION
session.role === "admin"

42. ACCOUNT STATUS
Fallback admin object uses status "active"
No explicit retrieved-admin status validation here

43. VALIDATION
Session existence
Admin role
Admin user lookup/fallback

44. ERROR HANDLING
Authentication failure throws Error after redirect
Missing DOM targets are safely ignored
Missing external functions use fallbacks

45. FAILURE PATH
Invalid session
→ redirectLogin()
→ logoutSession()
→ admin_auth.html

Missing user
→ fallback admin object

Missing module implementation
→ placeholder UI

46. SESSION DESTRUCTION
logoutSession() through redirectLogin()

47. NAVIGATION
admin_auth.html
Module routes represented by data-page:
home
users
pinmaster
wallet
income
system
reports

48. UI DOM TARGETS
welcome
logoutBtn
mainContent
.menu button
.userTableBody

49. UI OUTPUT
Welcome message
Dashboard overview
User table
Module placeholders

50. ROLE DISPLAY
Welcome uses admin username/userId

51. ROLE VALUES
admin
user

52. LOG ORDER
No direct activity log call in this file

53. LOG VIEW ACTION
None

54. FILTER ACTION
User display filters:
u.role === "user"

55. CLEAR ACTION
No user-data clearing

56. CONFIRMATION
None

57. ALERT
None

58. GLOBAL ACCESS
Selected controller functions exported through window

59. RELATED FILES
KB_005 — admin_dashboard.html
KB_004 — admin_auth.js
core_boot_manager.js
core_initializer.js
core_session_authority.js
User authority containing getUsers()
User authority containing getUserById()
Tree authority containing getAdminTreeView()
Downstream PIN module
Downstream Wallet module
Downstream Income module
Downstream System module
Downstream Reports module

60. STATUS
FIRST-DOCUMENT DATA PLACEMENT: RECORDED
PROBLEM/SOLUTION: NOT ANALYZED

FUNCTION REGISTER

F001 → startAdminDashboard() → Dashboard startup → KB_006
F002 → initPage() → Core initialization trigger → KB_006
F003 → checkAuth() → Admin session/role verification → KB_006
F004 → redirectLogin() → Session logout + login redirect → KB_006
F005 → bindEvents() → Dashboard event binding → KB_006
F006 → startAutoRefresh() → Periodic dashboard refresh → KB_006
F007 → loadHome() → Dashboard overview → KB_006
F008 → loadUsers() → User-list UI creation → KB_006
F009 → renderUsers() → User table rendering → KB_006
F010 → loadPinsUI() → PIN module placeholder → KB_006
F011 → loadWalletSafe() → Wallet module placeholder → KB_006
F012 → loadIncomeSafe() → Income module placeholder → KB_006
F013 → loadSystemSafe() → System module placeholder → KB_006
F014 → loadReportsSafe() → Reports module placeholder → KB_006
F015 → showPlaceholder() → Module loading placeholder → KB_006
F016 → openAdminTreeView() → Tree module placeholder → KB_006
F017 → getAdminFullTree() → Admin tree retrieval bridge → KB_006
F018 → logout() → Dashboard logout trigger → KB_006

EXTERNAL FUNCTION REGISTER

E001 → initCoreSystem() → Core initialization
E002 → getSession() → Session retrieval
E003 → getUserById() → User retrieval
E004 → logoutSession() → Session termination
E005 → getUsers() → User collection retrieval
E006 → getAdminTreeView() → Tree retrieval

UI/MODULE REGISTER

M001 → home → loadHome()
M002 → users → loadUsers()
M003 → pinmaster → loadPinsUI()
M004 → wallet → loadWalletSafe()
M005 → income → loadIncomeSafe()
M006 → system → loadSystemSafe()
M007 → reports → loadReportsSafe()
M008 → tree → openAdminTreeView()

END KB_006
KB_007 — admin_escrow_control_authority.js

MODULE: ADMIN
KB: KB_007
FILE TYPE: JavaScript Authority
PRIMARY ROLE: Admin Escrow Control Authority

01. FUNCTION
7 named functions

02. FUNCTION NAME
F019 verifyAdminAuthority()
F020 loadEscrowAdminPanel()
F021 approveEscrow()
F022 rejectEscrow()
F023 logEscrowAction()
F024 safeHtml()

03. FUNCTION LOCATION
All named functions are in KB_007

04. FUNCTION ROLE
Admin authorization, escrow loading, approval/rejection,
audit logging and HTML-safe output

05. FUNCTION OWNER
Admin escrow authority → KB_007
Session → Core session authority
Escrow data/status → Escrow authority
Activity logging → Activity authority

06. FUNCTION CALLER
loadEscrowAdminPanel() → verifyAdminAuthority()
approveEscrow() → verifyAdminAuthority()
rejectEscrow() → verifyAdminAuthority()
approveEscrow()/rejectEscrow() → logEscrowAction()
loadEscrowAdminPanel() → safeHtml()

07. FUNCTION CALLEE
verifyAdminAuthority() → getSession()
loadEscrowAdminPanel() → loadEscrows()
approveEscrow() → updateEscrowStatus()
rejectEscrow() → updateEscrowStatus()
logEscrowAction() → logActivity()

08. DUPLICATE DATA
No local escrow storage

09. FUNCTION EXPORT
window.loadEscrowAdminPanel
window.approveEscrow
window.rejectEscrow

10. RULE
Only an authenticated admin may access escrow controls

11. RULE LOCATION
verifyAdminAuthority()

12. AUTHORITY
Admin escrow control authority

13. AUTHORITY LOCATION
KB_007
External:
getSession()
loadEscrows()
updateEscrowStatus()
logActivity()

14. DEPENDENCY
getSession()
loadEscrows()
updateEscrowStatus()
logActivity()
mainContent
admin_auth.html

15. DEPENDENCY OWNER
Session → Core session authority
Escrow loading/status → Escrow authority
Activity logging → Activity authority
UI container → Admin dashboard

16. DEPENDENCY DIRECTION
KB_007 → Core Session + Escrow + Activity

17. FILE ROLE
Admin escrow control authority

18. MODULE
ADMIN

19. MODULE RELATION
Admin Dashboard → Escrow control

20. CROSS-MODULE RELATION
ADMIN → CORE SESSION
ADMIN → ESCROW/PAYOUT/WALLET-related data
ADMIN → ACTIVITY/AUDIT

21. FLOW
Admin dashboard
→ loadEscrowAdminPanel()
→ verifyAdminAuthority()
→ loadEscrows()
→ render escrow rows
→ approve/reject
→ updateEscrowStatus()
→ logEscrowAction()
→ refresh panel

22. ENTRY POINT
loadEscrowAdminPanel()
approveEscrow()
rejectEscrow()

23. EXIT / REDIRECT
Failed admin verification
→ admin_auth.html

24. EXECUTION SEQUENCE
1. Verify admin
2. Load escrow records
3. Render records
4. Admin selects action
5. Verify admin again
6. Update status
7. Log action
8. Reload panel

25. STATE
No persistent local state

26. STATE VALUES
Escrow records are retrieved externally

27. STATE MUTATION
updateEscrowStatus()

28. DATA
Escrow records

29. DATA FIELDS READ
escrowId
userId
amount
status

30. DATA SOURCE
loadEscrows()

31. DATA FILTER
No explicit filter

32. DATA FILTER SOURCE
None

33. DATA CLEAR
No direct clearing

34. STORAGE
No direct storage API

35. EVENT
Approve/reject button actions

36. EVENT HANDLERS
Inline onclick:
approveEscrow()
rejectEscrow()

37. EVENT ACTIONS
Approve → updateEscrowStatus(id,"APPROVED")
Reject → updateEscrowStatus(id,"REJECTED")

38. LOCK
No explicit lock

39. SECURITY
Admin role verification before loading and changing escrow

40. AUTHENTICATION
getSession()

41. AUTHORIZATION
session.role === "admin"

42. ACCOUNT STATUS
No explicit account-status check

43. VALIDATION
Admin session/role validation
safeHtml() for displayed escrow values

44. ERROR HANDLING
Missing external functions are guarded
Missing mainContent is safely ignored

45. FAILURE PATH
Invalid admin
→ redirect admin_auth.html
→ return false

46. SESSION DESTRUCTION
No session destruction in KB_007

47. NAVIGATION
admin_auth.html

48. UI DOM TARGETS
mainContent

49. UI OUTPUT
Escrow table with:
ID
User
Amount
Status
Approve
Reject

50. ROLE DISPLAY
No separate role display

51. ROLE VALUES
admin
APPROVED
REJECTED

52. LOG ORDER
Status update
→ audit log
→ panel reload

53. LOG VIEW ACTION
logEscrowAction()

54. FILTER ACTION
None

55. CLEAR ACTION
None

56. CONFIRMATION
None before approval/rejection

57. ALERT
None

58. GLOBAL ACCESS
loadEscrowAdminPanel
approveEscrow
rejectEscrow

59. RELATED FILES
Admin dashboard controller
core_session_authority.js
Escrow authority containing loadEscrows()
Escrow authority containing updateEscrowStatus()
Activity authority containing logActivity()
Admin authentication page

60. STATUS
FIRST-DOCUMENT DATA PLACEMENT: RECORDED
PROBLEM/SOLUTION: NOT ANALYZED

FUNCTION REGISTER

F019 → verifyAdminAuthority() → Admin authorization → KB_007
F020 → loadEscrowAdminPanel() → Escrow admin panel → KB_007
F021 → approveEscrow() → Approve escrow → KB_007
F022 → rejectEscrow() → Reject escrow → KB_007
F023 → logEscrowAction() → Escrow audit logging → KB_007
F024 → safeHtml() → HTML output sanitization → KB_007

EXTERNAL FUNCTION REGISTER

E007 → getSession() → Session retrieval
E008 → loadEscrows() → Escrow retrieval
E009 → updateEscrowStatus() → Escrow status mutation
E010 → logActivity() → Activity/audit recording

END KB_007
