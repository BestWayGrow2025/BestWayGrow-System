# KB_038 — core_ai_governor.js

## Purpose

Provides the Core AI Governor responsible for monitoring overall system health, evaluating risk events, responding to critical snapshots, and initiating protective system actions when required.

---

## File Information

- File Name: core_ai_governor.js
- Layer: Core
- Category: AI Governance
- Status: ✅ Verified

---

## Responsibilities

- Initializes the Core AI Governor.
- Prevents duplicate initialization.
- Waits for DOMContentLoaded before startup.
- Validates SYSTEM_EVENTS availability.
- Registers system event listeners.
- Monitors control snapshots.
- Evaluates system alerts, warnings, and failures.
- Switches system operating mode based on health.
- Emits governor actions.
- Triggers system freeze for critical events.
- Exposes governor functions globally.

---

## Entry Function

initGovernor()

---

## Event Subscriptions

- SYSTEM_ALERT
- SYSTEM_FAILURE
- SYSTEM_WARNING
- CONTROL_SNAPSHOT

---

## Global Export

window.system_ai_governor

Exports:

- init()
- handleSnapshot()
- evaluateRisk()
- triggerFreeze()
- startGovernorLoop()

---

## Dependencies

- SYSTEM_EVENTS
- window.SystemOSMode
- window.__SYSTEM_SNAPSHOT__

---

## Verification Summary

- File exists
- Duplicate initialization protection verified
- Event registration verified
- Snapshot handling verified
- Risk evaluation verified
- Freeze workflow verified
- Global export verified
- No proven defects found

---

## Verification Status

✅ Verified

Verification Date: 2026-07-22

Code Changes: None

Documentation Updated: Yes
