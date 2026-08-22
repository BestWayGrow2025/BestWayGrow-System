KB_031 — admin_reporting_dashboard.js

ACTUAL DATA POINT SEQUENCE

1. Module State
   session
   reportAdmin
   reportLock

2. Initialization
   DOMContentLoaded
   ↓
   initPage()
   ↓
   authPage()
   ↓
   reportAdmin validation
   ↓
   bindAdminReportsEvents()
   ↓
   loadAdminReportsPage()
   ↓
   logActivity()

3. Core Dependency
   initCoreSystem()

4. Authentication Dependencies
   getSession()
   getCurrentUser()
   hasRole("admin")
   ↓
   accountStatus / status
   ↓
   active

5. Authentication Failure
   redirectLogin()
   ↓
   logoutSession()
   OR
   admin_auth.html

6. Dashboard Events
   backBtn
   ↓
   admin_dashboard.html

   ctorBtn
   ↓
   runAdminReportsCTOR()

7. Report Page Load
   loadAdminReportsPage()
   ↓
   loadAdminReportsUsers()
   loadAdminReportsPins()
   loadAdminReportsIncome()
   loadAdminReportsHold()
   loadAdminReportsCTOR()
   loadAdminReportsTransactions()
   loadAdminReportsPinLogs()
   loadAdminReportsWithdrawals()

8. Users Data
   getUsers()
   ↓
   role === "user"
   ↓
   totalUsers
   ↓
   #users

9. PIN Data
   loadPins()
   ↓
   total stock
   total USED
   ↓
   #pins

10. Income Data
    getIncomeLogs()
    ↓
    amount
    ↓
    Total Distributed
    ↓
    #income

11. Hold Income Data
    getUsers()
    ↓
    holdIncome
    ↓
    Hold Amount
    ↓
    #hold

12. CTOR Data
    getCTORPool()
    ↓
    CTOR Pool
    ↓
    #ctor

13. CTOR Action
    runAdminReportsCTOR()
    ↓
    runCTORDistribution()
    ↓
    refresh CTOR
    ↓
    refresh Transactions

14. Transaction Data
    getIncomeLogs()
    ↓
    last 50
    ↓
    reverse
    ↓
    #transactions

15. PIN Usage Data
    getPinTransactions()
    ↓
    last 50
    ↓
    reverse
    ↓
    #pinLogs

16. Withdrawal Data
    getWithdrawals()
    ↓
    last 50
    ↓
    reverse
    ↓
    #withdrawals

17. Safety Wrapper
    safeAdminReportsRender(fn)
    ↓
    try
    ↓
    fn()
    ↓
    console.error() on failure

18. Activity Audit
    logActivity(
      reportAdmin.userId,
      "ADMIN",
      "Viewed Reports"
    )

19. Session Cleanup Function
    clearAdminReportsSession()
    ↓
    removes:
    loggedInAdmin
    loggedInSystemAdmin
    loggedInSuperAdmin

ACTUAL DATA FLOW

Admin Reporting Dashboard
↓
admin_reporting_dashboard.js
↓
Core Initialization
↓
Admin Authentication
↓
Report Data Sources
↓
Users / PINs / Income / Hold / CTOR
↓
Transactions / PIN Logs / Withdrawals
↓
Dashboard DOM targets

ACTUAL FUNCTION DEPENDENCIES

initCoreSystem
getSession
getCurrentUser
hasRole
logoutSession
getUsers
loadPins
getIncomeLogs
getCTORPool
runCTORDistribution
getPinTransactions
getWithdrawals
logActivity

STATUS

ACTUAL DATA POINT RECORDED
KB_032 — admin_support_ticket_controller.js

ACTUAL DATA POINT SEQUENCE

1. Module State
   session
   currentUser

2. Initialization
   DOMContentLoaded
   ↓
   initCoreSystem()
   ↓
   authPage()
   ↓
   loadPage()

3. Core Dependency
   initCoreSystem()

