INTEGRATION MODULE DEPENDENCY MAP
Document Name: INTEGRATION_MODULE_DEPENDENCY_MAP.md
 Documentation Type: Enterprise Integration Dependency Reference
 Subsystem: BestWayGrow — Complete System
 Location: docs/architecture/INTEGRATION/INTEGRATION_MODULE_DEPENDENCY_MAP.md
 Status: ✅ Integration Architecture Reference
 Version: 1.0
 Last Updated: 2026-08-08

1. PURPOSE
This document defines the dependency relationship between BestWayGrow subsystems, authorities, services, and major business modules.
Its purpose is to answer quickly:
WHICH MODULE?
↓
DEPENDS ON WHAT?
↓
WHO IS THE AUTHORITY?
↓
WHAT DATA / RULE IS REQUIRED?
↓
WHERE TO VERIFY IF FAILURE OCCURS?

The system remains ID-oriented.

2. MASTER DEPENDENCY MODEL
UNIQUE SYSTEM ID
        ↓
IDENTITY
        ↓
AUTHENTICATION
        ↓
SESSION
        ↓
AUTHORIZATION
        ↓
BUSINESS MODULE
        ↓
BUSINESS AUTHORITY
        ↓
DATA / LEDGER / STATE
        ↓
AUDIT / EVENT


3. ENTERPRISE SUBSYSTEM DEPENDENCY
ADMIN
  ↓
CORE
  ↓
PIN
  ↓
PLATFORM
  ↓
SUPER ADMIN
  ↓
SYSTEM ADMIN
  ↓
USER

This represents architectural integration, not unrestricted access.
Each subsystem operates only within its assigned authority and permissions.

4. CORE DEPENDENCY
CORE provides foundational services for:
Identity
Authentication
Session
Authorization
Storage
Events
Wallet authority
Transaction authority
Security
Initialization
Conceptual dependency:
USER / ADMIN / PIN / PLATFORM
              ↓
             CORE
              ↓
       FOUNDATIONAL SERVICES

CORE must remain below business modules as foundational infrastructure.

5. USER DEPENDENCY MAP
USER
 ↓
CORE
 ├── Authentication
 ├── Session
 ├── Authorization
 ├── Storage
 ├── Wallet Authority
 ├── Transaction Authority
 └── Security

User business modules consume these services.
They must not independently replace foundational authorities.

6. USER AUTHENTICATION
USER AUTH
 ↓
Identity
 ↓
Authentication Authority
 ↓
Session Authority
 ↓
User Dashboard

Dependencies:
User ID
Authentication authority
Account state
Role
Session authority
Failure boundary:
Authentication failure
↓
NO SESSION
↓
NO PROTECTED USER ACCESS


7. USER ACCOUNT
ACCOUNT
 ↓
USER ID
 ↓
ACCOUNT STATUS
 ↓
PROFILE
 ↓
AUTHORIZATION

Account-dependent modules include:
Dashboard
Profile
PIN
Wallet
Upgrade
Repurchase
Withdrawal
Franchise
Network

8. USER SESSION
SESSION AUTHORITY
 ↓
CURRENT USER
 ↓
ROLE
 ↓
ACCOUNT STATUS
 ↓
FEATURE ACCESS

Session dependency is mandatory for protected operations.
INVALID SESSION
↓
STOP


9. PIN DEPENDENCY
USER ID
 ↓
PIN AUTHORITY
 ↓
PIN PRODUCT
 ↓
PIN STATUS
 ↓
ACTIVATION
 ↓
UPGRADE / REPURCHASE / QUALIFICATION

PIN-dependent modules must resolve the correct User ID before processing.

10. PIN PRODUCT DEPENDENCY
The authoritative PIN product definition is:
pin_product_master.js

It controls product-level definitions such as:
Package
Amount
BV
GST
applyGST
Activation/deactivation
Conceptual flow:
PIN PRODUCT MASTER
        ↓
PIN REQUEST / ACTIVATION
        ↓
USER ID
        ↓
PIN STATUS
        ↓
BUSINESS OPERATION


11. WALLET DEPENDENCY
USER ID
 ↓
SESSION
 ↓
WALLET AUTHORITY
 ↓
TRANSACTION AUTHORITY
 ↓
LEDGER / STORAGE
 ↓
BALANCE

Wallet-consuming modules include:
Income
Upgrade
Repurchase
Withdrawal
Other financial operations

12. WALLET ENGINE RULE
wallet_engine.js is a disabled compatibility layer.
wallet_engine.js
        ↓
DISABLED
        ↓
NO WALLET OVERRIDE

The wallet system designated as authoritative must remain the source of wallet state.
Therefore:
DO NOT
 ↓
REBUILD / OVERWRITE WALLET
 ↓
FROM DISABLED ENGINE


13. WALLET SYNC ENGINE RULE
wallet_sync_engine.js is also disabled.
wallet_sync_engine.js
        ↓
