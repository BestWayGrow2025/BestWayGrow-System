# KB_008 — admin_franchise_auth.html

## File Information

File Name:
admin_franchise_auth.html

File Type:
HTML

Module:
Admin Franchise Authentication

Status:
Verified

---

## Purpose

Provides the login interface for Admin Franchise users.

This page collects the Franchise ID and Password,
loads the required core system scripts,
and starts the authentication controller.

---

## UI Components

- Franchise ID input
- Password input
- Login button
- Message display area

---

## Script Loading Order

1. core_boot_manager.js
2. core_initializer.js
3. core_session_authority.js
4. admin_franchise_auth_controller.js

Verified:
✓ Correct loading order
✓ Controller loaded last

---

## Controller

admin_franchise_auth_controller.js

---

## Dependencies

Core Boot Manager

Core Initializer

Core Session Authority

Admin Franchise Authentication Controller

---

## Navigation

Successful Login
→ admin_franchise_dashboard.html

---

## Verification Checklist

✓ HTML valid

✓ Controller linked

✓ Core scripts loaded

✓ No duplicate script loading

✓ Login button present

✓ Input fields verified

✓ Message container available

---

## Notes

This file is a presentation layer only.

Authentication logic is implemented inside:

admin_franchise_auth_controller.js

No business logic exists inside this HTML file.

---

Verification Status

Verified

Repository Documentation Standard:
Documentation First → Verification Second → Code Change Last
