# BWG_06_MODULE_REGISTRY

## PURPOSE

This document is the official registry of every BestWayGrow module.

Every module must be listed here after verification.

This is the single source of truth for module registration.

---

## MODULE REGISTRY FORMAT

Each module must be documented using the following format:

Module Name:
HTML File:
JavaScript File:
Entry Function:
Loaded By:
Router:
Access Role:
Purpose:
Dependencies:
Exports:
Current Status:
Verification Date:
Remarks:
---

## MODULE VERIFICATION RULES

Before adding a module, verify:

✓ HTML exists
✓ JavaScript exists
✓ Entry function exists
✓ Router exists
✓ Loader exists
✓ No duplicate loading
✓ No duplicate initialization
✓ Dependencies verified
---

## MODULE STATUS

⬜ Not Started
⬜ Under Verification
⬜ Verified
⬜ Production Ready
---
## NOTES

This document will be updated module by module after repository verification.
No module should be added without verification.
==================================================
MODULE 001
==================================================
Module Name:  Admin Activity Audit
HTML File:  admin_activity_audit_dashboard.html
JavaScript File:  admin_activity_audit_controller.js
Entry Function:   initAdminActivityAudit()
Loaded By:   admin_activity_audit_dashboard.html
Router:   Admin Dashboard → Admin Activity Audit Dashboard
Access Role: Admin
Purpose: Controls the Admin Activity Audit module. Initializes the page, authenticates the administrator, loads activity logs, supports filtering and log clearing, and records audit viewing activity.

Dependencies:
initCoreSystem()
getSession()
destroySession()
getCurrentUser()
hasRole()
getActivityLogs()
filterLogsAdvanced()
clearActivityLogs()
logActivity()

Exports:
initAdminActivityAudit()
loadAdminActivityLogs()
applyAdminAuditFilter()
clearAdminActivityLogs()

Current Status:  Verified

Verification Date:  2026-07-21
Remarks: Verified against repository. No proven defects found. No code changes required.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module Name
Admin Authentication
HTML File: admin_auth.html
JavaScript File: admin_auth.js
Entry Function: bindAdminLoginEvents()
Loaded By: admin_auth.html
Router: Direct page initialization (DOMContentLoaded)
Access Role: Administrator
Purpose: Authenticates administrators, validates credentials, creates administrator sessions, records login activity, and redirects authenticated administrators to the Admin Dashboard.
Dependencies:
getSession()
getUsers()
setSession()
logActivity()
Exports:
submitAdminLogin()
Current Status: ✅ Verified
Verification Date: 2026-07-21
Remarks: Authentication controller verified. No proven defects found. Code modification not required.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module Name:  Admin Dashboard
HTML File:  admin_dashboard.html
JavaScript File:  admin_dashboard_controller.js
Entry Function:  startAdminDashboard()

Loaded By: admin_dashboard.html
Router:  DOMContentLoaded
Access Role:  Administrator
Purpose:   Controls the Administrator Dashboard, verifies administrator authentication, manages dashboard navigation, loads dashboard modules, refreshes user data, and handles logout.

Dependencies:
- initCoreSystem()
- getSession()
- getUserById()
- getUsers()
- logoutSession()
- getAdminTreeView()

Exports:
- startAdminDashboard()
- loadHome()
- loadUsers()
- renderUsers()
- loadPinsUI()
- logout()
- openAdminTreeView()
- getAdminFullTree()

Current Status: ✅ Verified
Verification Date: 2026-07-21

