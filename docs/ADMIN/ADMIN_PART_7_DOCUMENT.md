KB_026 — admin_pin_request_controller.js

ACTUAL DATA POINT SEQUENCE

1. Module
   Admin PIN Request Controller

2. Global State
   session
   currentUser
   lock
   refreshTimer

3. Initialization
   DOMContentLoaded
   ↓
   initPage()
   ↓
   checkAuth()
   ↓
   currentUser validation
   ↓
   bindEvents()
   ↓
   loadRequests()
   ↓
   startAutoRefresh()

4. Core Initialization
   initCoreSystem()
   ↓
   getSession()

5. Authentication
   getSession()
   ↓
   session.role
   ↓
   getUserById(session.userId)
   ↓
   currentUser.role
   ↓
   currentUser.status

6. Authentication Failure
   redirectLogin()
   ↓
   destroySession()
   ↓
   admin_auth.html

7. Events
   refreshBtn
   ↓
   loadRequests()

   logoutBtn
   ↓
   logout()

8. PIN Request Data Source
   getPinRequests()
   ↓
   requestTable

9. Request Display Data
   requestId
   userId
   type
   quantity
   amount
   status
   actions

10. Request Status Mapping
    pending
    completed
    failed
    rejected

    ↓

    getStatusClass(status)

11. Pending Request Actions
    AUTO
    ↓
    autoProcess(requestId)

    REJECT
    ↓
    rejectReq(requestId)

12. Auto Processing Flow
    autoProcess(requestId)
    ↓
    executePinFlow("PROCESS_REQUEST", {...})
    OR
    processPinRequestAuto(requestId)
    ↓
    logActivity()
    ↓
    loadRequests()

13. Reject Flow
    rejectReq(requestId)
    ↓
    confirm()
    ↓
    executePinFlow("REJECT_REQUEST", {...})
    OR
    rejectPinRequest(requestId, adminId)
    ↓
    logActivity()
    ↓
    loadRequests()

14. Concurrency Control
    lock
    ↓
    prevents simultaneous AUTO / REJECT processing

15. Auto Refresh
    startAutoRefresh()
    ↓
    setInterval(loadRequests, 3000)
    ↓
    requestTable refresh

16. Logout Flow
    logout()
    ↓
    clearInterval(refreshTimer)
    ↓
    destroySession()
    ↓
    admin_auth.html

17. External Functions Referenced
    initCoreSystem
    getSession
    getUserById
    destroySession
    getPinRequests
    executePinFlow
    processPinRequestAuto
    rejectPinRequest
    logActivity

ACTUAL DATA FLOW

Admin
↓
Authentication
↓
getPinRequests()
↓
requestTable
↓
Pending Request
↓
AUTO / REJECT
↓
PIN request processing function
↓
Activity log
↓
Request table refresh

STATUS

ACTUAL DATA POINT RECORDED

KB_027 — admin_pin_request_dashboard.html

ACTUAL DATA POINT SEQUENCE

1. Page
   ADMIN PIN REQUEST PANEL

2. Page Controls
   refreshBtn
   ↓
   Refresh

   logoutBtn
   ↓
   Logout

3. Request Table
   requestTable

   Columns:
   ID
   User
   Type
   Qty
   Amount
   Status
   Action

4. Status Presentation
   pending
   completed
   failed
   rejected

5. Controller Connection
   admin_pin_request_controller.js

   ↓

   loadRequests()
   autoProcess()
   rejectReq()
   logout()

6. PIN System Dependency
   pin_master_system.js

7. Core Script Sequence
   core_boot_manager.js
   ↓
   core_initializer.js
   ↓
   core_session_authority.js
   ↓
   pin_master_system.js
   ↓
   admin_pin_request_controller.js

8. Page-to-Controller Mapping
   refreshBtn
   ↓
   loadRequests()

   logoutBtn
   ↓
   logout()

   requestTable
   ↓
   getPinRequests()
   ↓
   rendered request rows

9. Request Row Data
   ID → requestId
   User → userId
   Type → type
   Qty → quantity
   Amount → amount
   Status → status
   Action → AUTO / REJECT for pending requests

ACTUAL PAGE FLOW

Admin PIN Request Panel
↓
Core initialization
↓
Session authority
↓
PIN master system
↓
PIN request controller
↓
Authentication
↓
getPinRequests()
↓
requestTable
↓
AUTO / REJECT
↓
Request processing

STATUS

ACTUAL DATA POINT RECORDED

KB_028 — admin_registration_queue_controller.js

ACTUAL DATA POINT SEQUENCE

1. Module
   Admin Registration Queue Controller

2. Global State
   session
   currentUser
   refreshInterval

3. Initialization
   DOMContentLoaded
   ↓
   authPage()
   ↓
   bindEvents()
   ↓
   loadPage()
   ↓
   startAutoRefresh()

4. Authentication
   getSession()
   ↓
   getCurrentUser()
   ↓
   hasRole("admin")
   ↓
   accountStatus / status
   ↓
   active

