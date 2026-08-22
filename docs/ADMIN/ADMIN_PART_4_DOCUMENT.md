KB_011 — ACTUAL REPOSITORY DATA PLACEMENT

MODULE: ADMIN
KB: KB_011
FILE: admin_franchise_authority.js
FILE TYPE: JavaScript Authority/Controller
PRIMARY ROLE: Franchise Request Monitoring and Admin Approval/Rejection Control

01. FUNCTION
    5 named functions + 1 anonymous DOMContentLoaded callback

02. FUNCTION NAME
    loadFranchiseRequests()
    approveFranchise()
    rejectFranchise()
    resetUserPassword()
    bindFranchiseAuthorityEvents()
    Anonymous DOMContentLoaded callback

03. FUNCTION LOCATION
    All local functions are defined in KB_011.

04. FUNCTION ROLE
    Franchise request loading/display
    Franchise request approval
    Franchise request rejection
    Password-reset request placeholder
    Authority-page event binding

05. FUNCTION OWNER
    KB_011 contains the local functions.

06. FUNCTION CALLER
    DOMContentLoaded
      → bindFranchiseAuthorityEvents()

    bindFranchiseAuthorityEvents()
      → loadFranchiseRequests()

    UI buttons / inline onclick
      → approveFranchise()
      → rejectFranchise()

    refreshBtn
      → loadFranchiseRequests()

    resetPasswordBtn
      → resetUserPassword()

07. FUNCTION CALLEE
    loadFranchiseRequests()
      → getFranchiseRequests()

    approveFranchise()
      → approveFranchiseRequest()
      → loadFranchiseRequests()

    rejectFranchise()
      → rejectFranchiseRequest()
      → loadFranchiseRequests()

08. FUNCTION DUPLICATE DATA
    Not established in FIRST DOCUMENTS phase.

09. FUNCTION EXPORT
    window.loadFranchiseRequests
    window.approveFranchise
    window.rejectFranchise
    window.resetUserPassword

10. RULE
    Franchise requests are displayed with request ID,
    user ID and status.
    Approval and rejection actions are available.

11. RULE LOCATION
    loadFranchiseRequests()
    approveFranchise()
    rejectFranchise()

12. AUTHORITY
    Admin franchise approval/rejection actions are exposed
    through KB_011.
    Actual request mutation authority is external.

13. AUTHORITY LOCATION
    Local:
    approveFranchise()
    rejectFranchise()

    External:
    approveFranchiseRequest()
    rejectFranchiseRequest()

14. DEPENDENCY
    getFranchiseRequests()
    approveFranchiseRequest()
    rejectFranchiseRequest()
    DOM requestList
    DOM refreshBtn
    DOM resetPasswordBtn

15. DEPENDENCY OWNER
    External function owners are not established from KB_011 alone.

16. DEPENDENCY DIRECTION
    KB_011
      → franchise request functions
      → UI DOM elements

17. FILE ROLE
    Admin Franchise Authority.

18. MODULE
    ADMIN

19. MODULE RELATION
    Franchise request monitoring
    → approval/rejection controls.

20. CROSS-MODULE RELATION
    Franchise request data and mutation authorities
    are external to KB_011.

21. FLOW
    DOMContentLoaded
      → bindFranchiseAuthorityEvents()
      → loadFranchiseRequests()
      → getFranchiseRequests()

    Approve
      → approveFranchise()
      → approveFranchiseRequest()
      → reload requests

    Reject
      → rejectFranchise()
      → rejectFranchiseRequest()
      → reload requests

22. ENTRY POINT
    DOMContentLoaded
    refreshBtn
    resetPasswordBtn
    approve/reject UI buttons

23. EXIT / REDIRECT
    No navigation or redirect in KB_011.

24. EXECUTION SEQUENCE
    Page load
      → bind events
      → load requests
      → display requests

    User action
      → approve/reject
      → external authority
      → reload requests

25. STATE
    No local persistent state variables.

26. STATE
    Request data exists locally during function execution.

