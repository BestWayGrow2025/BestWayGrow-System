KB_020 — admin_income_policy_controller.js

ACTUAL DATA POINT SEQUENCE

1. Module
   Admin Income Control

2. Initialization
   DOMContentLoaded
   initIncomeControlPage
   initPage
   authPage
   bindEvents
   loadPage

3. System Initialization
   initCoreSystem
   initIncomeControl

4. Authentication
   getSession
   getUserById
   Admin role
   Active account status
   admin_auth.html redirect

5. UI Event Controls
   ugliOnBtn
   ugliOffBtn
   rliOnBtn
   rliOffBtn
   binaryOnBtn
   binaryOffBtn

6. Status Display
   ugliStatus
   rliStatus
   binaryStatus

7. Income Settings Dependencies
   getIncomeSettings
   saveIncomeSettings

8. UGLI Control
   setUGLI(state)
   settings.ugli

9. RLI Control
   setRLI(state)
   settings.rli

10. Binary Control
    setBinary(state)
    settings.binary

11. Status Functions
    safeStatus
    refreshStatus

12. Dependency Validation
    validateIncomeDependencies

13. Realtime System Bridge
    SYSTEM_EVENTS.on

14. Realtime Events
    INCOME_UPDATED
    INCOME_EVENT
    INCOME_CREDIT
    INCOME_LOG_CREATED
    HOLD_INCOME_RELEASED

15. Realtime Action
    safeRefresh
    refreshStatus

ACTUAL FUNCTION FLOW

DOMContentLoaded
↓
initIncomeControlPage
↓
initPage
↓
initCoreSystem + initIncomeControl
↓
authPage
↓
bindEvents
↓
loadPage
↓
refreshStatus

CONTROL FLOW

UI Button
↓
setUGLI / setRLI / setBinary
↓
validateIncomeDependencies
↓
getIncomeSettings
↓
update setting
↓
saveIncomeSettings
↓
refreshStatus

REALTIME FLOW

SYSTEM_EVENTS
↓
Income event
↓
safeRefresh
↓
refreshStatus

STATUS

ACTUAL DATA POINT RECORDED

KB_021 — admin_income_policy_dashboard.html

ACTUAL DATA POINT SEQUENCE

1. Page
   Admin Income Policy Dashboard

2. Module
   admin-income-control-module
   income-control-panel

3. Income Control Sections
   UGLI — Upgrade Income
   RLI — Repurchase Income
   Binary Income

4. UGLI Controls
   ugliOnBtn
   ugliOffBtn
   ugliStatus

5. RLI Controls
   rliOnBtn
   rliOffBtn
   rliStatus

6. Binary Controls
   binaryOnBtn
   binaryOffBtn
   binaryStatus

7. UI Elements
   ON buttons
   OFF buttons
   Status display paragraphs

8. Script Sequence
   core_boot_manager.js
   core_initializer.js
   core_session_authority.js
   admin_income_policy_controller.js

ACTUAL PAGE FLOW

Admin Income Policy Dashboard
↓
Income Control Panel
↓
UGLI / RLI / Binary Controls
↓
Status Display
↓
admin_income_policy_controller.js

CONTROLLER CONNECTIONS

ugliOnBtn / ugliOffBtn
↓
setUGLI()

rliOnBtn / rliOffBtn
↓
setRLI()

binaryOnBtn / binaryOffBtn
↓
setBinary()

STATUS

ACTUAL DATA POINT RECORDED

KB_022 — admin_kyc_authority.js

ACTUAL DATA POINT SEQUENCE

1. Module
   Admin KYC Authority

2. Initialization
   DOMContentLoaded
   authPage
   bindEvents
   loadPage

3. Authentication
   getSession
   session.userId
   getUserById
   Admin role validation
   Active account validation
   destroySession
   admin_auth.html redirect

4. Page Events
   backBtn
   refreshBtn
   goBack
   loadKYC

5. Page Flow
   loadPage
   ↓
   loadKYC

6. KYC Storage
   localStorage key:
   kycRequests

   Functions:
   getKYC
   saveKYC

7. KYC Display
   kycList
   requestId
   userId
   status
   time
   PENDING state
   APPROVED state
   REJECTED state

8. KYC Approval Flow
   approveKYC(requestId, userId)
   ↓
   getKYC
   ↓
   getUsers
   ↓
   locate request
   ↓
   locate user
   ↓
   request.status = APPROVED
   ↓
   request.approvedAt
   ↓
   user.kycStatus = VERIFIED
   ↓
   user.kycApprovedTime
   ↓
   saveKYC
   ↓
   saveUsers
   ↓
   logActivity
   ↓
   loadKYC

9. KYC Rejection Flow
   rejectKYC(requestId)
   ↓
   getKYC
   ↓
   locate request
   ↓
   request.status = REJECTED
   ↓
   request.rejectedAt
   ↓
   saveKYC
   ↓
   logActivity
   ↓
   loadKYC

10. Concurrency Control
    lock
    approveKYC lock
    rejectKYC lock

11. Activity Logging
    logActivity
    currentUser.userId
    role = admin
    KYC approved
    KYC rejected

12. Exposed Global Functions
    window.loadKYC
    window.approveKYC
    window.rejectKYC

ACTUAL DATA FLOW

KYC Requests
↓
localStorage: kycRequests
↓
getKYC()
↓
loadKYC()
↓
kycList

