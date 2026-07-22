# KB_027 — admin_pin_request_controller.js
## Purpose
Controller for Admin PIN Request Management.

## Responsibilities
- Initialize page.
- Authenticate admin.
- Redirect unauthorized users.
- Load PIN requests.
- Auto process PIN requests.
- Reject PIN requests.
- Auto refresh request list.
- Logout admin.

## Dependencies
- initCoreSystem()
- getSession()
- destroySession()
- getUserById()
- getPinRequests()
- executePinFlow()
- processPinRequestAuto()
- rejectPinRequest()
- logActivity()

## Verification Status  ✅ Verified
## Documentation Status   ✅ Updated
## Module Status  ✅ Admin PIN Request Management module completed.
## Last Verified   2026-07-22
