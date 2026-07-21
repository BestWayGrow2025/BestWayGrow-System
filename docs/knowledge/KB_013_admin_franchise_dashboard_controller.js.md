# KB_013_admin_franchise_dashboard_controller.js

## File Name

admin_franchise_dashboard_controller.js

---

## File Type

JavaScript Controller

---

## Module

Admin Franchise Dashboard Controller

---

## Purpose

Controls the Admin Franchise Dashboard.

Provides:

- Franchise authentication
- Dashboard initialization
- Profile rendering
- System status display
- Downline user monitoring
- Automatic dashboard refresh
- Activity logging
- Secure logout

---

## Initialization Flow

DOMContentLoaded

↓

initPage()

↓

authPage()

↓

bindEvents()

↓

loadPage()

---

## Main Functions

### initPage()

Initializes the page.

Core initialization is handled by:

- core_boot_manager.js
- core_initializer.js

---

### redirectLogin()

Destroys the current session.

Redirects to:

admin_franchise_auth.html

---

### authPage()

Verifies:

- Session exists
- User exists
- Franchise role
- Active account
- Franchise access enabled

Redirects to login if verification fails.

---

### bindEvents()

Binds:

- Logout button

---

### loadPage()

Loads:

- Profile
- System status
- Downline users

Logs dashboard access.

Starts automatic refresh every 4 seconds.

---

### renderProfile()

Displays:

- User ID
- Username
- Status

---

### loadSystem()

Displays:

- Registration status
- Franchise access
- Lock mode
- Queue status
- Withdrawal status

---

### loadUsers()

Displays franchise downline users.

Shows:

- User ID
- Username
- Status
- Wallet

---

### logout()

Stops refresh timer.

Logs logout activity.

Destroys session.

Redirects to login.

---

## Repository Dependencies

getSession()

destroySession()

getCurrentUser()

hasRole()

getSystemSettings()

getUsers()

logActivity()

---

## Global Variables

session

currentUser

lock

refreshTimer

---

## Exports

None

Controller works through DOM events.

---

## Authentication

Role Required:

Franchise

---

## Verification Status

Verified

---

## Verification Date

2026-07-21

---

## Remarks

Authentication verified.

Dashboard refresh verified.

System monitoring verified.

Downline monitoring verified.

Logout process verified.

No proven defects found.

No code modification required.


