KB_014 — admin_franchise_pin_request_controller.js
FILE TYPE: JavaScript Controller
 ROLE: Admin Franchise PIN Request Controller
 VERSION: V1.0
ACTUAL DATA / FUNCTION PLACEMENT
01 — File Mode
"use strict";
02 — Declared State
session = null
currentUser = null
lock = false
03 — Main Purpose
Admin Franchise PIN Request
Authentication Guard
PIN Request Creation
Request Tracking
04 — Entry Event
DOMContentLoaded
05 — DOMContentLoaded Execution Order
initPage()
 → authPage()
 → bindEvents()
 → loadPage()
06 — initPage()
Core initialization is stated as being handled by:
core_boot_manager.js
core_initializer.js
No legacy initCoreSystem() call is made inside this function.
07 — redirectLogin()
Performs:
Checks destroySession
Calls destroySession() when available
Redirects to admin_franchise_auth.html
08 — authPage() Session Dependency
Checks whether getSession exists.
If unavailable: redirectLogin()
09 — authPage() Session Retrieval
session = getSession()
10 — Session Validation
Requires: session.userId
If missing: redirectLogin()
11 — Current User Dependency
Checks whether getCurrentUser exists.
If unavailable: redirectLogin()
12 — Current User Retrieval
currentUser = getCurrentUser()
13 — Current User Validation
If currentUser is unavailable: redirectLogin()
14 — Franchise Role Validation
Checks: hasRole("franchise")
If hasRole is unavailable or the role check fails: redirectLogin()
15 — Account Status Source
Status is taken from: currentUser.accountStatus or currentUser.status or "active"
16 — Account Status Rule
Only status "active" continues.
Otherwise:
alert("Account inactive")
redirectLogin()
17 — bindEvents()
Looks for:
backBtn
submitBtn
18 — Back Button Event
backBtn → goBack
19 — Submit Button Event
submitBtn → submitRequest
20 — loadPage()
Calls: loadRequests()
21 — getRequests()
Reads: localStorage.getItem("pinRequests")
Default: "[]"
Returns parsed JSON.
22 — Request Storage
Storage key: pinRequests
Storage mechanism: localStorage
23 — saveRequests(data)
Writes: localStorage.setItem("pinRequests", JSON.stringify(data))
24 — submitRequest() Lock
If lock is already true: return immediately.
25 — Quantity DOM Source
Reads: document.getElementById("quantity")
If unavailable: return.
26 — Quantity Conversion
parseInt(quantityInput.value, 10)
Stored in: qty
27 — Quantity Validation
Requires: qty > 0
Failure: alert("Enter valid quantity")
28 — Request Lock Activation
After validation: lock = true
29 — Existing Request Retrieval
getRequests()
30 — New Request Object
Created with:
requestId
userId
quantity
status
createdAt
31 — requestId Generation
Format: "REQ" + Date.now()
32 — Request User
userId = currentUser.userId
33 — Request Quantity
quantity = qty
34 — Initial Request Status
status = "PENDING"
35 — Request Creation Time
createdAt = new Date().toISOString()
36 — Request Persistence
New request is appended using: requests.push(newRequest)
37 — Request Save
saveRequests(requests)
38 — Activity Logging Dependency
Checks whether logActivity exists.
39 — Activity Log Data
Calls: logActivity(currentUser.userId, currentUser.role, "Created PIN Request", "FRANCHISE")
40 — Success Message
alert("✅ PIN Request Submitted")
41 — Quantity Reset
quantityInput.value = ""
42 — Request List Refresh
Calls: loadRequests()
43 — Request Lock Release
lock = false
44 — loadRequests() DOM Target
Looks for: requestTable
If unavailable: return.
45 — Request Data Source
getRequests()
46 — User-Specific Request Filter
Requests are filtered where: request.userId === currentUser.userId
47 — Table Reset
table.innerHTML = ""
48 — Empty Request State
If no matching requests: <tr><td colspan='4'>No requests</td></tr>
49 — Request Display Order
Uses: myRequests.slice().reverse()
Therefore newest array entries are displayed first.
50 — Request Row Creation
Each request creates: document.createElement("tr")
51 — Request ID Display
request.requestId || "-"
52 — Quantity Display
request.quantity || 0
53 — Status Display
request.status || "-"
54 — Created Date Display
If request.createdAt exists: new Date(request.createdAt).toLocaleString()
Otherwise: "-"
55 — Table Row Insertion
Created row is appended to: requestTable
56 — goBack()
Redirects to: admin_franchise_dashboard.html
57 — External Function References
destroySession()
getSession()
getCurrentUser()
hasRole()
logActivity()
58 — External Script/Authority Relationship
The controller expects session/authentication functions to be available externally; it does not define them.
59 — Main DOM Dependencies
backBtn
submitBtn
quantity
requestTable
60 — Main Flow
DOMContentLoaded → initialization
 → franchise authentication
 → event binding
 → request loading
 → quantity validation
 → request creation
 → localStorage save
 → activity logging
 → request display
