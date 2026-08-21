# RULE SEARCH MASTER

## Purpose
Find where an actual business/system rule is implemented in the repository.

## Search Rule
PROBLEM / RULE
→ SEARCH RULE
→ FIND IMPLEMENTING FUNCTION
→ FIND OWNER FILE
→ OPEN ACTUAL FILE
→ VERIFY
→ IMPLEMENT
→ REVERIFY

## Required Data
- Rule name
- Rule description
- Function
- Owner file
- Module
- Inputs
- Outputs
- Conditions
- Related rules
- Conflicting rules
- Dependencies
- Final implementation location

## Rule Index

| Rule | Function | Owner File | Module | Conditions | Related Rule | Conflict | Status |
|---|---|---|---|---|---|---|---|

## Rule Principle

A rule must have one clear authoritative implementation location unless intentional distributed behavior is verified and documented.

## Conflict Check
Check for:
- duplicate rule
- old rule
- hard-coded rule
- UI-only rule
- bridge duplication
- legacy implementation
- conflicting condition
- inconsistent threshold/value

## Important
Do not change a rule from this document alone.
Open and verify the actual repository implementation first.