DISABLED
        ↓
NO INDEPENDENT RECONCILIATION

Its disabled rebuildWalletFromLedger() path must not become an alternative wallet authority.

14. TRANSACTION DEPENDENCY
USER ID
 ↓
SESSION
 ↓
AUTHORIZATION
 ↓
TRANSACTION AUTHORITY
 ↓
VALIDATION
 ↓
TRANSACTION
 ↓
LEDGER / WALLET
 ↓
AUDIT

Financial transactions must not be completed solely by UI/controller logic.

15. UPGRADE DEPENDENCY
USER
 ↓
SESSION
 ↓
PIN / PRODUCT
 ↓
UPGRADE RULE
 ↓
PAYMENT / WALLET
 ↓
TRANSACTION AUTHORITY
 ↓
USER / PIN STATUS
 ↓
LEDGER
 ↓
AUDIT

Required dependencies:
User ID
Valid session
PIN/product
Eligibility
Payment source
Wallet/transaction authority
Status update
Audit/event

16. REPURCHASE DEPENDENCY
USER
 ↓
SESSION
 ↓
REPURCHASE RULE
 ↓
PIN / PRODUCT
 ↓
PAYMENT
 ↓
TRANSACTION AUTHORITY
 ↓
STATUS
 ↓
LEDGER


17. WITHDRAWAL DEPENDENCY
USER ID
 ↓
SESSION AUTHORITY
 ↓
USER ACCOUNT
 ↓
WALLET AUTHORITY
 ↓
WITHDRAWAL AUTHORITY
 ↓
TRANSACTION / LEDGER
 ↓
STATUS
 ↓
AUDIT

The withdrawal controller is UI-oriented and should delegate business execution.

18. INCOME DEPENDENCY
SOURCE EVENT
 ↓
USER ID
 ↓
ELIGIBILITY
 ↓
INCOME RULE
 ↓
INCOME RECORD
 ↓
WALLET / LEDGER
 ↓
AUDIT

Income must never be credited without a valid business source/event.

19. NETWORK DEPENDENCY
USER ID
 ↓
NETWORK RELATION
 ↓
SPONSOR / INTRODUCER RULE
 ↓
TREE DATA
 ↓
QUALIFICATION / INCOME

Architectural separation:
SPONSOR TREE
→ PLACEMENT LOGIC

INTRODUCER TREE
→ USER-VISIBLE RELATIONSHIP / INCOME CONTEXT


20. RANK DEPENDENCY
USER ID
 ↓
PIN / ACTIVITY / NETWORK DATA
 ↓
QUALIFICATION RULE
 ↓
RANK ENGINE
 ↓
RANK STATUS
 ↓
REWARD / BENEFIT


21. CTOR DEPENDENCY
USER ID
 ↓
PIN
 ↓
MONTHLY ACTIVITY
 ↓
UPGRADE DATA
 ↓
DIRECT LEG DATA
 ↓
PERSONAL ACTION
 ↓
CTOR RULE
 ↓
QUALIFICATION

Locked rule:
NEW UPGRADES ≥ 5 × PIN N
AND
5 DISTINCT DIRECT LEGS WITH ≥1 UPGRADE
AND
1 PERSONAL ACTION


22. FRANCHISE DEPENDENCY
USER ID
 ↓
ACCOUNT
 ↓
KYC / ELIGIBILITY
 ↓
FRANCHISE APPLICATION
 ↓
APPROVAL AUTHORITY
 ↓
FRANCHISE STATUS
 ↓
AUDIT


23. NOTIFICATION DEPENDENCY
BUSINESS EVENT
 ↓
USER ID
 ↓
NOTIFICATION SERVICE
 ↓
NOTIFICATION RECORD
 ↓
USER DISPLAY

Notifications depend on authoritative events.
They should not create business state themselves.

24. AUDIT DEPENDENCY
ID
 ↓
ACTION
 ↓
EVENT
 ↓
AUDIT AUTHORITY
 ↓
AUDIT RECORD

Audit should remain downstream of the authoritative action.

25. MONITORING DEPENDENCY
EVENT / STATUS / SECURITY SIGNAL
 ↓
MONITORING
 ↓
ANALYSIS
 ↓
ALERT / ADMIN VISIBILITY

Monitoring observes system activity.
It does not replace business authorities.

26. ADMIN DEPENDENCY
ADMIN ID
 ↓
ADMIN SESSION
 ↓
ADMIN ROLE
 ↓
ADMIN PERMISSION
 ↓
DEPARTMENT / MODULE
 ↓
AUTHORIZED ACTION

Admin A:
FULL SYSTEM ACCESS

Admin B:
RESTRICTED / DEPARTMENTAL ACCESS

Authorization must remain enforced by the appropriate authority.

27. SUPER ADMIN DEPENDENCY
SUPER ADMIN
 ↓
SYSTEM ADMIN
 ↓
ADMIN
 ↓
USER