61 — Security/Access Data Present
Session existence
Current-user existence
Franchise role
Active account status
Session destruction on failed access
62 — Concurrency/Interaction Control
lock prevents repeated submitRequest() execution while a request is being processed.
63 — Storage Data Model
pinRequests contains an array of request objects with: requestId, userId, quantity, status, createdAt
64 — File Boundary
No HTML structure is defined in this JavaScript file.
65 — FIRST DOCUMENT STATUS
KB_014 ACTUAL DATA RECORDED — RECHECKED.

KB_015 — admin_franchise_pin_request_dashboard.html
FILE TYPE: HTML
 ROLE: Admin Franchise PIN Request Dashboard UI
ACTUAL DATA / FUNCTION PLACEMENT
01 — Document Structure
Standard HTML document: <!DOCTYPE html>
02 — Head Title
Admin Franchise PIN Requests
03 — Favicon
data:,
04 — Body Purpose
Admin Franchise PIN Request System interface.
05 — Main Heading
📌 ADMIN FRANCHISE PIN REQUEST SYSTEM
06 — Back Button
Element: <button id="backBtn">
Displayed action: ⬅ Back to Dashboard
07 — Create Request Section
Container: .box
Heading: Create PIN Request
08 — Quantity Input
Element ID: quantity
Type: number
Placeholder: Enter quantity
09 — Submit Button
Element ID: submitBtn
Displayed action: Submit Request
10 — My Requests Section
Container: .box
Heading: My Requests
11 — Request Table
Table is used to display the user's PIN requests.
12 — Table Header
Columns:
Request ID
Quantity
Status
Date
13 — Request Table Body
Element ID: requestTable
This is the DOM target populated by KB_014.
14 — Controller Event Relationship
backBtn is handled by goBack() in KB_014.
15 — Controller Event Relationship
submitBtn is handled by submitRequest() in KB_014.
16 — Quantity Data Relationship
quantity is read by KB_014.
17 — Request Display Relationship
requestTable is populated by loadRequests() in KB_014.
18 — Core Script Dependency
Loads: core_boot_manager.js
19 — Core Initializer Dependency
Loads: core_initializer.js
20 — Session Authority Dependency
Loads: core_session_authority.js
21 — Page Controller Dependency
Loads: admin_franchise_pin_request_controller.js
22 — Script Order
Scripts are loaded in this order:
core_boot_manager.js
core_initializer.js
core_session_authority.js
admin_franchise_pin_request_controller.js
23 — UI Input
PIN request quantity.
24 — UI Output
Request table containing:
Request ID
Quantity
Status
Date
25 — Navigation UI
Back-to-dashboard control.
26 — CSS Layout
Body uses centered text and light dashboard background.
27 — Button Styling
Buttons have padding, rounded corners, blue background, white text.
28 — Request Box Styling
.box provides white card-style presentation with width, padding, margin, rounded corners and shadow.
29 — Input Styling
Quantity input uses full width, padding, margin, border and rounded corners.
30 — Table Styling
Table uses:
full width
collapsed borders
top margin
31 — Table Cell Styling
th and td use:
border
padding
small font
centered text
32 — Header Styling
th has a light background.
33 — No Named JavaScript Functions
No functions are defined directly inside this HTML file.
34 — No Direct Storage
No localStorage operation is present in this HTML file.
35 — No Direct Authentication Logic
Authentication is delegated to the loaded controller/Core scripts.
36 — No Direct Authorization Logic
Authorization is delegated to the loaded controller/Core scripts.
37 — No Direct Request Creation Logic
Request creation is delegated to KB_014.
38 — No Direct Request Loading Logic
Request loading is delegated to KB_014.
39 — DOM Contract
KB_015 provides the DOM elements required by KB_014:
backBtn
submitBtn
quantity
requestTable
40 — Page Flow
Page loads Core scripts → session authority → PIN request controller → controller binds events and renders requests.
41 — FIRST DOCUMENT STATUS
KB_015 ACTUAL DATA RECORDED — RECHECKED.