27. STATE MUTATION
    No local persistent state mutation.

28. DATA
    Franchise request records.

29. DATA FIELDS READ
    request.id
    request.userId
    request.status

30. DATA SOURCE
    getFranchiseRequests()

31. DATA FILTER
    No explicit filtering.

32. DATA FILTER SOURCE
    None.

33. DATA CLEAR
    No data-clear operation.

34. STORAGE
    No direct storage API.

35. EVENT
    DOMContentLoaded
    refreshBtn click
    resetPasswordBtn click
    approve/reject button actions

36. EVENT HANDLERS
    refreshBtn → loadFranchiseRequests()
    resetPasswordBtn → resetUserPassword()
    approve button → approveFranchise()
    reject button → rejectFranchise()

37. EVENT ACTIONS
    Load requests
    Approve request
    Reject request
    Password-reset request placeholder

38. LOCK
    No explicit lock.

39. SECURITY
    No local authentication/authorization guard
    appears in this file.

40. AUTHENTICATION
    No local authentication function.

41. AUTHORIZATION
    No local role-check function.

42. ACCOUNT STATUS
    No account-status validation.

43. VALIDATION
    No explicit request validation.

44. ERROR HANDLING
    No try/catch block.

45. FAILURE PATH
    Missing requestList → return.
    Missing external request function → empty request list.
    No explicit external-operation error handling.

46. SESSION DESTRUCTION
    None.

47. NAVIGATION
    None.

48. UI DOM TARGETS
    requestList
    refreshBtn
    resetPasswordBtn

49. UI OUTPUT
    requestList.innerHTML

50. ROLE DISPLAY
    No role-class mapping.

51. ROLE VALUES USED
    No explicit role values.

52. LOG ORDER
    Request order returned by getFranchiseRequests().

53. LOG VIEW ACTION
    console.log() for approval/rejection/password reset request.

54. FILTER ACTION
    None.

55. CLEAR ACTION
    None.

56. CONFIRMATION
    None.

57. ALERT
    None.

58. GLOBAL ACCESS
    loadFranchiseRequests
    approveFranchise
    rejectFranchise
    resetUserPassword

59. RELATED FILES
    External request data authority:
    owner of getFranchiseRequests() — NOT YET ESTABLISHED

    External approval authority:
    owner of approveFranchiseRequest() — NOT YET ESTABLISHED

    External rejection authority:
    owner of rejectFranchiseRequest() — NOT YET ESTABLISHED

    UI dependencies:
    requestList
    refreshBtn
    resetPasswordBtn

60. STATUS
    FIRST-DOCUMENT DATA COLLECTION:
    RECORDED

    PROBLEM/SOLUTION:
    NOT ANALYZED IN THIS PHASE


FIRST-DOCUMENT FUNCTION REGISTER — KB_011

F001
loadFranchiseRequests()
Role: Loads and renders franchise requests
Owner: KB_011

F002
approveFranchise()
Role: Triggers franchise request approval and reloads requests
Owner: KB_011

F003
rejectFranchise()
Role: Triggers franchise request rejection and reloads requests
Owner: KB_011

F004
resetUserPassword()
Role: Password-reset request placeholder
Owner: KB_011

F005
bindFranchiseAuthorityEvents()
Role: Binds refresh/reset events and loads requests
Owner: KB_011

F006
Anonymous DOMContentLoaded callback
Role: Starts authority-page event binding
Owner: KB_011


EXTERNAL FUNCTION REFERENCE

E001
getFranchiseRequests()
Role: Supplies franchise request records
Owner: NOT YET ESTABLISHED

E002
approveFranchiseRequest()
Role: Performs franchise request approval
Owner: NOT YET ESTABLISHED

E003
rejectFranchiseRequest()
Role: Performs franchise request rejection
Owner: NOT YET ESTABLISHED


UI DATA PLACEMENT

D001
requestList
Role: Franchise request display

D002
refreshBtn
Role: Request refresh trigger

