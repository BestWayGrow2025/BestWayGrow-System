# KB_013_admin_franchise_pin_request_controller.js

## File Information

| Item | Details |
|------|----------|
| File Name | admin_franchise_pin_request_controller.js |
| Version | V1.0 |
| Module | Admin Franchise |
| File Type | JavaScript Controller |
| Status | Verified |
| Verification Date | 2026-07-21 |

---

# Purpose

Controls the Franchise PIN Request module.

Provides authenticated franchise users with the ability to:

- Submit PIN requests
- View previous requests
- Track request status
- Return to Franchise Dashboard

---

# Entry Point

```javascript
DOMContentLoaded
```

Calls:

1. initPage()
2. authPage()
3. bindEvents()
4. loadPage()

---

# Repository Dependencies

- getSession()
- destroySession()
- getCurrentUser()
- hasRole()
- logActivity()

---

# Browser Dependencies

- document
- window.location
- localStorage
- JSON
- Date

---

# Local Storage

Reads:

- pinRequests

Writes:

- pinRequests

---

# DOM Elements

- backBtn
- submitBtn
- quantity
- requestTable

---

# Main Functions

## initPage()

Initializes the controller.

Core initialization is handled by:

- core_boot_manager.js
- core_initializer.js

---

## redirectLogin()

Destroys the active session (if available).

Redirects user to:

admin_franchise_auth.html

---

## authPage()

Performs authentication.

Verifies:

- Session exists
- Current user exists
- Franchise role
- Active account

Redirects to login if validation fails.

---

## bindEvents()

Registers UI events.

Buttons:

- Back
- Submit PIN Request

---

## loadPage()

Loads existing PIN requests.

Calls:

- loadRequests()

---

## getRequests()

Reads PIN requests from Local Storage.

Returns array.

---

## saveRequests(data)

Stores updated PIN requests into Local Storage.

---

## submitRequest()

Creates a new PIN request.

Validation:

- Quantity required
- Quantity greater than zero

Creates:

- Request ID
- User ID
- Quantity
- Status
- Timestamp

Stores request.

Logs activity.

Refreshes request list.

---

## loadRequests()

Displays only requests created by the logged-in franchise.

Newest requests appear first.

Columns:

- Request ID
- Quantity
- Status
- Created Date

---

## goBack()

Redirects to:

admin_franchise_dashboard.html

---

# Execution Flow

DOMContentLoaded

↓

initPage()

↓

authPage()

↓

bindEvents()

↓

loadPage()

↓

loadRequests()

↓

User submits request

↓

submitRequest()

↓

saveRequests()

↓

loadRequests()

---

# Security

Authentication required.

Franchise role required.

Inactive accounts rejected.

Session validation performed before use.

---

# Output

Admin Franchise PIN Request Dashboard

Features:

- Submit PIN Request
- View Request History
- Track Request Status
- Return to Dashboard

---

# Current Status

✅ Verified

No proven defects found.

Repository documentation synchronized.

Code modification not required.
