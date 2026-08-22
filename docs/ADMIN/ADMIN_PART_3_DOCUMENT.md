KB_008 — ACTUAL REPOSITORY DATA PLACEMENT

MODULE: ADMIN
KB: KB_008
FILE: admin_franchise_auth.html
FILE TYPE: HTML
PRIMARY ROLE: Admin Franchise Login UI

01. FUNCTION
    No JavaScript function defined in this HTML file.
    Login action is delegated to admin_franchise_auth_controller.js.

02. FUNCTION NAME
    No local named function.
    External controller handles login.

03. FUNCTION LOCATION
    No function implementation in KB_008.

04. FUNCTION ROLE
    Provides Franchise ID/password inputs and Login UI.

05. FUNCTION OWNER
    UI owner: KB_008
    Login logic owner: admin_franchise_auth_controller.js

06. FUNCTION CALLER
    Login button is handled by external controller.

07. FUNCTION CALLEE
    External controller is loaded:
    admin_franchise_auth_controller.js

08. FUNCTION DUPLICATE DATA
    Not established in FIRST DOCUMENTS phase.

09. FUNCTION EXPORT
    No local JavaScript exports.

10. RULE
    Franchise login page provides required credentials:
    Franchise ID
    Password

11. RULE LOCATION
    UI structure in KB_008.
    Authentication rule is external.

12. AUTHORITY
    Authentication/session authority is external.

13. AUTHORITY LOCATION
    core_session_authority.js is loaded.
    Exact authentication function owner requires repository cross-reference.

14. DEPENDENCY
    core_boot_manager.js
    core_initializer.js
    core_session_authority.js
    admin_franchise_auth_controller.js

15. DEPENDENCY OWNER
    External files listed above.
    Detailed function ownership requires those files.

16. DEPENDENCY DIRECTION
    KB_008
    → Core boot/initializer/session files
    → Admin franchise authentication controller

17. FILE ROLE
    Admin Franchise Login UI.

18. MODULE
    ADMIN

19. MODULE RELATION
    Franchise authentication → Admin session flow.

20. CROSS-MODULE RELATION
    Core session authority is referenced through loaded script.

21. FLOW
    Page load
    → Core scripts load
    → Admin franchise authentication controller loads
    → User enters Franchise ID/password
    → Login controller handles authentication

22. ENTRY POINT
    Login button:
    id="loginBtn"

23. EXIT / REDIRECT
    Not defined in KB_008.
    Redirect behavior belongs to external controller.

24. EXECUTION SEQUENCE
    HTML load
    → Core scripts
    → Session authority
    → Franchise authentication controller

25. STATE
    No local JavaScript state.

26. STATE
    No local JavaScript state variables.

27. STATE MUTATION
    No local state mutation.
    Session mutation is external.

28. DATA
    Franchise login credentials.

29. DATA FIELDS READ
    userId
    password

30. DATA SOURCE
    User-entered form fields.

31. DATA FILTER
    No local filtering.

32. DATA FILTER SOURCE
    No local filtering function.

33. DATA CLEAR
    No local data-clear function.

34. STORAGE
    No direct storage API in KB_008.

35. EVENT
    Login button interaction.

36. EVENT HANDLERS
    loginBtn
    Handler implementation is external.

37. EVENT ACTIONS
    Login request delegated to:
    admin_franchise_auth_controller.js

38. LOCK
    No local lock implementation.

39. SECURITY
    Password field uses:
    type="password"

40. AUTHENTICATION
    Authentication handled externally by:
    admin_franchise_auth_controller.js

41. AUTHORIZATION
    Not implemented locally.

42. ACCOUNT STATUS
    Not implemented locally.

43. VALIDATION
    No local JavaScript validation.
    Validation belongs to external controller.

44. ERROR HANDLING
    No local JavaScript error handling.

45. FAILURE PATH
    Failure UI target:
    id="msg"
    Actual failure handling belongs to controller.

46. SESSION DESTRUCTION
    No local session destruction.

47. NAVIGATION
    No local navigation logic.

48. UI DOM TARGETS
    userId
    password
    loginBtn
    msg

49. UI OUTPUT
    Login status/message target:
    #msg

50. ROLE DISPLAY
    No role display logic.

51. ROLE VALUES USED
    No role values defined locally.

52. LOG ORDER
    No log handling locally.

53. LOG VIEW ACTION
    No activity-log action locally.

54. FILTER ACTION
    No filter action.

55. CLEAR ACTION
    No clear action.

56. CONFIRMATION
    No confirmation logic.

57. ALERT
    No alert logic.

58. GLOBAL ACCESS
    No local window exports.

59. RELATED FILES
    core_boot_manager.js
    core_initializer.js
    core_session_authority.js
    admin_franchise_auth_controller.js

