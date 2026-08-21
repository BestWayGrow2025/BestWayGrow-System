# FLOW SEARCH MASTER

## Purpose
Find the actual execution flow related to a problem.

## Search Rule
PROBLEM
→ IDENTIFY ENTRY FUNCTION
→ TRACE CALL FLOW
→ FIND EACH ACTUAL FILE
→ VERIFY AUTHORITY
→ IMPLEMENT
→ REVERIFY FULL FLOW

## Required Data
- Flow name
- Entry function
- Step
- Function
- File
- Module
- Next function
- Authority
- State change
- Event
- Failure path
- Recovery path

## Flow Index

| Flow | Step | Function | File | Module | Next Step | Authority | Failure Path |
|---|---:|---|---|---|---|---|---|

## Flow Format

ENTRY
↓
FUNCTION
↓
FUNCTION
↓
AUTHORITY
↓
STATE CHANGE
↓
EVENT
↓
NEXT FUNCTION
↓
FINAL RESULT

## Important
Verify both:
- success path
- failure/recovery path

A flow is not considered verified until both are understood.
