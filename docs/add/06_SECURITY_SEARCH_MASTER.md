# SECURITY SEARCH MASTER

## Purpose
Find the actual repository location responsible for security, authentication, authorization, validation, protection, and privileged operations.

## Search Rule
SECURITY PROBLEM
→ SEARCH SECURITY FUNCTION / RULE
→ FIND OWNER FILE
→ TRACE CALLERS
→ VERIFY PROTECTION
→ IMPLEMENT
→ REVERIFY

## Required Data
- Security area
- Function
- Owner file
- Module
- Authentication requirement
- Authorization requirement
- Validation
- Privileged action
- Failure path
- Session dependency
- Security risk

## Security Index

| Security Area | Function | Owner File | Module | Protection | Failure Path | Dependency | Risk | Status |
|---|---|---|---|---|---|---|---|---|

## Security Areas
- Authentication
- Authorization
- Role validation
- Account status
- Input validation
- Duplicate protection
- Transaction protection
- Session protection
- Privileged operations
- Locking
- Recovery
- Audit

## Important
Security must be verified from actual implementation.
Do not rely only on UI checks.