60. STATUS
    FIRST-DOCUMENT DATA COLLECTION:
    RECORDED

    PROBLEM/SOLUTION:
    NOT ANALYZED IN THIS PHASE

FIRST-DOCUMENT FUNCTION REGISTER — KB_008

Local functions:
    None.

External controller:
    admin_franchise_auth_controller.js

LOCAL DATA PLACEMENT SUMMARY:
    Login UI → KB_008
    Franchise ID input → KB_008
    Password input → KB_008
    Login button → KB_008
    Message output → KB_008
    Login logic → admin_franchise_auth_controller.js
    Session authority → core_session_authority.js
    Boot → core_boot_manager.js
    Initialization → core_initializer.js

KB_008 FIRST DOCUMENT RECORD:
COMPLETE
KB_009 — ACTUAL REPOSITORY DATA PLACEMENT

MODULE: ADMIN
KB: KB_009
FILE: admin_franchise_auth_controller.js
FILE TYPE: JavaScript Controller
PRIMARY ROLE: Admin Franchise Authentication Controller

01. FUNCTION
    8 named functions + 1 anonymous DOMContentLoaded callback

02. FUNCTION NAME
    initPage()
    authPage()
    bindEvents()
    loadPage()
    safeDecode()
    login()
    Anonymous DOMContentLoaded callback
    No other named functions defined.

03. FUNCTION LOCATION
    All local functions are defined in KB_009.

04. FUNCTION ROLE
    Page initialization
    Local authentication-page state reset
    Login event binding
    Existing franchise-session check
    Password decoding
    Franchise credential authentication
    Login success navigation

05. FUNCTION OWNER
    KB_009 owns the local functions.

06. FUNCTION CALLER
    DOMContentLoaded
      → initPage()
      → authPage()
      → bindEvents()
      → loadPage()

    bindEvents()
      → login()

    login()
      → safeDecode()

07. FUNCTION CALLEE
    login()
      → safeDecode()

    External function:
    getUsers()

08. FUNCTION DUPLICATE DATA
    No duplicate determination in FIRST DOCUMENTS phase.

09. FUNCTION EXPORT
    No window exports defined.

10. RULE
    Login requires:
    userId
    password
    role = franchise
    active account

11. RULE LOCATION
    login()

12. AUTHORITY
    User lookup authority is external.
    Franchise authentication logic is implemented in KB_009.

13. AUTHORITY LOCATION
    External:
    getUsers()

    Local authentication decision:
    login()

14. DEPENDENCY
    getUsers()
    localStorage
    DOM login fields
    DOM message field
    admin_franchise_dashboard.html

15. DEPENDENCY OWNER
    getUsers() owner is not established from KB_009 alone.

16. DEPENDENCY DIRECTION
    KB_009
      → getUsers()
      → localStorage
      → admin_franchise_dashboard.html

17. FILE ROLE
    Franchise authentication controller.

18. MODULE
    ADMIN

19. MODULE RELATION
    Franchise login
      → Franchise dashboard

20. CROSS-MODULE RELATION
    User data is obtained through external getUsers().

21. FLOW
    DOMContentLoaded
      → initPage()
      → authPage()
      → bindEvents()
      → loadPage()

    Login click
      → login()
      → getUsers()
      → find franchise user
      → password comparison
      → account-status check
      → localStorage session record
      → franchise dashboard

22. ENTRY POINT
    DOMContentLoaded callback
    Login button click

23. EXIT / REDIRECT
    Existing login:
      → admin_franchise_dashboard.html

    Successful login:
      → admin_franchise_dashboard.html

24. EXECUTION SEQUENCE
    Page startup
      → state reset
      → event binding
      → existing franchise login check

    Login
      → input validation
      → user retrieval
      → franchise-role matching
      → password verification
      → active-status check
      → loggedInFranchise storage
      → dashboard redirect

25. STATE
    session

26. STATE
    currentUser

27. STATE MUTATION
    session = null
    currentUser = null
    lock = true / false

28. DATA
    Franchise user record.

29. DATA FIELDS READ
    userId
    password
    role
    status

30. DATA SOURCE
    getUsers()

31. DATA FILTER
    userId
    role
    password
    status

32. DATA FILTER SOURCE
    users.find()

33. DATA CLEAR
    msg.innerText = ""

34. STORAGE
    localStorage

    Key:
    loggedInFranchise

35. EVENT
    DOMContentLoaded
    loginBtn click

36. EVENT HANDLERS
    DOMContentLoaded callback
    loginBtn → login()

37. EVENT ACTIONS
    Startup initialization
    Existing-session check
    Login authentication
    Dashboard navigation

38. LOCK
    lock

    login() prevents concurrent execution while locked.