KB_016 — admin_income_audit_controller.js
FILE TYPE: JavaScript Controller
 ROLE: Admin Income Audit Controller
 VERSION: V2.0
ACTUAL DATA / FUNCTION PLACEMENT
01 — File Mode
"use strict";
02 — Declared State
currentAdminUser = null
incomeAuditLock = false
03 — Declared Purpose
Unified session authority
Admin role validation
Income audit viewer
No direct localStorage session usage
No core_system dependency
Production safe read-only
04 — Entry Event
DOMContentLoaded
05 — DOMContentLoaded Action
Calls: initIncomeAuditPage()
06 — initIncomeAuditPage()
Execution sequence: authAdmin() → bindIncomeAuditEvents() → loadIncomeAuditPage()
Wrapped in try/catch.
07 — Initialization Error Handling
Errors are logged with: console.error("[ADMIN INCOME AUDIT ERROR]", err)
08 — redirectLogin()
Checks for: destroySession()
If available, calls it.
Then redirects to: admin_auth.html
09 — authAdmin() Session Dependency
Requires: getSession()
If unavailable: redirectLogin()
10 — Session Retrieval
const session = getSession()
11 — Session Validation
Requires: session.userId
Failure: redirectLogin()
12 — Current User Dependency
Requires: getCurrentUser()
Failure: redirectLogin()
13 — Current Admin User Retrieval
currentAdminUser = getCurrentUser()
14 — Current User Validation
If unavailable: redirectLogin()
15 — Admin Role Validation
Checks: hasRole("admin")
Failure or unavailable function: redirectLogin()
16 — Account Status Source
Uses: currentAdminUser.accountStatus or currentAdminUser.status or "active"
17 — Account Status Rule
Only "active" continues.
Otherwise: redirectLogin()
18 — bindIncomeAuditEvents()
Looks for:
filterType
refreshBtn
19 — Filter Event
filterType change event calls: loadIncomeAuditPage()
20 — Refresh Event
refreshBtn click event calls: loadIncomeAuditPage()
21 — loadIncomeAuditPage()
Checks: incomeAuditLock
If locked: return.
22 — Audit Lock Activation
incomeAuditLock = true
23 — Audit Page Load Execution
Calls: loadIncomeLogs()
24 — Audit Lock Release
finally sets: incomeAuditLock = false
25 — loadIncomeLogs() Table Target
Looks for: incomeTable
If unavailable: return.
26 — Income Log Dependency
Checks: getIncomeLogs()
If available, retrieves logs.
Otherwise uses: []
27 — Log Array Validation
If returned value is not an array: logs = []
28 — Type Filter Source
Reads: filterType.value
Default: ""
29 — User Filter Source
Reads: filterUser.value
Applies: .trim()
Default: ""
30 — Type Filtering
If type is present: logs are filtered where: log.type === type
31 — User Filtering
If userId is present: logs are filtered where: log.userId === userId
32 — Table Reset
incomeTable.innerHTML = ""
33 — Total Initialization
let total = 0
34 — Empty Log State
If no logs remain: renders: No Data
with: colspan="6"
35 — Display Order
Uses: logs.slice().reverse()
36 — Log Amount Conversion
Number(log.amount || 0)
37 — Total Calculation
Each converted amount is added to: total
38 — Table Row Creation
Creates: document.createElement("tr")
39 — Log Time Display
If log.time exists: new Date(log.time).toLocaleString()
Otherwise: "-"
40 — Log User Display
log.userId || "-"
41 — Log Type Display
log.type || "-"
42 — Log Amount Display
₹${amount.toFixed(2)}
43 — Source User Display
log.sourceUser || "-"
44 — Note Display
log.note || "-"
45 — Row Insertion
Generated row is appended to: incomeTable
46 — Total Payout DOM Target
Looks for: totalPayout
47 — Total Records DOM Target
Looks for: totalRecords
48 — Total Payout Output
If totalPayout exists: total.toFixed(2)
49 — Total Records Output
If totalRecords exists: logs.length
50 — Export
window.loadIncomeAuditPage = loadIncomeAuditPage
51 — Export
window.loadIncomeLogs = loadIncomeLogs
52 — Runtime Marker
window.ADMIN_INCOME_AUDIT
Contains:
loaded: true
time: Date.now()
53 — External Function References
destroySession()
getSession()
getCurrentUser()
hasRole()
getIncomeLogs()
54 — External Authority Relationship
Session/authentication functions are expected from external Core/session authority.
55 — Income Data Authority Relationship
Income records are obtained from external getIncomeLogs().
56 — Read-Only Behavior
The supplied file reads and renders income logs; no write/update/delete operation for income logs is defined.
57 — Direct Session Storage
No direct localStorage session operation is present.
58 — Core System Reference
No core_system dependency is present in the supplied implementation.
59 — Main DOM Contract
The controller expects:
filterType
filterUser
refreshBtn
incomeTable
totalPayout
totalRecords
60 — Main Flow
DOMContentLoaded → initIncomeAuditPage() → admin authentication → event binding → income-log retrieval → type/user filtering → reverse display → amount totaling → table rendering → totals rendering
61 — Security Data Present
Session validation
Current-user validation
Admin-role validation
Active-status validation
Session destruction on failed access
62 — Interaction Protection
incomeAuditLock prevents overlapping audit-page loads.
63 — Data Fields Read
Income log fields actually referenced:
time
userId
type
amount
sourceUser
note
64 — Error Boundary
Initialization has try/catch; page-load locking has try/finally.
65 — FIRST DOCUMENT STATUS
KB_016 ACTUAL DATA RECORDED — RECHECKED.

