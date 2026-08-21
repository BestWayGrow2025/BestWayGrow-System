# FUNCTION SEARCH MASTER

## Purpose
Master index for finding the actual repository file that owns or defines a particular function.

## Search Rule
PROBLEM / FUNCTION
→ FIND FUNCTION HERE
→ IDENTIFY ACTUAL REPOSITORY FILE
→ OPEN ACTUAL FILE
→ VERIFY
→ IMPLEMENT PRACTICALLY
→ REVERIFY

## Required Data
- Function name
- Actual definition file
- Module
- Function role
- Authority status
- Related functions
- Caller functions
- Callee functions
- Related files
- Notes / problem reference

## Rule
This document is a SEARCH MASTER only.
It does not replace repository code or decide implementation automatically.

## Repository Function Index
To be populated from the actual repository file-by-file.

| Function | Definition File | Module | Role | Authority | Related Functions | Related Files | Notes |
|---|---|---|---|---|---|---|---|

## Function Chain Search
Use when a function calls another function:

Function A
→ Function B
→ Function C
→ Function D

For each function, identify:
1. Definition file
2. Actual owner
3. Role
4. Caller
5. Callee
6. Dependencies
7. Related module
8. Authority conflict, if any

## Important
Never assume a function owner from filename alone.
Verify the actual function definition in the repository.

01_FUNCTION_SEARCH_MASTER.md
# ADMIN MODULE — FUNCTION SEARCH

## KB_001 — admin_activity_audit_controller.js

| Function | Role | File |
|---|---|---|
| initAdminActivityAudit() | Controller initialization | admin_activity_audit_controller.js |
| initAdminAuditPage() | Core initialization bridge | admin_activity_audit_controller.js |
| redirectLogin() | Login redirection/session cleanup | admin_activity_audit_controller.js |
| authenticateAdminAudit() | Admin authentication/status check | admin_activity_audit_controller.js |
| bindAdminAuditEvents() | Bind dashboard actions | admin_activity_audit_controller.js |
| goAdminDashboard() | Admin dashboard navigation | admin_activity_audit_controller.js |
| getAdminAuditRoleClass() | UI role classification | admin_activity_audit_controller.js |
| loadAdminActivityLogs() | Load/render activity logs | admin_activity_audit_controller.js |
| applyAdminAuditFilter() | Apply audit filters | admin_activity_audit_controller.js |
| clearAdminActivityLogs() | Clear activity logs | admin_activity_audit_controller.js |

### Anonymous callback
DOMContentLoaded callback → starts initAdminActivityAudit().

### Global exports
applyAdminAuditFilter
clearAdminActivityLogs
initAdminActivityAudit
loadAdminActivityLogs


## KB_002 — admin_activity_audit_dashboard.html

No named JavaScript functions defined.

UI actions are delegated to:
admin_activity_audit_controller.js

UI elements:
backBtn
refreshBtn
filterUser
filterRole
filterKeyword
applyBtn
clearBtn
logs