4. Authentication
   getSession()
   ↓
   session.userId
   ↓
   getCurrentUser()
   ↓
   currentUser
   ↓
   hasRole("admin")
   ↓
   accountStatus / status
   ↓
   active

5. Authentication Failure
   redirectLogin()
   ↓
   destroySession()
   ↓
   admin_auth.html

6. Support Ticket Data Source
   getUsers()
   ↓
   users[]
   ↓
   user.supportTickets[]
   ↓
   tickets[]

7. Ticket Data Fields
   userId
   title
   message
   status
   date

8. Default Values
   title → "-"
   message → "-"
   status → "OPEN"
   date → "-"

9. Dashboard Target
   #mainContent
   ↓
   Support Ticket Management
   ↓
   HTML table

10. Table Fields
    User
    Subject
    Message
    Status
    Date

11. Empty State
    tickets.length === 0
    ↓
    "No Support Tickets"

12. Display Order
    tickets.slice().reverse()
    ↓
    newest/reverse source order displayed first

13. Date Rendering
    ticket.date
    ↓
    new Date(ticket.date)
    ↓
    toLocaleString()

14. Activity Audit
    logActivity(
      currentUser.userId,
      currentUser.role,
      "Viewed Support Ticket Dashboard",
      "ADMIN"
    )

15. Exported Function
    window.loadPage
    ↓
    loadPage()

ACTUAL DATA FLOW

Admin Support Ticket Controller
↓
Core Initialization
↓
Session
↓
Current Admin
↓
Admin Role Validation
↓
getUsers()
↓
user.supportTickets[]
↓
tickets[]
↓
#mainContent
↓
Support Ticket Table
↓
Activity Audit

ACTUAL FUNCTION DEPENDENCIES

initCoreSystem
getSession
getCurrentUser
hasRole
destroySession
getUsers
logActivity

IMPORTANT ACTUAL POINT

This controller is READ/DISPLAY ONLY for support tickets.

No ticket creation function is present.
No ticket update/reply function is present.
No ticket status-change function is present.
No separate support-ticket storage function is present.

The actual ticket source in this file is:

getUsers()
↓
user.supportTickets

STATUS

ACTUAL DATA POINT RECORDED

KB_033 — admin_support_ticket_dashboard.html

ACTUAL DATA POINT SEQUENCE

1. Page
   Admin Support Ticket Dashboard
   ↓
   Support Ticket Management

2. Main Display Target
   #mainContent
   ↓
   Receives HTML generated by
   admin_support_ticket_controller.js

3. CSS Dependency
   style.css
   ↓
   Page styling

4. Core Script Sequence
   core_boot_manager.js
   ↓
   core_initializer.js
   ↓
   core_session_authority.js

5. Activity Audit Dependency
   platform_activity_audit.js
   ↓
   logActivity()

6. Controller
   admin_support_ticket_controller.js
   ↓
   DOMContentLoaded
   ↓
   initCoreSystem()
   ↓
   authPage()
   ↓
   loadPage()

7. Controller → DOM Connection
   loadPage()
   ↓
   document.getElementById("mainContent")
   ↓
   dynamically creates:
   Support Ticket Management
   ↓
   Ticket Table

8. Actual Ticket Display Fields
   User
   Subject
   Message
   Status
   Date

9. Actual Data Source
   admin_support_ticket_controller.js
   ↓
   getUsers()
   ↓
   user.supportTickets[]

10. Script Loading Relationship
    core_boot_manager.js
    ↓
    core_initializer.js
    ↓
    core_session_authority.js
    ↓
    platform_activity_audit.js
    ↓
    admin_support_ticket_controller.js

11. Important Page Fact
    The HTML contains NO ticket table markup itself.

    The ticket table is generated dynamically by:
    loadPage()
    ↓
    main.innerHTML

12. No Direct HTML Actions
    No create-ticket button
    No reply button
    No approve/reject button
    No status-change control
    No refresh button

ACTUAL PAGE FLOW