D003
resetPasswordBtn
Role: Password reset request trigger


KB_011 FIRST DOCUMENT RECORD:
COMPLETE
ADMIN — FIRST DOCUMENTS
PART 1 CONTINUATION
KB_012 — admin_franchise_dashboard.html
FILE TYPE: HTML
ROLE: Admin Franchise Dashboard UI
01 FUNCTION
No named JavaScript functions
02 FUNCTION REFERENCES
admin_franchise_dashboard_controller.js
03 FUNCTION LOCATION
UI structure → KB_012
Behavior → admin_franchise_dashboard_controller.js
04 FUNCTION ROLE
Franchise dashboard shell
Profile display
System status display
User-list display
Logout trigger
05 FUNCTION OWNER
UI → KB_012
Dashboard behavior → external controller
06 FUNCTION CALLER
Browser page load
07 FUNCTION CALLEE
admin_franchise_dashboard_controller.js
08 DUPLICATE DATA
Not established
09 EXPORT
None
10 RULE
Dashboard requires franchise dashboard controller
11 RULE LOCATION
External controller
12 AUTHORITY
Core/session scripts
13 AUTHORITY REFERENCES
core_boot_manager.js
core_initializer.js
core_session_authority.js
14 DEPENDENCIES
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_franchise_dashboard_controller.js
15 DEPENDENCY OWNER
Repository-wide mapping required
16 DEPENDENCY DIRECTION
KB_012 → Core + dashboard controller
17 FILE ROLE
Admin franchise dashboard UI
18 MODULE
ADMIN
19 MODULE RELATION
Franchise dashboard
20 CROSS-MODULE RELATION
Core / Session / User / Franchise
21 FLOW
HTML load
→ Core scripts
→ dashboard controller
→ dashboard rendering
22 ENTRY POINT
HTML page load
23 EXIT / NAVIGATION
Controller-dependent
24 EXECUTION SEQUENCE
Load → Core → Controller → Profile/System/Users
25 STATE
DOM dashboard state
26 STATE
profile
system
userList
27 STATE MUTATION
Controller updates DOM targets
28 DATA
Profile
System status
Users under franchise
29 DATA FIELDS
profile
system
userList
30 DATA SOURCE
Dashboard controller
31 DATA FILTER
Dashboard controller
32 FILTER SOURCE
Dashboard controller
33 DATA CLEAR
Dashboard controller
34 STORAGE
No direct storage API in KB_012
35 EVENT
logoutBtn
36 EVENT HANDLERS
logout
37 EVENT ACTIONS
Logout
38 LOCK
Not present in HTML
39 SECURITY
Depends on controller/Core
40 AUTHENTICATION
Dashboard controller/Core session
41 AUTHORIZATION
Dashboard controller/Core
42 ACCOUNT STATUS
Dashboard controller
43 VALIDATION
Dashboard controller
44 ERROR HANDLING
Dashboard controller
45 FAILURE PATH
Dashboard controller
46 SESSION DESTRUCTION
Dashboard controller
47 NAVIGATION
Controller-dependent
48 DOM TARGETS
logoutBtn
profile
system
userList
49 UI OUTPUT
Profile
System Status
Users Under You
50 ROLE DISPLAY
ADMIN FRANCHISE DASHBOARD title
51 ROLE VALUES
Not directly defined in HTML
52 LOG ORDER
Not directly defined
53 LOG VIEW ACTION
Not directly defined
54 FILTER ACTION
Not directly defined
55 CLEAR ACTION
Not directly defined
56 CONFIRMATION
Not directly defined
57 ALERT
Not directly defined
58 GLOBAL ACCESS
Controller-dependent
59 RELATED FILES
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_franchise_dashboard_controller.js
60 STATUS
FIRST-DOCUMENT DATA RECORDED
ADMIN PART 1 INDEX
KB_001 → admin_activity_audit_controller.js
KB_002 → admin_activity_audit_dashboard.html
KB_003 → admin_auth.html
KB_004 → admin_auth.js
KB_005 → admin_dashboard.html
KB_006 → admin_dashboard_controller.js
KB_007 → admin_escrow_control_authority.js
KB_008 → admin_franchise_auth.html
KB_009 → admin_franchise_auth_controller.js
KB_010 → admin_franchise_authority.html
KB_011 → admin_franchise_authority.js
KB_012 → admin_franchise_dashboard.html
STATUS:
KB_012 actual supplied repository data placement recorded.
No problem analysis.
No solution.
No code change.
No ownership decision.
NEXT: KB_013
KB_013 — FIRST DOCUMENTS
FILE: admin_franchise_dashboard_controller.js
MODULE: ADMIN
FILE TYPE: JavaScript Controller

