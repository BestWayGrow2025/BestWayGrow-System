KB_006 — admin_dashboard_controller.js
1. File Identity
Repository File: admin_dashboard_controller.js
Module: Admin Dashboard
Related HTML: admin_dashboard.html
Verification Status: ✅ Verified
Verification Date: 2026-07-21

2. Purpose
This controller manages the Administrator Dashboard. It initializes the dashboard, authenticates the administrator session, displays the welcome message, manages dashboard navigation, loads dashboard modules, refreshes user information, and processes administrator logout.

3. Business Responsibility
This controller is responsible for:
Initializing the Admin Dashboard
Initializing the Core System
Verifying administrator authentication
Displaying the administrator welcome message
Binding dashboard events
Loading dashboard pages
Displaying user information
Refreshing dashboard data automatically
Displaying placeholder modules
Opening the administrator tree view
Logging out administrators

4. Entry Point
The controller starts automatically after the page finishes loading.
Execution Flow:
DOMContentLoaded
        ↓
startAdminDashboard()
        ↓
initPage()
        ↓
checkAuth()
        ↓
bindEvents()
        ↓
loadHome()
        ↓
startAutoRefresh()


5. Functions
Function
Purpose
startAdminDashboard()
Starts the complete dashboard initialization
initPage()
Initializes the core system
checkAuth()
Verifies administrator session
redirectLogin()
Redirects unauthenticated users to the login page
bindEvents()
Binds dashboard buttons and menu events
startAutoRefresh()
Refreshes dashboard data automatically
loadHome()
Displays dashboard overview
loadUsers()
Displays the user list
renderUsers()
Renders users into the table
loadPinsUI()
Loads the PIN module placeholder
loadWalletSafe()
Loads the Wallet module placeholder
loadIncomeSafe()
Loads the Income module placeholder
loadSystemSafe()
Loads the System module placeholder
loadReportsSafe()
Loads the Reports module placeholder
showPlaceholder()
Displays temporary module content
openAdminTreeView()
Opens the administrator tree view
getAdminFullTree()
Returns the administrator tree
logout()
Logs out the administrator

6. Authentication Rules
Before displaying the dashboard, the controller verifies:
Session exists
Session role is Administrator
Administrator record exists
Administrator information is available
If authentication fails:
Session is cleared
Auto refresh stops
User is redirected to admin_auth.html

7. Dashboard Modules
Current dashboard navigation:
Home
Users
PIN
Wallet
Income
System
Reports
These modules are selected using the data-page attribute.

8. Auto Refresh
The controller refreshes dashboard data every 5 seconds.
Current implementation refreshes:
User List
The refresh timer is stopped automatically during logout.

9. External Dependencies
Repository dependencies:
initCoreSystem()
getSession()
getUserById()
getUsers()
logoutSession()
getAdminTreeView()
Browser APIs:
setInterval()
clearInterval()
setTimeout()

10. Required HTML Elements
The following HTML IDs must exist:
welcome
logoutBtn
mainContent
userTableBody
The following selector must exist:
.menu button

11. Global Variables
adminUser
clickLock
menuBound
dashboardAutoRefresh

12. Exported Functions
startAdminDashboard()
loadHome()
loadUsers()
renderUsers()
loadPinsUI()
logout()
openAdminTreeView()
getAdminFullTree()

13. Navigation
Incoming Page:
admin_dashboard.html
Outgoing Page:
admin_auth.html (Logout or Authentication Failure)

14. Common Debugging Questions
Dashboard redirects to login
Check:
getSession()
Session role
Authentication status

Welcome message not displayed
Check:
welcome element
getUserById()

Dashboard menu not working
Check:
.menu button
Event binding
data-page values

Users do not display
Check:
getUsers()
userTableBody
renderUsers()

Dashboard does not refresh
Check:
startAutoRefresh()
setInterval()
Active dashboard page

Logout fails
Check:
logoutSession()
redirectLogin()

15. Verification Result
Repository verification completed.
Result:
Dashboard initialization verified
Authentication verified
Navigation verified
Auto refresh verified
Module loading verified
Logout verified
Export verification completed
No duplicate event binding detected
No proven defects found
Code modification was not required.

16. Related Documentation
BWG_06_MODULE_REGISTRY.md
BWG_08_DEPENDENCY_MAP.md
BWG_10_FILE_AUDIT_CHECKLIST.md
BWG_11_TROUBLESHOOTING.md
KB_005_admin_dashboard.html.md

17. Notes
This document is the permanent knowledge record for admin_dashboard_controller.js.
Repository Rule:
Documentation First → Verification Second → Code Change Last.