KB_017 — Data Point Sequence
File supplied: admin_income_audit_dashboard.html
ACTUAL DATA POINT SEQUENCE
1. Page → Admin Income Audit Dashboard
2. Summary → totalPayout
→ totalRecords
3. Filter → filterType
→ filterUser
→ refreshBtn
4. Filter Type Values → All
→ Upgrade
→ Repurchase
→ CTOR
5. Income Audit Table → incomeTable
6. Table Columns → Date
→ User
→ Type
→ Amount
→ From
→ Note
7. Script Loading Sequence → core_boot_manager.js
→ core_initializer.js
→ core_session_authority.js
→ admin_income_audit_controller.js
ACTUAL FLOW
admin_income_audit_dashboard.html
↓
Summary data points
↓
Filter data points
↓
Income audit table
↓
admin_income_audit_controller.js
STATUS
KB_017 → ACTUAL DATA POINT SEQUENCE RECORDED ✅
No problem check
No solution
No code change
Data-point documentation only

KB_018 — admin_income_dashboard.html
FILE TYPE: HTML
ROLE: Admin Income Dashboard
ACTUAL POINTS PRESENT
HTML document structure
lang="en"
UTF-8 charset
Page title: Admin Income Dashboard
Favicon: data:,
Body styling
Card UI structure
Income dashboard heading
filterType select control
Filter option: All
Filter option: Upgrade
Filter option: Repurchase
Filter option: CTOR
refreshBtn button
Total Income display
totalPayout DOM target
Total Records display
totalRecords DOM target
Income table
Table header: Time
Table header: User ID
Table header: Type
Table header: Amount
Table header: Source
Table header: Note
incomeTable tbody target
Existing repository files only comment
Core dependency: core_boot_manager.js
Core dependency: core_initializer.js
Session dependency: core_session_authority.js
Dashboard controller dependency: admin_income_dashboard.js
Script loading order: Boot → Initializer → Session → Dashboard
No JavaScript function defined directly in this HTML
No direct localStorage operation
No direct authentication logic
No direct authorization logic
No direct income calculation logic
No direct income-log loading logic
UI provides filter input to controller
UI provides refresh action to controller
UI provides total-income output target
UI provides total-record output target
UI provides income-log output target
Income data presentation fields are fixed by the table
Page is an Admin Income Dashboard UI
Controller behavior is delegated to admin_income_dashboard.js
STATUS: KB_018 FIRST-DOCUMENT DATA RECORDED.
No problem analysis. No solution. No code change. No ownership reassignment. ❤️