01. FUNCTION
    11 named functions + 1 anonymous DOMContentLoaded callback

02. FUNCTION NAME
    initPage()
    redirectLogin()
    authPage()
    bindEvents()
    loadPage()
    renderProfile()
    loadSystem()
    loadUsers()
    logout()

03. FUNCTION LOCATION
    All named functions are in KB_013

04. FUNCTION ROLE
    Franchise dashboard initialization,
    authentication, event binding,
    profile display, system-status display,
    user/downline display, refresh, logout

05. FUNCTION OWNER
    KB_013 contains the functions

06. FUNCTION CALLER
    DOMContentLoaded → initPage()
    DOMContentLoaded → authPage()
    DOMContentLoaded → bindEvents()
    DOMContentLoaded → loadPage()
    loadPage() → renderProfile()
    loadPage() → loadSystem()
    loadPage() → loadUsers()

07. FUNCTION CALLEE
    authPage() → getSession()
    authPage() → getCurrentUser()
    authPage() → hasRole()
    authPage() → getSystemSettings()
    authPage() → redirectLogin()
    loadPage() → renderProfile()
    loadPage() → loadSystem()
    loadPage() → loadUsers()
    loadPage() → logActivity()
    loadSystem() → getSystemSettings()
    loadUsers() → getUsers()
    logout() → clearInterval()
    logout() → logActivity()
    logout() → redirectLogin()

08. FUNCTION DUPLICATE DATA
    Not established from KB_013 alone

09. FUNCTION EXPORT
    No window exports present

10. RULE
    Franchise dashboard requires valid franchise access

11. RULE LOCATION
    authPage()

12. AUTHORITY
    Session, current-user, role and system-settings functions

13. AUTHORITY LOCATION
    External references:
    getSession()
    getCurrentUser()
    hasRole()
    getSystemSettings()
    destroySession()

14. DEPENDENCY
    getSession()
    getCurrentUser()
    hasRole()
    getSystemSettings()
    destroySession()
    getUsers()
    logActivity()

15. DEPENDENCY OWNER
    Not established from KB_013 alone

16. DEPENDENCY DIRECTION
    KB_013 → Core/session/user/system/activity functions

17. FILE ROLE
    Admin Franchise Dashboard Controller

18. MODULE
    ADMIN

19. MODULE RELATION
    Franchise authentication → franchise dashboard

20. CROSS-MODULE RELATION
    Core/session/user/system settings/activity functions

21. FLOW
    DOMContentLoaded
    → initPage()
    → authPage()
    → bindEvents()
    → loadPage()
    → renderProfile()
    → loadSystem()
    → loadUsers()

22. ENTRY POINT
    DOMContentLoaded callback

23. EXIT / REDIRECT
    redirectLogin()
    → admin_franchise_auth.html

24. EXECUTION SEQUENCE
    Page load → authentication → event binding
    → profile/system/users → activity logging
    → periodic refresh

25. STATE
    session

26. STATE
    currentUser

27. STATE
    lock
    refreshTimer

28. DATA
    Current franchise user
    System settings
    Users/downline

29. DATA FIELDS READ
    session.userId
    currentUser.userId
    currentUser.username
    currentUser.role
    currentUser.status
    currentUser.accountStatus
    user.introducerId
    user.userId
    user.username
    user.isActive
    user.wallet