Admin Support Ticket Dashboard
↓
Core Boot
↓
Core Initialization
↓
Session Authority
↓
Activity Audit
↓
Support Ticket Controller
↓
Authentication
↓
getUsers()
↓
user.supportTickets[]
↓
#mainContent
↓
Dynamic Support Ticket Table

STATUS

ACTUAL DATA POINT RECORDED

KB_034 — admin_withdrawal_authority.js

ACTUAL DATA POINT SEQUENCE

1. Module State
   session
   admin
   refreshTimer
   actionLock

2. Initialization
   DOMContentLoaded
   ↓
   initPage()
   ↓
   authPage()
   ↓
   admin.userId check
   ↓
   bindEvents()
   ↓
   loadPage()
   ↓
   startAutoRefresh()

3. Core Initialization
   initCoreSystem()
   ↓
   If missing:
   alert("core_system.js missing")
   ↓
   STOP

4. Authentication
   getSession()
   ↓
   session
   ↓
   getCurrentUser()
   ↓
   admin
   ↓
   hasRole("admin")
   ↓
   accountStatus / status
   ↓
   active

5. Authentication Failure
   forceLogout()
   ↓
   logoutSession()
   OR
   admin_auth.html

6. Page Events
   backBtn
   ↓
   goBack()
   ↓
   admin_dashboard.html

   refreshBtn
   ↓
   loadPage()

7. Page Load
   loadPage()
   ↓
   loadSystemStatus()
   ↓
   loadRequests()

8. Withdrawal System Status
   getSystemSettings()
   ↓
   withdrawStop
   ↓
   #systemStatus

   withdrawStop = true
   ↓
   WITHDRAW SYSTEM STOPPED

   withdrawStop = false
   ↓
   WITHDRAW SYSTEM RUNNING

9. Withdrawal Data Source
   getWithdrawals()
   ↓
   requests[]

10. Withdrawal Data Fields
    requestId
    userId
    amount
    charge
    finalAmount
    status
    time
    processedAt

11. Withdrawal Table
    #withdrawTable
    ↓
    Request ID
    User ID
    Amount
    Charge
    Final
    Status
    Time
    Processed
    Action

12. Empty State
    requests.length === 0
    ↓
    "No requests"

13. Request Display Order
    requests.slice().reverse()
    ↓
    reverse source order

14. Status Mapping
    PENDING → orange
    APPROVED → green
    REJECTED → red
    other → black

15. Pending Actions
    PENDING
    ↓
    Approve
    ↓
    approve(requestId)

    Reject
    ↓
    reject(requestId)

16. Processed Actions
    non-PENDING
    ↓
    "✔ Done"

17. APPROVE FLOW
    approve(id)
    ↓
    actionLock
    ↓
    getSystemSettings()
    ↓
    withdrawStop check
    ↓
    approveWithdraw(id, admin.userId)
    ↓
    logActivity()
    ↓
    alert("Approved")
    ↓
    loadRequests()

18. REJECT FLOW
    reject(id)
    ↓
    actionLock
    ↓
    getSystemSettings()
    ↓
    withdrawStop check
    ↓
    rejectWithdraw(id, admin.userId)
    ↓
    logActivity()
    ↓
    alert("Rejected")
    ↓
    loadRequests()

19. Action Lock
    actionLock = true
    ↓
    prevents simultaneous approve/reject
    ↓
    finally
    ↓
    actionLock = false

20. Auto Refresh
    startAutoRefresh()
    ↓
    setInterval
    ↓
    5000 ms
    ↓
    loadPage()

21. Activity Audit
    Viewed withdrawals
    Approved withdrawal + id
    Rejected withdrawal + id

ACTUAL DATA FLOW

Admin Withdrawal Authority
↓
Core Initialization
↓
Admin Authentication
↓
System Settings
↓
Withdrawals
↓
Withdrawal Table
↓
Approve / Reject
↓
Withdrawal Lifecycle Functions
↓
Activity Audit
↓
Auto Refresh

