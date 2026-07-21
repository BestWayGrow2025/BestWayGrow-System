# KB_011 — admin_franchise_authority.js

## File Information

File Name:
admin_franchise_authority.js

File Type:
JavaScript Controller

Module:
Admin Franchise Authority

Status:
Verified


---

## Purpose

Controls Admin Franchise Authority actions.

Responsibilities:

- Load franchise requests
- Display request status
- Approve franchise requests
- Reject franchise requests
- Reset password action handler
- Bind dashboard events


---

## Entry Function

DOMContentLoaded

↓

bindFranchiseAuthorityEvents()


---

## Main Functions

loadFranchiseRequests()

Purpose:
Loads and displays franchise requests.


approveFranchise(id)

Purpose:
Approves selected franchise request.


rejectFranchise(id)

Purpose:
Rejects selected franchise request.


resetUserPassword()

Purpose:
Handles password reset action placeholder.


---

## Dependencies

External Functions:

getFranchiseRequests()

approveFranchiseRequest()

rejectFranchiseRequest()


Browser:

DOM API


---

## Events

Refresh Button:

refreshBtn

Action:

loadFranchiseRequests()


Reset Password Button:

resetPasswordBtn

Action:

resetUserPassword()


---

## Exports

window.loadFranchiseRequests

window.approveFranchise

window.rejectFranchise

window.resetUserPassword


---

## Verification Checklist

✓ File exists

✓ Controller loaded

✓ Event binding checked

✓ Functions verified

✓ Exports verified

✓ Duplicate initialization checked

✓ Missing imports checked


---

## Remarks

Approval and rejection depend on external authority functions:

approveFranchiseRequest()

rejectFranchiseRequest()

These dependencies require separate verification.

---

Verification Status:

Verified

Documentation First → Verification Second → Code Change Last