30. DATA SOURCE
    getSession()
    getCurrentUser()
    getSystemSettings()
    getUsers()

31. DATA FILTER
    Users filtered by:
    introducerId === currentUser.userId

32. DATA FILTER SOURCE
    getUsers()

33. DATA CLEAR
    refreshTimer cleared during logout

34. STORAGE
    No direct storage API in KB_013

35. EVENT
    DOMContentLoaded
    logoutBtn click

36. EVENT HANDLERS
    logoutBtn → logout()

37. EVENT ACTIONS
    Logout
    Dashboard loading
    Periodic system/user refresh

38. LOCK
    lock
    Prevents repeated logout execution

39. SECURITY
    Session existence check
    Current-user existence check
    Franchise role check
    Account-status check
    Franchise-access setting check

40. AUTHENTICATION
    getSession()
    getCurrentUser()

41. AUTHORIZATION
    hasRole("franchise")

42. ACCOUNT STATUS
    currentUser.accountStatus
    currentUser.status

43. VALIDATION
    Session/user/role/status/franchise-access checks

44. ERROR HANDLING
    No explicit try/catch in KB_013

45. FAILURE PATH
    redirectLogin()
    → destroySession()
    → admin_franchise_auth.html

46. SESSION DESTRUCTION
    destroySession()

47. NAVIGATION
    admin_franchise_auth.html

48. UI DOM TARGETS
    logoutBtn
    profile
    system
    userList

49. UI OUTPUT
    Profile
    System status
    Downline users

50. ROLE DISPLAY
    currentUser.role used for activity logging

51. ROLE VALUES USED
    franchise

52. REFRESH
    setInterval()
    4000 ms

53. LOG ACTION
    "Opened dashboard"

54. USER DATA DISPLAY
    ID
    Name
    Status
    Wallet

55. LOGOUT ACTION
    "Logout"

56. SYSTEM SETTINGS DISPLAY
    registrationOpen
    franchiseAccess
    lockMode
    queueStop
    withdrawStop

57. DOWNLINE RELATION
    user.introducerId === currentUser.userId

58. TIMER
    refreshTimer = setInterval(...)
    clearInterval(refreshTimer)

59. RELATED FILES
    admin_franchise_dashboard.html
    admin_franchise_auth.html
    core_boot_manager.js
    core_initializer.js
    core_session_authority.js
    External function owner files not established yet

60. STATUS
    FIRST-DOCUMENT DATA COLLECTION:
    RECORDED

    PROBLEM/SOLUTION:
    NOT ANALYZED IN THIS PHASE

FUNCTION REGISTER — KB_013

F001
initPage()
Role: Dashboard initialization placeholder
Location: KB_013

F002
redirectLogin()
Role: Session destruction and franchise-login redirect
Location: KB_013

F003
authPage()
Role: Franchise authentication and access validation
Location: KB_013

F004
bindEvents()
Role: Logout event binding
Location: KB_013

F005
loadPage()
Role: Dashboard content loading and refresh setup
Location: KB_013

F006
renderProfile()
Role: Current franchise profile display
Location: KB_013

F007
loadSystem()
Role: System settings/status display
Location: KB_013

F008
loadUsers()
Role: Direct-downline user loading and display
Location: KB_013

F009
logout()
Role: Logout, activity logging and redirect
Location: KB_013

F010
Anonymous DOMContentLoaded callback
Role: Dashboard startup trigger
Location: KB_013

EXTERNAL FUNCTION REFERENCES

E001 → getSession()
E002 → getCurrentUser()
E003 → hasRole()
E004 → getSystemSettings()
E005 → destroySession()
E006 → logActivity()
E007 → getUsers()

KB_013 FIRST DOCUMENT RECORD: COMPLETE.

NEXT ADMIN FILE:
KB_014

NO PRACTICAL PROBLEM/SOLUTION ANALYSIS IN THIS PHASE.
