# DEPENDENCY SEARCH MASTER

## Purpose
Find the dependency chain related to a repository problem.

## Search Rule
PROBLEM
→ FIND FUNCTION / FILE
→ FIND DEPENDENCIES
→ TRACE CALLER / CALLEE
→ OPEN RELATED FILES
→ VERIFY
→ IMPLEMENT
→ REVERIFY

## Required Data
- Source file
- Source function
- Dependency file
- Dependency function
- Dependency type
- Caller
- Callee
- Initialization dependency
- Storage dependency
- Event dependency
- Module dependency
- Risk

## Dependency Index

| Source Function | Source File | Dependency Function | Dependency File | Module | Type | Direction | Risk | Status |
|---|---|---|---|---|---|---|---|---|

## Dependency Types
- Function call
- Initialization
- Storage
- Event
- Session
- UI
- Module
- Security
- State
- Transaction
- Queue
- External integration

## Dependency Chain

A
→ B
→ C
→ D

Each node must be verified against the actual repository.

## Important
Never remove or replace a dependency without checking its callers and downstream users.