APPROVAL

Admin
↓
approveKYC()
↓
KYC request + User record
↓
KYC status update
↓
saveKYC() + saveUsers()
↓
Activity log

REJECTION

Admin
↓
rejectKYC()
↓
KYC request status update
↓
saveKYC()
↓
Activity log

STATUS

ACTUAL DATA POINT RECORDED

KB_023 — admin_kyc_dashboard.html

ACTUAL DATA POINT SEQUENCE

1. Page
   Admin KYC Dashboard

2. Page Purpose
   ADMIN → KYC MANAGEMENT

3. Navigation Controls
   backBtn
   ↓
   Back to Dashboard

   refreshBtn
   ↓
   Refresh KYC data

4. KYC Display Container
   kycList
   ↓
   Displays KYC requests

5. KYC Section
   KYC Requests
   ↓
   kycList

6. Script Sequence
   core_session_authority.js
   ↓
   admin_kyc_authority.js

7. Controller Connection
   admin_kyc_authority.js provides:
   loadKYC
   approveKYC
   rejectKYC

8. Page-to-Controller Elements
   backBtn
   ↓
   goBack()

   refreshBtn
   ↓
   loadKYC()

   kycList
   ↓
   KYC request rendering

ACTUAL PAGE FLOW

Admin KYC Dashboard
↓
core_session_authority.js
↓
admin_kyc_authority.js
↓
Authentication
↓
KYC loading
↓
kycList
↓
Admin KYC management

STATUS

ACTUAL DATA POINT RECORDED

KB_024 — admin_pin_controller.js

ACTUAL DATA POINT SEQUENCE

1. Module
   Admin PIN Controller

2. Global State
   session
   currentUser

3. Initialization
   DOMContentLoaded
   ↓
   initCoreSystem()
   ↓
   checkAuth()
   ↓
   loadAllPins()

4. Authentication
   getSession()
   ↓
   session.role === "admin"
   ↓
   getUserById(session.userId)
   ↓
   currentUser.role === "admin"
   ↓
   currentUser.status === "active"

5. Authentication Failure Flow
   checkAuth()
   ↓
   redirectLogin()
   ↓
   destroySession()
   ↓
   admin_auth.html

6. PIN Creation
   handleCreatePin()
   ↓
   pinType
   amount
   bv
   gst
   ↓
   BV validation
   ↓
   createPin()
   ↓
   newPin.pinId
   ↓
   createMsg
   ↓
   loadAllPins()

7. PIN Assignment
   handleAssignPin()
   ↓
   assignPin(pinId, userId, "user", currentUser.userId)
   ↓
   assignMsg
   ↓
   loadAllPins()

8. PIN Deletion
   handleDeletePin()
   ↓
   deletePin(pinId, currentUser.userId)
   ↓
   deleteMsg
   ↓
   loadAllPins()

9. PIN Data Loading
   loadAllPins()
   ↓
   loadPins()
   ↓
   pinTable

10. PIN Display Data
    pinId
    type
    amount
    bv
    status
    ownerId

11. PIN Status Mapping
    active → green
    assigned → blue
    other → red

12. Core Dependencies Referenced
    initCoreSystem
    getSession
    getUserById
    destroySession
    createPin
    assignPin
    deletePin
    loadPins

13. UI Data Targets
    pinType
    amount
    bv
    gst
    createMsg
    assignPinId
    assignUserId
    assignMsg
    deletePinId
    deleteMsg
    pinTable

ACTUAL DATA FLOW

Admin Page
↓
checkAuth()
↓
PIN operations
↓
createPin / assignPin / deletePin
↓
loadPins()
↓
pinTable

STATUS

ACTUAL DATA POINT RECORDED

KB_025 — admin_pin_dashboard.html

ACTUAL DATA POINT SEQUENCE

1. Page
   Admin PIN Panel (Enterprise)

2. Create PIN Section
   pinType
   ↓
   Upgrade / Repurchase

   amount
   ↓
   Amount ₹

   bv
   ↓
   BV

   gst
   ↓
   GST

   handleCreatePin()
   ↓
   createMsg

3. Assign PIN Section
   assignPinId
   ↓
   PIN ID

   assignUserId
   ↓
   User ID

   handleAssignPin()
   ↓
   assignMsg

4. Delete PIN Section
   deletePinId
   ↓
   PIN ID

   handleDeletePin()
   ↓
   deleteMsg

5. All PINs Section
   pinTable
   ↓
   PIN
   Type
   Amount
   BV
   Status
   Owner

6. Script Sequence
   core_boot_manager.js
   ↓
   core_initializer.js
   ↓
   core_session_authority.js
   ↓
   pin_master_system.js
   ↓
   admin_pin_controller.js

7. Controller Connections
   Create PIN
   ↓
   handleCreatePin()

   Assign PIN
   ↓
   handleAssignPin()

   Delete PIN
   ↓
   handleDeletePin()

   PIN Table
   ↓
   loadAllPins()

8. PIN Master Dependency
   pin_master_system.js
   ↓
   createPin
   assignPin
   deletePin
   loadPins

ACTUAL PAGE FLOW

Admin PIN Panel
↓
Core initialization
↓
Session authority
↓
PIN master system
↓
Admin PIN controller
↓
Create / Assign / Delete
↓
All PINs
↓
pinTable

STATUS

ACTUAL DATA POINT RECORDED

