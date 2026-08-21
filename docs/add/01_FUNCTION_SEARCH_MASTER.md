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
