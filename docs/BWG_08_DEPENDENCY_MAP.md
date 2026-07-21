# BWG_08_DEPENDENCY_MAP

## PURPOSE

This document defines the dependency relationships between all BestWayGrow repository files.

It identifies how files depend on each other and helps prevent missing, circular, or duplicate dependencies.

No dependency should be assumed. Every dependency must be verified from the repository.

---

## DEPENDENCY FLOW

Repository File

↓

Depends On

↓

Uses

↓

Exports

↓

Used By

↓

Verification

---

## DEPENDENCY RECORD FORMAT

For every file, document:

- File Name
- Purpose
- Depends On
- Required By
- Global Dependencies
- Function Dependencies
- HTML Dependencies
- JavaScript Dependencies
- Load Order
- Verification Status

---

## DEPENDENCY RULES

1. Every dependency must have a valid reason.

2. Avoid circular dependencies.

3. One dependency should have one clear responsibility.

4. Dynamic modules must declare their required dependencies.

5. Missing dependencies must be documented before code changes.

---

## VERIFICATION CHECKLIST

✓ File exists

✓ Dependency exists

✓ Dependency is loaded correctly

✓ Export exists

✓ Function exists

✓ Load order verified

✓ No duplicate dependency

✓ No circular dependency

---

## STATUS

Verification Status:

⬜ Not Started

⬜ In Progress

⬜ Completed

---

Last Updated:

__________________

==================================================
DEPENDENCY RECORD 001
==================================================

Repository File:
admin_activity_audit_controller.js

Module:
Admin Activity Audit

Internal Functions:
initAdminActivityAudit()
initAdminAuditPage()
redirectLogin()
authenticateAdminAudit()
bindAdminAuditEvents()
goAdminDashboard()
getAdminAuditRoleClass()
loadAdminActivityLogs()
applyAdminAuditFilter()
clearAdminActivityLogs()

External Dependencies:
initCoreSystem()
getSession()
destroySession()
getCurrentUser()
hasRole()
getActivityLogs()
filterLogsAdvanced()
clearActivityLogs()
logActivity()

HTML Dependencies:
admin_activity_audit_dashboard.html

Required HTML Elements:
backBtn
refreshBtn
applyBtn
clearBtn
logs
filterUser
filterRole
filterKeyword

Verification Status:
Verified
️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
Dependency Record
Repository File: admin_auth.js
Depends On:
getSession()
getUsers()
setSession()
logActivity()
atob()
setTimeout()
Required HTML IDs:
adminId
password
loginBtn
msg
Related Files:
admin_auth.html
admin_dashboard.html
Verification Result:
All dependencies verified.
No missing dependency identified.
No duplicate dependency detected.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Dependency Record
Repository File:  admin_dashboard_controller.js
Depends On:
- initCoreSystem()
- getSession()
- getUserById()
- getUsers()
- logoutSession()
- getAdminTreeView()
- setInterval()
- clearInterval()
- setTimeout()

Required HTML IDs:

- welcome
- logoutBtn
- mainContent
- userTableBody

Required CSS Selector:  .menu button

Related Files:
- admin_dashboard.html
- admin_auth.html

Verification Result:  All dependencies verified.
No missing dependency identified.
No duplicate dependency detected.

❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Dependency Record
Repository File: admin_escrow_control_authority.js
Depends On:
getSession()
loadEscrows()
updateEscrowStatus()
logActivity()
Required HTML IDs:
mainContent
Related Files:
admin_dashboard_controller.js
Verification Result:
All dependencies verified.
No missing dependency identified.
No duplicate dependency detected.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
Module:
Admin Franchise Authentication
File:
admin_franchise_auth_controller.js

Dependencies:
getUsers()
localStorage

Dependency Type:
Authentication / Session Dependency

Status:
Verified
Remarks:
No missing dependency detected.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module:  Admin Franchise Authority
File:   admin_franchise_authority.js

Dependencies:
getFranchiseRequests()
approveFranchiseRequest()
rejectFranchiseRequest()

Dependency Type:    Authority / Data Operations
Status:  Verified
Remarks: External functions identified.
No missing imports detected.

♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️ 
admin_franchise_dashboard.html
Depends On:
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_franchise_dashboard_controller.js
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
File:  admin_franchise_dashboard_controller.js

Repository Dependencies:
getSession()
destroySession()
getCurrentUser()
hasRole()
getSystemSettings()
getUsers()
logActivity()

Browser Dependencies:
document
window.location
setInterval()
clearInterval()
DOM Elements:
logoutBtn
profile
system
userList
Output:  Admin Franchise Dashboard
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
File:  admin_franchise_pin_request_controller.js
Repository Dependencies:
getSession()
destroySession()
getCurrentUser()
hasRole()
logActivity()

Browser Dependencies:
document
window.location
localStorage
JSON
Date

DOM Elements:
backBtn
submitBtn
quantity
requestTable

Output: Admin Franchise PIN Request Dashboard
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
File:  admin_franchise_pin_request_dashboard.html
Repository Dependencies:
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_franchise_pin_request_controller.js

Browser Dependencies:  document
DOM Elements:
backBtn
quantity
submitBtn
equestTable

Output:  Admin Franchise PIN Request Dashboard
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
File:  admin_income_audit_controller.js

Repository Dependencies:
getSession()
destroySession()
getCurrentUser()
hasRole()
getIncomeLogs()

Browser Dependencies:
document
Window.location
Date

DOM Elements:
filterType
filterUser
refreshBtn
incomeTable
totalPayout
totalRecords

Output:  Admin Income Audit Dashboard
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module:  Admin Income Dashboard
Repository Dependencies:
core_boot_manager.js
core_initializer.js
core_session_authority.js

getSession()
getUserById()
getIncomeLogs()
initCoreSystem()
SYSTEM_EVENTS

Browser Dependencies:
document
window
Date
console

DOM Elements:
filterType
refreshBtn
incomeTable
totalPayout
totalRecords

Output:
Admin Income Dashboard
Income Summary
Income Records
Income Filter

❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
## Admin Income Policy Dependencies
### HTML  admin_income_policy_dashboard.html

Loads:
- core_boot_manager.js
- core_initializer.js
- core_session_authority.js
- admin_income_policy_controller.js

### Controller Dependencies
Repository:
- initCoreSystem()
- initIncomeControl()
- getSession()
- getUserById()
- getIncomeSettings()
- saveIncomeSettings()
- isUGLIEnabled()
- isRLIEnabled()
- isBinaryEnabled()

Browser:
- document
- window
- alert()
- setInterval()
- clearInterval()

SYSTEM_EVENTS:
- INCOME_UPDATED
- INCOME_EVENT
- INCOME_CREDIT
- INCOME_LOG_CREATED
- HOLD_INCOME_RELEASED
