==================================================
core_access_control_guard.js
==================================================

Layer
Core

Category
Access Control

Purpose
Central authentication and authorization guard.

Entry Function
None (Utility Module)

Functions
• requireAuth()
• isAuthBlocked()

Global Export
• requireAuth
• isAuthBlocked

Loaded By
Protected pages and controllers

Dependencies
• core_session_authority.js

Related Files
• core_auth_password_manager.js
• core_page_router_connector.js

Repository Flow
Protected Page
↓
requireAuth()
↓
Session Validation
↓
Role Validation
↓
Access / Redirect

Verification
✅ Verified

Remarks
Production Locked.
No proven defects found.
No code changes required.

--------------------------------------------------

