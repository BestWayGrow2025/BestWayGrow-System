# EVENT LOCK SEARCH MASTER

## Purpose
Find actual event ownership, event execution, synchronization, and lock mechanisms.

## Search Rule
EVENT / LOCK PROBLEM
→ SEARCH EVENT OR LOCK
→ FIND ACTUAL OWNER
→ TRACE REGISTRATION / EXECUTION
→ OPEN ACTUAL FILES
→ VERIFY
→ IMPLEMENT
→ REVERIFY

## Required Data
- Event/lock name
- Definition
- Registration function
- Execution function
- Owner file
- Module
- Trigger
- Listener/caller
- Lock scope
- Release condition
- Failure/recovery
- Duplicate risk

## Event/Lock Index

| Event/Lock | Function | Owner File | Module | Trigger | Consumer | Lock Scope | Release | Status |
|---|---|---|---|---|---|---|---|---|

## Important
Check for:
- duplicate event registration
- duplicate listeners
- missing lock release
- re-entry
- race condition
- stale event
- conflicting execution authority
MODULE SEARCH MASTERS
