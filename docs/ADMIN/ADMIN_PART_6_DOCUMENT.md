KB_020 — admin_income_policy_controller.js

ACTUAL DATA POINT SEQUENCE

Module Admin Income Control

Initialization DOMContentLoaded initIncomeControlPage initPage authPage bindEvents loadPage

System Initialization initCoreSystem initIncomeControl

Authentication getSession getUserById Admin role Active account status admin_auth.html redirect

UI Event Controls ugliOnBtn ugliOffBtn rliOnBtn rliOffBtn binaryOnBtn binaryOffBtn

Status Display ugliStatus rliStatus binaryStatus

Income Settings Dependencies getIncomeSettings saveIncomeSettings

UGLI Control setUGLI(state) settings.ugli

RLI Control setRLI(state) settings.rli

Binary Control setBinary(state) settings.binary

Status Functions safeStatus refreshStatus

Dependency Validation validateIncomeDependencies

Realtime System Bridge SYSTEM_EVENTS.on

Realtime Events INCOME_UPDATED INCOME_EVENT INCOME_CREDIT INCOME_LOG_CREATED HOLD_INCOME_RELEASED

Realtime Action safeRefresh refreshStatus

ACTUAL FUNCTION FLOW

DOMContentLoaded ↓ initIncomeControlPage ↓ initPage ↓ initCoreSystem + initIncomeControl ↓ authPage ↓ bindEvents ↓ loadPage ↓ refreshStatus

CONTROL FLOW

UI Button ↓ setUGLI / setRLI / setBinary ↓ validateIncomeDependencies ↓ getIncomeSettings ↓ update setting ↓ saveIncomeSettings ↓ refreshStatus

REALTIME FLOW

SYSTEM_EVENTS ↓ Income event ↓ safeRefresh ↓ refreshStatus

STATUS

ACTUAL DATA POINT RECORDED

KB_021 — admin_income_policy_dashboard.html

ACTUAL DATA POINT SEQUENCE

Page Admin Income Policy Dashboard

Module admin-income-control-module income-control-panel

Income Control Sections UGLI — Upgrade Income RLI — Repurchase Income Binary Income

UGLI Controls ugliOnBtn ugliOffBtn ugliStatus

RLI Controls rliOnBtn rliOffBtn rliStatus

Binary Controls binaryOnBtn binaryOffBtn binaryStatus

UI Elements ON buttons OFF buttons Status display paragraphs

Script Sequence core_boot_manager.js core_initializer.js core_session_authority.js admin_income_policy_controller.js

ACTUAL PAGE FLOW

Admin Income Policy Dashboard ↓ Income Control Panel ↓ UGLI / RLI / Binary Controls ↓ Status Display ↓ admin_income_policy_controller.js

CONTROLLER CONNECTIONS

ugliOnBtn / ugliOffBtn ↓ setUGLI()

rliOnBtn / rliOffBtn ↓ setRLI()

binaryOnBtn / binaryOffBtn ↓ setBinary()

STATUS

ACTUAL DATA POINT RECORDED

KB_022 — admin_kyc_authority.js

ACTUAL DATA POINT SEQUENCE

Module Admin KYC Authority

Initialization DOMContentLoaded authPage bindEvents loadPage

Authentication getSession session.userId getUserById Admin role validation Active account validation destroySession admin_auth.html redirect

Page Events backBtn refreshBtn goBack loadKYC

Page Flow loadPage ↓ loadKYC

KYC Storage localStorage key: kycRequests

Functions: getKYC saveKYC

KYC Display kycList requestId userId status time PENDING state APPROVED state REJECTED state

KYC Approval Flow approveKYC(requestId, userId) ↓ getKYC ↓ getUsers ↓ locate request ↓ locate user ↓ request.status = APPROVED ↓ request.approvedAt ↓ user.kycStatus = VERIFIED ↓ user.kycApprovedTime ↓ saveKYC ↓ saveUsers ↓ logActivity ↓ loadKYC

KYC Rejection Flow rejectKYC(requestId) ↓ getKYC ↓ locate request ↓ request.status = REJECTED ↓ request.rejectedAt ↓ saveKYC ↓ logActivity ↓ loadKYC

Concurrency Control lock approveKYC lock rejectKYC lock

Activity Logging logActivity currentUser.userId role = admin KYC approved KYC rejected

Exposed Global Functions window.loadKYC window.approveKYC window.rejectKYC

ACTUAL DATA FLOW

KYC Requests ↓ localStorage: kycRequests ↓ getKYC() ↓ loadKYC() ↓ kycList