39. SECURITY
    Password input validation
    Franchise-role validation
    Account-status validation
    Password decoding/comparison
    Login execution lock

40. AUTHENTICATION
    login()

41. AUTHORIZATION
    role must equal:
    franchise

42. ACCOUNT STATUS
    status must equal:
    active

43. VALIDATION
    userId required
    password required
    getUsers() availability
    matching userId
    franchise role
    password match
    active account

44. ERROR HANDLING
    safeDecode() uses try/catch.
    login() uses try/finally for lock restoration.

45. FAILURE PATH
    Missing credentials
    → message

    getUsers unavailable
    → message

    Invalid franchise user/password
    → message

    Inactive account
    → message

46. SESSION DESTRUCTION
    No session-destruction function.
    Page state variables are reset in authPage().

47. NAVIGATION
    admin_franchise_dashboard.html

48. UI DOM TARGETS
    loginBtn
    userId
    password
    msg

49. UI OUTPUT
    msg.innerText

50. ROLE DISPLAY
    No role display UI.

51. ROLE VALUES USED
    franchise

52. LOG ORDER
    No activity-log operation in KB_009.

53. LOG VIEW ACTION
    No log-view action.

54. FILTER ACTION
    users.find() filters by:
    userId
    role
    password

55. CLEAR ACTION
    No application-data clearing.
    Message is cleared before login processing.

56. CONFIRMATION
    No confirmation dialog.

57. ALERT
    No alert.

58. GLOBAL ACCESS
    No window exports.

59. RELATED FILES
    admin_franchise_auth.html
    admin_franchise_dashboard.html
    core_boot_manager.js
    core_initializer.js
    core_session_authority.js
    External owner of getUsers() — to be established from repository.

60. STATUS
    FIRST-DOCUMENT DATA COLLECTION:
    RECORDED

    PROBLEM/SOLUTION:
    NOT ANALYZED IN THIS PHASE

FIRST-DOCUMENT FUNCTION REGISTER — KB_009

F001
initPage()
Role: Page/Core initialization placeholder
Owner: KB_009

F002
authPage()
Role: Resets local authentication-page state
Owner: KB_009

F003
bindEvents()
Role: Binds franchise login button
Owner: KB_009

F004
loadPage()
Role: Checks existing franchise login state
Owner: KB_009

F005
safeDecode()
Role: Decodes stored password value when possible
Owner: KB_009

F006
login()
Role: Franchise credential authentication and dashboard redirect
Owner: KB_009

F007
Anonymous DOMContentLoaded callback
Role: Page startup orchestration
Owner: KB_009

EXTERNAL FUNCTION REFERENCE

E001
getUsers()
Role: Supplies user records
Owner: NOT YET ESTABLISHED

LOCAL STATE

S001
session

S002
currentUser

S003
lock

STORAGE

D001
localStorage key:
loggedInFranchise

RELATED FILE DATA

UI:
admin_franchise_auth.html

SUCCESS DESTINATION:
admin_franchise_dashboard.html

CORE SCRIPT DEPENDENCIES:
core_boot_manager.js
core_initializer.js
core_session_authority.js

KB_009 FIRST DOCUMENT RECORD:
COMPLETE
KB_010 — ACTUAL REPOSITORY DATA PLACEMENT

MODULE: ADMIN
KB: KB_010
FILE: admin_franchise_authority.html
FILE TYPE: Repository content supplied as JavaScript
PRIMARY ROLE: Franchise Authentication Authority Content

01. FUNCTION
    6 named functions + 1 anonymous DOMContentLoaded callback

02. FUNCTION NAME
    initPage()
    authPage()
    bindEvents()
    loadPage()
    safeDecode()
    login()
    Anonymous DOMContentLoaded callback

03. FUNCTION LOCATION
    All supplied functions are contained in KB_010.

04. FUNCTION ROLE
    Page initialization
    Authentication-page state reset
    Login event binding
    Existing franchise login check
    Password decoding
    Franchise authentication

05. FUNCTION OWNER
    KB_010 contains all supplied functions.

06. FUNCTION CALLER
    DOMContentLoaded
      → initPage()
      → authPage()
      → bindEvents()
      → loadPage()

    bindEvents()
      → login()

    login()
      → safeDecode()

07. FUNCTION CALLEE
    login()
      → safeDecode()
      → getUsers()

08. FUNCTION DUPLICATE DATA
    Duplicate status is not determined in FIRST DOCUMENTS phase.

09. FUNCTION EXPORT
    No window exports.

10. RULE
    Login requires valid user ID and password.
    Matching user must have role "franchise".
    Matching account must be active.

11. RULE LOCATION
    login()

12. AUTHORITY
    Local authentication decision is in login().
    User data is supplied by external getUsers().

