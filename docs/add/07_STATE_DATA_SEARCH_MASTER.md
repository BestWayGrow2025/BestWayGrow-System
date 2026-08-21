# STATE DATA SEARCH MASTER

## Purpose
Find where system state and important data are actually created, stored, read, changed, and deleted.

## Search Rule
STATE / DATA PROBLEM
→ FIND DATA / STATE NAME
→ FIND READ FUNCTION
→ FIND WRITE FUNCTION
→ FIND OWNER FILE
→ TRACE DEPENDENCIES
→ VERIFY
→ IMPLEMENT
→ REVERIFY

## Required Data
- Data/state name
- Storage location
- Read function
- Write function
- Delete function
- Owner file
- Module
- Source
- Consumers
- Validation
- Migration/legacy concern

## State/Data Index

| State/Data | Read Function | Write Function | Delete Function | Owner File | Module | Storage | Consumers | Status |
|---|---|---|---|---|---|---|---|---|

## Storage Types
- localStorage
- session state
- memory/global state
- queue
- ledger
- transaction state
- cache
- configuration
- repository data

## Important
Identify the actual source of truth before changing state/data behavior.