APPROVAL

Admin ↓ approveKYC() ↓ KYC request + User record ↓ KYC status update ↓ saveKYC() + saveUsers() ↓ Activity log

REJECTION

Admin ↓ rejectKYC() ↓ KYC request status update ↓ saveKYC() ↓ Activity log

STATUS

ACTUAL DATA POINT RECORDED

KB_023 — admin_kyc_dashboard.html

ACTUAL DATA POINT SEQUENCE

Page Admin KYC Dashboard

Page Purpose ADMIN → KYC MANAGEMENT

Navigation Controls backBtn ↓ Back to Dashboard

refreshBtn ↓ Refresh KYC data

KYC Display Container kycList ↓ Displays KYC requests

KYC Section KYC Requests ↓ kycList

Script Sequence core_session_authority.js ↓ admin_kyc_authority.js

Controller Connection admin_kyc_authority.js provides: loadKYC approveKYC rejectKYC

Page-to-Controller Elements backBtn ↓ goBack()

refreshBtn ↓ loadKYC()

kycList ↓ KYC request rendering

ACTUAL PAGE FLOW

Admin KYC Dashboard ↓ core_session_authority.js ↓ admin_kyc_authority.js ↓ Authentication ↓ KYC loading ↓ kycList ↓ Admin KYC management

STATUS

ACTUAL DATA POINT RECORDED

KB_024 — admin_pin_controller.js

ACTUAL DATA POINT SEQUENCE

Module Admin PIN Controller

Global State session currentUser

Initialization DOMContentLoaded ↓ initCoreSystem() ↓ checkAuth() ↓ loadAllPins()

Authentication getSession() ↓ session.role === "admin" ↓ getUserById(session.userId) ↓ currentUser.role === "admin" ↓ currentUser.status === "active"

Authentication Failure Flow checkAuth() ↓ redirectLogin() ↓ destroySession() ↓ admin_auth.html

PIN Creation handleCreatePin() ↓ pinType amount bv gst ↓ BV validation ↓ createPin() ↓ newPin.pinId ↓ createMsg ↓ loadAllPins()

PIN Assignment handleAssignPin() ↓ assignPin(pinId, userId, "user", currentUser.userId) ↓ assignMsg ↓ loadAllPins()

PIN Deletion handleDeletePin() ↓ deletePin(pinId, currentUser.userId) ↓ deleteMsg ↓ loadAllPins()

PIN Data Loading loadAllPins() ↓ loadPins() ↓ pinTable

PIN Display Data pinId type amount bv status ownerId

PIN Status Mapping active → green assigned → blue other → red

Core Dependencies Referenced initCoreSystem getSession getUserById destroySession createPin assignPin deletePin loadPins

UI Data Targets pinType amount bv gst createMsg assignPinId assignUserId assignMsg deletePinId deleteMsg pinTable

ACTUAL DATA FLOW

Admin Page ↓ checkAuth() ↓ PIN operations ↓ createPin / assignPin / deletePin ↓ loadPins() ↓ pinTable

STATUS

ACTUAL DATA POINT RECORDED

KB_025 — admin_pin_dashboard.html

ACTUAL DATA POINT SEQUENCE

Page Admin PIN Panel (Enterprise)

Create PIN Section pinType ↓ Upgrade / Repurchase

amount ↓ Amount ₹

bv ↓ BV

gst ↓ GST

handleCreatePin() ↓ createMsg

Assign PIN Section assignPinId ↓ PIN ID

assignUserId ↓ User ID

handleAssignPin() ↓ assignMsg

Delete PIN Section deletePinId ↓ PIN ID

handleDeletePin() ↓ deleteMsg

All PINs Section pinTable ↓ PIN Type Amount BV Status Owner

Script Sequence core_boot_manager.js ↓ core_initializer.js ↓ core_session_authority.js ↓ pin_master_system.js ↓ admin_pin_controller.js

Controller Connections Create PIN ↓ handleCreatePin()

Assign PIN ↓ handleAssignPin()

Delete PIN ↓ handleDeletePin()

PIN Table ↓ loadAllPins()

PIN Master Dependency pin_master_system.js ↓ createPin assignPin deletePin loadPins

ACTUAL PAGE FLOW

Admin PIN Panel ↓ Core initialization ↓ Session authority ↓ PIN master system ↓ Admin PIN controller ↓ Create / Assign / Delete ↓ All PINs ↓ pinTable

STATUS

ACTUAL DATA POINT RECORDED