5. Authentication Failure
   forceLogout()
   ↓
   destroySession()
   ↓
   admin_auth.html

6. Events
   refreshBtn
   ↓
   loadQueue()

7. Queue Data Source
   getRegQueue()
   ↓
   filter(Boolean)
   ↓
   queue

8. Queue Display Target
   queueList

9. Queue Data Fields
   username
   mobile
   status
   requestTime
   fingerprint
   error

10. Queue Rendering
    queue
    ↓
    username
    mobile
    status
    requestTime
    error
    ↓
    HTML item

11. Security/Data Rendering
    escapeHtml()
    ↓
    username
    mobile
    status
    error
    ↓
    escaped HTML output

12. Queue Actions
    Approve
    ↓
    approveUser(fp)

    Reject
    ↓
    rejectUser(fp)

13. Current Action Data
    fingerprint
    ↓
    approveUser(fp)
    OR
    rejectUser(fp)

14. Current Action Implementation
    approveUser()
    ↓
    console.log("Approve:", fp)

    rejectUser()
    ↓
    console.log("Reject:", fp)

15. Auto Refresh
    startAutoRefresh()
    ↓
    setInterval(loadQueue, 10000)
    ↓
    queueList refresh

ACTUAL DATA FLOW

Admin Registration Queue
↓
Authentication
↓
getRegQueue()
↓
queue
↓
queueList
↓
Registration request display
↓
fingerprint
↓
Approve / Reject hooks

REFERENCED FUNCTIONS

getSession
getCurrentUser
hasRole
destroySession
getRegQueue
escapeHtml
loadQueue
approveUser
rejectUser

STATUS

ACTUAL DATA POINT RECORDED

KB_029 — admin_registration_queue_dashboard.html

ACTUAL DATA POINT SEQUENCE

1. Page
   Registration Queue

2. Main Container
   card

3. Queue Display Target
   queueList
   ↓
   Registration request items

4. Refresh Control
   refreshBtn
   ↓
   Refresh

5. Controller Connection
   admin_registration_queue_controller.js
   ↓
   loadQueue()
   ↓
   queueList

6. Queue Item Data Displayed
   username
   mobile
   status
   requestTime
   error
   fingerprint

7. Queue Actions Generated by Controller
   Approve
   ↓
   approveUser(fingerprint)

   Reject
   ↓
   rejectUser(fingerprint)

8. Script Sequence
   core_boot_manager.js
   ↓
   core_initializer.js
   ↓
   core_session_authority.js
   ↓
   admin_registration_queue_controller.js

9. Page-to-Controller Mapping
   refreshBtn
   ↓
   loadQueue()

   queueList
   ↓
   rendered registration queue

ACTUAL PAGE FLOW

Registration Queue Dashboard
↓
Core scripts
↓
Session authority
↓
Registration queue controller
↓
Authentication
↓
getRegQueue()
↓
queueList
↓
Approve / Reject hooks

STATUS

ACTUAL DATA POINT RECORDED

KB_030 — admin_reporting_dashboard.html

ACTUAL DATA POINT SEQUENCE

1. Page
   Admin Reporting Dashboard
   ↓
   SYSTEM REPORTS

2. Main Module
   admin-reports-module

3. Navigation
   backBtn
   ↓
   Back

4. User Report
   users
   ↓
   Total Users
   ↓
   Loading...

5. PIN Report
   pins
   ↓
   Pin Status
   ↓
   Loading...

6. Income Report
   income
   ↓
   Income Summary
   ↓
   Loading...

7. Hold Income Report
   hold
   ↓
   Hold Income
   ↓
   Loading...

8. CTOR Report
   ctor
   ↓
   CTOR Pool

   ctorBtn
   ↓
   Run CTOR Distribution

9. Transaction Report
   transactions
   ↓
   All Transactions

10. PIN Usage Report
    pinLogs
    ↓
    Pin Usage Logs

11. Withdrawal Report
    withdrawals
    ↓
    Withdraw Requests

12. Script Sequence
    core_boot_manager.js
    ↓
    core_initializer.js
    ↓
    core_session_authority.js
    ↓
    core_reporting_engine.js
    ↓
    admin_reporting_dashboard.js

13. Controller Connection
    admin_reporting_dashboard.js
    ↓
    users
    pins
    income
    hold
    ctor
    transactions
    pinLogs
    withdrawals

14. CTOR Control Connection
    ctorBtn
    ↓
    admin_reporting_dashboard.js
    ↓
    CTOR Distribution

ACTUAL PAGE FLOW

Admin Reporting Dashboard
↓
Core Boot
↓
Core Initialization
↓
Session Authority
↓
Core Reporting Engine
↓
Admin Reporting Controller
↓
System Report Data
↓
Users / PINs / Income / Hold / CTOR
↓
Transactions / PIN Logs / Withdrawals

STATUS

ACTUAL DATA POINT RECORDED