Super Admin governs higher-level system administration according to enterprise authority rules.

28. SYSTEM ADMIN DEPENDENCY
SYSTEM ADMIN
 ↓
ADMIN MANAGEMENT
 ↓
MODULE / DEPARTMENT SCOPE
 ↓
AUTHORIZED OPERATION

System Admin operates below Super Admin and above normal Admin scope according to the established hierarchy.

29. DEPENDENCY TYPES
Every integration dependency should be classified as one of:
Identity
ID → RECORD

Security
ID → SESSION → AUTHORIZATION

Business
ID → RULE → ACTION

Financial
ID → TRANSACTION → WALLET / LEDGER

Data
ID → STORAGE

Event
ACTION → EVENT

Audit
ACTION → AUDIT


30. DEPENDENCY FAILURE METHOD
When a module fails:
FAILED FUNCTION
 ↓
MODULE
 ↓
DIRECT DEPENDENCY
 ↓
AUTHORITY
 ↓
INPUT DATA
 ↓
RULE
 ↓
STATE

Then determine:
DEPENDENCY FAILURE
OR
BUSINESS RULE FAILURE
OR
DATA FAILURE
OR
AUTHORIZATION FAILURE
OR
INTEGRATION FAILURE


31. NO DUPLICATE AUTHORITY RULE
The system must avoid:
TWO SESSION AUTHORITIES
TWO WALLET AUTHORITIES
TWO TRANSACTION AUTHORITIES
TWO IDENTITY AUTHORITIES
TWO CONFLICTING BUSINESS ENGINES

Where an older file remains for compatibility, its active/disabled state must be clearly respected.

32. CONTROLLER RESPONSIBILITY
Controllers generally perform:
UI
↓
INPUT
↓
SESSION CHECK
↓
CALL AUTHORITY
↓
DISPLAY RESULT

Controllers should not silently become independent business engines.

33. AUTHORITY RESPONSIBILITY
Authorities/services perform:
VALIDATION
↓
RULE CHECK
↓
BUSINESS EXECUTION
↓
STATE CHANGE
↓
TRANSACTION / LEDGER


34. STORAGE RESPONSIBILITY
Storage provides:
CREATE
READ
UPDATE
PERSIST

Storage does not independently decide business authorization.

35. INTEGRATION PRIORITY
When testing, follow this dependency priority:
1. IDENTITY
2. AUTHENTICATION
3. SESSION
4. AUTHORIZATION
5. ACCOUNT
6. PIN
7. TRANSACTION
8. WALLET
9. LEDGER
10. BUSINESS MODULE
11. EVENT
12. AUDIT
13. NOTIFICATION
14. MONITORING

A failure in a higher dependency may produce failures in all downstream modules.

36. ROOT-CAUSE PRINCIPLE
Do not fix downstream symptoms before checking upstream dependencies.
Example:
WITHDRAWAL FAILS
       ↓
CHECK WITHDRAWAL
       ↓
CHECK WALLET
       ↓
CHECK TRANSACTION AUTHORITY
       ↓
CHECK SESSION
       ↓
CHECK USER ID

The actual problem may be upstream.

37. DOCUMENTATION-BASED NAVIGATION
During integration testing:
PROBLEM
 ↓
INTEGRATION MASTER FLOW MAP
 ↓
MODULE DEPENDENCY MAP
 ↓
KNOWLEDGE INDEX
 ↓
ARCHITECTURE LAYER
 ↓
FUNCTION INDEX
 ↓
IMPLEMENTATION MASTER
 ↓
REPOSITORY FILE

Repository inspection is performed only when documentation identifies the likely target.

38. MASTER DEPENDENCY CHAIN
ID
 ↓
IDENTITY
 ↓
AUTH
 ↓
SESSION
 ↓
ROLE
 ↓
ACCOUNT
 ↓
PIN
 ↓
BUSINESS RULE
 ↓
AUTHORITY
 ↓
TRANSACTION
 ↓
WALLET / LEDGER
 ↓
STATE
 ↓
EVENT
 ↓
AUDIT
 ↓
MONITORING


39. FINAL RULE
Every important BestWayGrow operation must be traceable as:
ID
→ DEPENDENCY
→ AUTHORITY
→ RULE
→ ACTION
→ STATE
→ RESULT

If the dependency is unavailable or invalid:
STOP EXECUTION


STATUS
INTEGRATION_MODULE_DEPENDENCY_MAP.md
Status: ✅ CREATED
This document is the dependency-navigation layer between the Master Flow Map and the individual subsystem/function documentation.
Integration documentation sequence so far:
01
ID_ORIENTED_SYSTEM_IMPLEMENTATION_RULE.md
        ↓
02
INTEGRATION_MASTER_FLOW_MAP.md
        ↓
03
INTEGRATION_MODULE_DEPENDENCY_MAP.md

Next recommended document:
docs/architecture/INTEGRATION/INTEGRATION_FUNCTION_FLOW_MAP.md