13. AUTHORITY LOCATION
    Local:
    KB_010 → login()

    External:
    getUsers() → owner not established yet.

14. DEPENDENCY
    getUsers()
    localStorage
    atob()
    DOM elements
    admin_franchise_dashboard.html

15. DEPENDENCY OWNER
    getUsers() owner not established from supplied file.

16. DEPENDENCY DIRECTION
    KB_010
      → getUsers()
      → localStorage
      → admin_franchise_dashboard.html

17. FILE ROLE
    Franchise authentication content.

18. MODULE
    ADMIN

19. MODULE RELATION
    Franchise authentication → franchise dashboard.

20. CROSS-MODULE RELATION
    User data dependency through getUsers().

21. FLOW
    DOMContentLoaded
      → initialization
      → state reset
      → event binding
      → existing login check

    Login
      → input read
      → validation
      → getUsers()
      → franchise match
      → password match
      → active-status check
      → localStorage write
      → dashboard redirect

22. ENTRY POINT
    DOMContentLoaded
    login()

23. EXIT / REDIRECT
    admin_franchise_dashboard.html

24. EXECUTION SEQUENCE
    Startup → authentication-page setup → login event → authentication → dashboard.

25. STATE
    session

26. STATE
    currentUser

27. STATE MUTATION
    session = null
    currentUser = null
    lock = true / false

28. DATA
    Franchise user record.

29. DATA FIELDS READ
    userId
    password
    role
    status

30. DATA SOURCE
    getUsers()

31. DATA FILTER
    userId
    role
    password

32. DATA FILTER SOURCE
    users.find()

33. DATA CLEAR
    msg.innerText = ""

34. STORAGE
    localStorage
    Key: loggedInFranchise

35. EVENT
    DOMContentLoaded
    loginBtn click

36. EVENT HANDLERS
    loginBtn → login()

37. EVENT ACTIONS
    Startup
    Existing-login check
    Franchise authentication
    Dashboard navigation

38. LOCK
    lock prevents concurrent login execution.

39. SECURITY
    Password input expected by caller.
    Franchise role check.
    Active-status check.
    Login execution lock.

40. AUTHENTICATION
    login()

41. AUTHORIZATION
    role = franchise

42. ACCOUNT STATUS
    status = active

43. VALIDATION
    userId required
    password required
    getUsers() available
    user ID match
    franchise role match
    password match
    active account

44. ERROR HANDLING
    safeDecode() uses try/catch.
    login() uses try/finally.

45. FAILURE PATH
    Missing credentials → message
    getUsers unavailable → message
    Invalid login → message
    Inactive account → message

46. SESSION DESTRUCTION
    No session-destruction function.

47. NAVIGATION
    admin_franchise_dashboard.html

48. UI DOM TARGETS
    loginBtn
    userId
    password
    msg

49. UI OUTPUT
    msg.innerText

50. ROLE DISPLAY
    No role display.

51. ROLE VALUES USED
    franchise

52. LOG ORDER
    No activity-log operation.

53. LOG VIEW ACTION
    None.

54. FILTER ACTION
    users.find() matches userId, role and password.

55. CLEAR ACTION
    Message cleared through msg.innerText = "".

56. CONFIRMATION
    None.

57. ALERT
    None.

58. GLOBAL ACCESS
    No window exports.

59. RELATED FILES
    admin_franchise_auth.html
    admin_franchise_auth_controller.js
    admin_franchise_dashboard.html
    core_boot_manager.js
    core_initializer.js
    core_session_authority.js
    External owner of getUsers() — not yet established.

60. STATUS
    FIRST-DOCUMENT DATA COLLECTION:
    RECORDED

    PROBLEM/SOLUTION:
    NOT ANALYZED IN THIS PHASE


FIRST-DOCUMENT FUNCTION REGISTER — KB_010

F001
initPage()
Role: Page/Core initialization placeholder
Owner: KB_010

F002
authPage()
Role: Resets authentication-page state
Owner: KB_010

F003
bindEvents()
Role: Binds login button
Owner: KB_010

F004
loadPage()
Role: Checks existing franchise login state
Owner: KB_010

F005
safeDecode()
Role: Decodes stored password value when possible
Owner: KB_010

F006
login()
Role: Franchise authentication and dashboard redirect
Owner: KB_010

F007
Anonymous DOMContentLoaded callback
Role: Startup orchestration
Owner: KB_010


EXTERNAL FUNCTION REFERENCE

E001
getUsers()
Role: Supplies user records
Owner: NOT YET ESTABLISHED


LOCAL STATE

S001
session
S002
currentUser
S003
lock


STORAGE

D001
localStorage → loggedInFranchise


KB_010 FIRST DOCUMENT RECORD:
COMPLETE

