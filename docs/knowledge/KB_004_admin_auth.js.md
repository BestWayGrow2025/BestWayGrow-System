KB_004 — admin_auth.js
1. File Identity
Repository File: admin_auth.js
Module: Admin Authentication
Related HTML: admin_auth.html
Verification Status: ✅ Verified
Verification Date: 2026-07-21

2. Purpose
This controller manages the Administrator Authentication process. It initializes the login page, binds login events, validates administrator credentials, creates an authenticated session, records login activity, and redirects authenticated administrators to the Admin Dashboard.

3. Business Responsibility
This controller is responsible for:
Initializing the Admin Login page
Preventing duplicate event binding
Checking for existing administrator sessions
Validating administrator credentials
Verifying passwords
Creating administrator sessions
Recording login activity
Displaying login messages
Redirecting authenticated administrators

4. Entry Point
The controller starts automatically after the page finishes loading.
Execution Flow:
DOMContentLoaded
        ↓
bindAdminLoginEvents()
        ↓
checkExistingAdminSession()
        ↓
User clicks Login
        ↓
submitAdminLogin()
        ↓
verifyPassword()
        ↓
setSession()
        ↓
logActivity()
        ↓
Redirect → admin_dashboard.html


5. Functions
Function
Purpose
bindAdminLoginEvents()
Binds login button and Enter key events
checkExistingAdminSession()
Redirects already authenticated administrators
submitAdminLogin()
Performs complete administrator authentication
verifyPassword()
Verifies the entered password against the stored password
showAdminMessage()
Displays login status messages
unlockAdminLogin()
Removes the login lock after validation
submitAdminLogin (Export)
Makes the login function globally available

6. Authentication Rules
Before allowing administrator access, the controller verifies:
Admin ID entered
Password entered
User authority available
Administrator account exists
Administrator role is "admin"
Password is correct
Account status is Active
If all checks pass:
Administrator session is created
Login activity is recorded
Administrator is redirected to admin_dashboard.html

7. External Dependencies
The controller depends on:
getSession()
getUsers()
setSession()
logActivity()
Browser APIs used:
atob()
setTimeout()

8. Required HTML Elements
The following HTML IDs must exist:
adminId
password
loginBtn
msg
Removing or renaming these IDs will prevent the controller from working correctly.

9. Global Variables
ADMIN_LOGIN_LOCK

10. Exported Functions
submitAdminLogin()

11. Navigation
Incoming Page:
admin_auth.html
Outgoing Page:
admin_dashboard.html

12. Common Debugging Questions
Login button does not work
Check:
loginBtn exists
Events are bound successfully
JavaScript loaded without errors

Invalid login displayed
Check:
getUsers()
User ID
Password
Administrator role

Existing session immediately redirects
Check:
getSession()
Session role
Session validity

Login succeeds but dashboard does not open
Check:
setSession()
Redirect path
Browser console for errors

Password verification fails
Check:
Stored password format
Base64 decoding
verifyPassword() execution

13. Verification Result
Repository verification completed.
Result:
Controller verified
Authentication flow verified
Session handling verified
Event binding verified
Export verified
No duplicate event binding detected
No proven defects found
Code modification was not required.

14. Related Documentation
BWG_06_MODULE_REGISTRY.md
BWG_08_DEPENDENCY_MAP.md
BWG_10_FILE_AUDIT_CHECKLIST.md
BWG_11_TROUBLESHOOTING.md
KB_003_admin_auth.html.md

15. Notes
This document is the permanent knowledge record for admin_auth.js.
Repository Rule:
Documentation First → Verification Second → Code Change Last.
