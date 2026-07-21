# KB_009 — admin_franchise_auth_controller.js

## File Information

File Name:
admin_franchise_auth_controller.js

File Type:
JavaScript Controller

Module:
Admin Franchise Authentication

Status:
Verified


---

## Purpose

Controls the Admin Franchise login process.

Responsibilities:

- Initialize franchise authentication page
- Bind login events
- Validate Franchise ID and Password
- Verify franchise role
- Check account status
- Create franchise login session
- Redirect authenticated franchise users


---

## Entry Flow

DOMContentLoaded

↓

initPage()

↓

authPage()

↓

bindEvents()

↓

loadPage()


Login Flow:

login()

↓

getUsers()

↓

Validate Franchise User

↓

Save loggedInFranchise Session

↓

Redirect:

admin_franchise_dashboard.html


---

## Dependencies

Repository Functions:

getUsers()

Browser Storage:

localStorage

Storage Key:

loggedInFranchise


---

## Authentication Rules

Verified:

✓ User ID validation

✓ Password validation

✓ Franchise role validation

✓ Active account check

✓ Login lock protection

✓ Redirect after successful login


---

## External Files

Related HTML:

admin_franchise_auth.html


Next Page:

admin_franchise_dashboard.html


---

## Exports

No global exports.

Functions are used internally.


---

## Security Checks

✓ Invalid login blocked

✓ Empty credentials blocked

✓ Inactive account blocked

✓ Login double click protection


---

## Verification Checklist

✓ File exists

✓ Controller logic checked

✓ Entry function checked

✓ Dependencies checked

✓ No duplicate initialization found

✓ No legacy core dependency found


---

## Remarks

Controller uses localStorage based franchise session.

Further dashboard verification required.

---

Verification Status:

Verified

Documentation First → Verification Second → Code Change Last
