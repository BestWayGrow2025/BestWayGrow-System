# AUTHORITY SEARCH MASTER

## Purpose
Find the actual authoritative repository file responsible for a rule, function, operation, state, or security decision.

## Search Rule
PROBLEM
→ SEARCH AUTHORITY
→ FIND ACTUAL OWNER
→ OPEN ACTUAL FILE
→ VERIFY
→ DECIDE
→ IMPLEMENT
→ REVERIFY

## Required Data
- Authority area
- Function
- Actual owner file
- Module
- Role
- Related authorities
- Duplicate/conflict files
- Caller
- Dependency
- Security/state impact
- Final authority decision

## Authority Principle

ONE RULE
→ ONE CLEAR AUTHORITY

ONE FUNCTION
→ ONE ACTUAL OWNER

Supporting/bridge/UI files must not silently become competing authorities.

## Authority Index

| Authority Area | Function | Actual Owner File | Module | Role | Related Files | Conflict | Final Decision |
|---|---|---|---|---|---|---|---|

## Verification Rule
Authority must be established from the actual repository implementation and actual callers/references.

Do not infer authority only from:
- filename
- comment
- documentation
- historical KB
- expected architecture

## Important
This document is a search/navigation master.
Actual authority changes are made only in the repository after verification.
