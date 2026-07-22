# KB_030 — admin_reporting_dashboard.html

## File Information
- File Name: admin_reporting_dashboard.html
- Module: Admin Reporting
- File Type: HTML Dashboard
- Repository Path: /admin_reporting_dashboard.html

---

## Purpose
Provides the Admin Reporting Dashboard interface for viewing system-wide reports, statistics, transaction history, PIN usage logs, CTOR pool information, and withdrawal requests.

---

## Interface Components
- Page title
- Back button
- Total Users panel
- PIN Status panel
- Income Summary panel
- Hold Income panel
- CTOR Pool panel
- Run CTOR Distribution button
- Transactions section
- PIN Usage Logs section
- Withdrawal Requests section

---

## Script Dependencies
- core_boot_manager.js
- core_initializer.js
- core_session_authority.js
- core_reporting_engine.js
- admin_reporting_dashboard.js

---

## Verification Checklist
- ✅ HTML structure verified
- ✅ Dashboard layout verified
- ✅ Report sections verified
- ✅ Button elements verified
- ✅ DOM element IDs verified
- ✅ Script loading order verified
- ✅ Module integration verified

---

## Notes
- Dashboard is accessible only after successful administrator authentication.
- Data loading and report generation are handled by `admin_reporting_dashboard.js`.
- CTOR distribution is initiated from this dashboard through the reporting controller.

---

## Status
✅ Verified
✅ Documentation Completed
