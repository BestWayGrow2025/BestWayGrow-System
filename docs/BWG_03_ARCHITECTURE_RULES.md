# BestWayGrow Architecture Rules

---

## Purpose

This document defines the permanent architecture rules of the BestWayGrow system.

These rules apply to every existing file and every future file added to the repository.

Violation of these rules should be treated as an architecture issue.

---

# Core Principles

## Rule 1 — One Responsibility Per File

Each file must have one primary responsibility.

A file must not mix Boot, Router, Business Logic, UI Rendering, and Data Storage responsibilities.

---

## Rule 2 — One Loader Per Module

Every dynamically loaded module must be loaded by only one loader.

Duplicate loading is not allowed.

---

## Rule 3 — One Entry Function

Each module must expose one official entry function.

Example:

initPage()

No multiple startup methods for the same module.

---

## Rule 4 — Dynamic Module HTML

HTML files loaded through the module loader must not load JavaScript directly.

The Asset Loader is responsible for loading the module JavaScript.

---

## Rule 5 — Boot Layer

Boot files execute only once during application startup.

They must never execute again during module navigation.

---

## Rule 6 — Router Layer

Routing files only decide where to navigate.

They must not contain business logic.

---

## Rule 7 — Business Layer

Business modules contain application logic only.

They should not perform boot operations.

---

## Rule 8 — Global Variables

Global variables must be minimized.

Every exported global must have a clear owner.

---

## Rule 9 — Naming Convention

Repository naming must remain consistent.

Examples:

core_

platform_

super_admin_

system_admin_

admin_

user_

pin_

BWG_

---

## Rule 10 — Verification Before Modification

Every code change must begin with verification.

Never modify code based on assumptions.

Always identify:

• Owner

• Loader

• Dependencies

• Entry Function

• Exports

before making changes.

---

## Rule 11 — Documentation

Repository documentation must always reflect the verified implementation.

Documentation is updated only after verification.

---

## Rule 12 — Future Maintenance

Every new file must satisfy these architecture rules before being accepted into the repository.

---

## Status

Architecture Rules Locked

Version: 1.0