KB_019 — admin_income_dashboard.js
FILE TYPE: JavaScript
ROLE: Admin Income Dashboard Controller
ACTUAL POINTS PRESENT
Strict mode enabled
Controller version declaration: V2.0
Unified session-authority compatibility declared
loggedInAdmin dependency explicitly excluded
core_system.js dependency explicitly excluded in header
Safe DOM handling declared
Income-log rendering
SYSTEM_EVENTS compatibility
Window exports
Global session state
Global currentUser state
Global incomeLock state
DOMContentLoaded listener
initPage() entry function
Optional initCoreSystem() call
authPage() invocation
bindEvents() invocation
loadAllIncome() invocation
getSession() session retrieval
Missing-session redirect to admin_auth.html
Session userId validation
getUserById() user lookup
Admin-role validation
User status validation
Inactive-account redirect
filterType DOM lookup
refreshBtn DOM lookup
Filter change event
Refresh click event
loadAllIncome() function
Income-load lock
getIncomeLogs() dependency
Empty-log fallback
Income type filtering
renderIncomeTable() invocation
Income-load error handling
finally lock release
renderIncomeTable() function
incomeTable DOM lookup
Table clearing
Total amount accumulator
Empty-data table message
Zero-summary update for empty data
Reverse-order log rendering
Numeric amount conversion
Total income calculation
Dynamic table-row creation
Income time rendering
User ID rendering
Income type rendering
Amount rendering with ₹ and two decimals
Source-user rendering
Note rendering
updateSummary() invocation
Record-count calculation
updateSummary() function
totalPayout DOM target
totalRecords DOM target
Total formatting to two decimals
Record-count output
SYSTEM_EVENTS bridge IIFE
Internal refresh() bridge function
SYSTEM_EVENTS.on existence check
INCOME_UPDATED event subscription
INCOME_LOG_CREATED event subscription
Event-triggered dashboard refresh
window.loadAllIncome export
window.renderIncomeTable export
window.updateIncomeSummary export
window.__ADMIN_INCOME_DASHBOARD__ diagnostic object
Diagnostic loaded flag
Diagnostic file identifier
Diagnostic timestamp
TOTAL ACTUAL POINTS: 73
This is 73 because this file actually contains 73 identifiable implementation/documentation points. We do not force it to 60. No extra points are invented and no present point is skipped. ❤️
KB_019 status: FIRST-DOCUMENT DATA RECORDED.