Remarks:  Dashboard controller verified. No proven defects found. Code modification not required.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module Name
Admin Escrow Control Authority
HTML File: Loaded inside the Admin Dashboard (mainContent)
JavaScript File: admin_escrow_control_authority.js
Entry Function: loadEscrowAdminPanel()
Loaded By: Admin Dashboard Controller
Router: Dashboard module loader
Access Role: Administrator
Purpose: Provides administrator authority for viewing escrow records, approving escrow requests, rejecting escrow requests, and recording escrow audit activity.
Dependencies:
getSession()
loadEscrows()
updateEscrowStatus()
logActivity()
Exports:
loadEscrowAdminPanel()
approveEscrow()
rejectEscrow()
Current Status: ✅ Verified
Verification Date: 2026-07-21
Remarks: Escrow authority module verified. No proven defects found. Code modification not required.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module Name:  Admin Franchise Authentication
HTML File:   admin_franchise_auth.html
JavaScript File:  admin_franchise_auth_controller.js
Entry Function:   To be verified from controller file
Loaded By:  HTML script loader
Router:   Admin Franchise Authentication Flow
Access Role:   Admin Franchise
Purpose:   Provides the Admin Franchise login interface.
Collects Franchise ID and Password input
and loads the authentication controller.

Dependencies:
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_franchise_auth_controller.js

Exports:
None (HTML View)
Current Status:   Verified
Verification Date: 2026-07-21

Remarks:
HTML view verified.
Controller verification pending separately.
♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
Module Name:  Admin Franchise Authentication
HTML File:   admin_franchise_auth.html
JavaScript File:   admin_franchise_auth_controller.js
Entry Function:   DOMContentLoaded
Loaded By:  admin_franchise_auth.html
Router:   Admin Franchise Authentication Flow
Access Role:   Franchise Admin

Purpose:   Handles franchise login authentication,
credential validation, session creation,
and redirect to franchise dashboard.

Dependencies:
getUsers()
localStorage.loggedInFranchise

Exports:  None
Current Status: Verified
Verification Date:  2026-07-21

Remarks:  Controller verified.
No code modification required.

❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module Name:  Admin Franchise Authority
HTML File:   admin_franchise_authority.html
JavaScript File:   admin_franchise_authority.js
Entry Function:  To be verified from controller
Loaded By:  HTML script loader
Router:  Admin Franchise Authority Flow
Access Role: Admin
Purpose:
Provides interface for managing franchise requests
and authority actions.

Dependencies:   admin_franchise_authority.js
Exports: None (HTML View)
Current Status:  Verified
Verification Date: 2026-07-21

Remarks:  HTML view verified.
Controller verification pending.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module Name:  Admin Franchise Authority
HTML File:  admin_franchise_authority.html
JavaScript File:  admin_franchise_authority.js

Entry Function: bindFranchiseAuthorityEvents()
Loaded By:  admin_franchise_authority.html
Router:   Admin Franchise Authority Flow
Access Role:  Admin

Purpose:   Controls franchise request monitoring,
approval, rejection, and authority actions.

Dependencies:
getFranchiseRequests()
approveFranchiseRequest()
rejectFranchiseRequest()

Exports:
loadFranchiseRequests()
approveFranchise()
rejectFranchise()
resetUserPassword()

Current Status:  Verified
Verification Date:   2026-07-21
Remarks: Controller verified. 
External approval functions require separate verification.

♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️♥️
Module Name:   Admin Franchise Dashboard
HTML File:     admin_franchise_dashboard.html
JavaScript File:   admin_franchise_dashboard_controller.js
Purpose :   Provides the Admin Franchise Dashboard interface.
Current Status:    Verified
Verification Date: 2026-07-21
Remarks: Dashboard HTML verified.
Controller documented separately.
❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
Module Name:      admin Franchise Dashboard Controller
JavaScript File:  admin_franchise_dashboard_controller.js
Entry Function:   loadPage()

Loaded By:     admin_franchise_dashboard.html
Access Role:   Franchise Admin

Purpose:
Controls the Franchise Dashboard.
Verifies authenticated franchise session.
Displays franchise profile.
Shows system status.
Lists users under the franchise.
Handles automatic dashboard refresh.
Processes franchise logout.
Dependencies:
getSession()
destroySession()
getCurrentUser()
hasRole()
getSystemSettings()
getUsers()
logActivity()

Exports:  None
Current Status :  ✅ Verified
Verification Date:   2026-07-21
Remarks: Franchise Dashboard Controller verified.
No proven defects found.
Code modification not required.


