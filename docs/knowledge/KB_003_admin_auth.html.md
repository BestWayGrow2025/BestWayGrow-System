KB_003 — admin_auth.html
1. File Identity
Repository File: admin_auth.html
Module: Admin Authentication
Related Controller: admin_auth.js
Verification Status: ✅ Verified
Verification Date: 2026-07-21

2. Purpose
This HTML file provides the Administrator Login interface. It displays the login form, loads the required core system scripts, and loads the authentication controller responsible for validating administrator credentials and creating an authenticated session.

3. Business Responsibility
This page is responsible for:
Displaying the Administrator Login page
Collecting the Admin ID
Collecting the Password
Displaying authentication messages
Loading the required core system
Loading the authentication controller

4. User Interface Components
Input Fields
adminId
password
Buttons
loginBtn
Message Area
msg

5. Script Loading Sequence
The page loads the following scripts in order:
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_auth.js
The authentication controller is loaded after all required core scripts.

6. Controller Relationship
This page is controlled by:
admin_auth.js
The controller reads the login inputs, validates administrator credentials, manages authentication, and redirects authenticated administrators to the appropriate dashboard.

7. Required HTML IDs
The following HTML IDs must exist:
adminId
password
loginBtn
msg
Removing or renaming these IDs will break authentication functionality.

8. Navigation
Entry Page
Administrator Login
Expected Navigation
After successful authentication, navigation is controlled by admin_auth.js.

9. Common Debugging Questions
Login button does not work
Check:
loginBtn exists
Controller loaded successfully
JavaScript has no loading errors

Credentials cannot be entered
Check:
adminId input exists
password input exists

Login message not displayed
Check:
msg element exists
Controller updates the message correctly

Page loads but authentication does not start
Check JavaScript loading order:
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_auth.js

10. Verification Result
Repository verification completed.
Result:
HTML structure verified
Login form verified
Required HTML IDs verified
Script loading sequence verified
Controller relationship verified
No proven defects found
Code modification was not required.

11. Related Documentation
BWG_10_FILE_AUDIT_CHECKLIST.md
KB_000_INDEX.md
KB_004_admin_auth.js.md

12. Notes
This document is the permanent knowledge record for admin_auth.html.
Repository rule:
Documentation First → Verification Second → Code Change Last.