ACTUAL FUNCTION DEPENDENCIES

initCoreSystem
getSession
getCurrentUser
hasRole
logoutSession
getSystemSettings
getWithdrawals
approveWithdraw
rejectWithdraw
logActivity

IMPORTANT ACTUAL POINT

This file is not only a dashboard reader.

It contains ADMIN WITHDRAWAL ACTION AUTHORITY:

getWithdrawals()
↓
display request
↓
PENDING
↓
approveWithdraw() / rejectWithdraw()
↓
admin.userId

STATUS

ACTUAL DATA POINT RECORDED
KB_035 — admin_withdrawal_dashboard.html

ACTUAL DATA POINT SEQUENCE

1. Page Identity
   Admin Withdrawals
   ↓
   ADMIN WITHDRAWALS

2. Navigation Controls
   #backBtn
   ↓
   admin_withdrawal_authority.js
   ↓
   goBack()
   ↓
   admin_dashboard.html

   #refreshBtn
   ↓
   admin_withdrawal_authority.js
   ↓
   loadPage()
   ↓
   loadRequests()

3. System Status Target
   #systemStatus
   ↓
   loadSystemStatus()
   ↓
   getSystemSettings()
   ↓
   withdrawStop
   ↓
   RUNNING / STOPPED

4. Withdrawal Table Target
   #withdrawTable
   ↓
   loadRequests()
   ↓
   getWithdrawals()

5. Table Data Points
   Request ID
   ↓
   req.requestId

   User ID
   ↓
   req.userId

   Amount
   ↓
   req.amount

   Charge
   ↓
   req.charge

   Final
   ↓
   req.finalAmount
   OR
   req.amount

   Status
   ↓
   req.status

   Time
   ↓
   req.time

   Processed
   ↓
   req.processedAt

   Action
   ↓
   PENDING
   ↓
   Approve / Reject
   OR
   ✔ Done

6. Core Script Sequence
   core_boot_manager.js
   ↓
   core_initializer.js
   ↓
   core_session_authority.js

7. Wallet Dependency Sequence
   core_wallet_transaction_authority.js
   ↓
   core_wallet_integration_bridge.js
   ↓
   core_withdrawal_lifecycle_manager.js

8. Admin Authority
   admin_withdrawal_authority.js
   ↓
   authentication
   ↓
   system status
   ↓
   withdrawal requests
   ↓
   approve / reject

9. Actual Page → Controller Connection

   admin_withdrawal_dashboard.html
   ↓
   #backBtn
   #refreshBtn
   #systemStatus
   #withdrawTable
   ↓
   admin_withdrawal_authority.js

10. Actual Withdrawal Action Flow

    PENDING request
    ↓
    Approve
    ↓
    approve(id)
    ↓
    approveWithdraw(id, admin.userId)

    OR

    PENDING request
    ↓
    Reject
    ↓
    reject(id)
    ↓
    rejectWithdraw(id, admin.userId)

11. Dependency Flow

    Dashboard HTML
    ↓
    Boot
    ↓
    Initializer
    ↓
    Session Authority
    ↓
    Wallet Transaction Authority
    ↓
    Wallet Integration Bridge
    ↓
    Withdrawal Lifecycle Manager
    ↓
    Admin Withdrawal Authority
    ↓
    Withdrawal UI

12. Important Actual Point

    The HTML itself contains NO withdrawal business logic.

    It provides:
    - navigation controls
    - system-status target
    - withdrawal table structure
    - required script loading sequence

    The withdrawal processing authority remains in:
    admin_withdrawal_authority.js

13. Required DOM Contract

    admin_withdrawal_authority.js
    expects:

    #backBtn
    #refreshBtn
    #systemStatus
    #withdrawTable

    All four are present in this HTML.

STATUS

ACTUAL DATA POINT RECORDED

KB_020 → KB_035 DATA-POINT SEQUENCE COMPLETE
