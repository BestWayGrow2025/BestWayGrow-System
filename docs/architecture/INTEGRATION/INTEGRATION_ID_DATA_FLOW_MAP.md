INTEGRATION ID DATA FLOW MAP
Document Name: INTEGRATION_ID_DATA_FLOW_MAP.md
 Documentation Type: Enterprise Integration — ID Data Flow Reference
 Subsystem: BestWayGrow — Complete System
 Location: docs/architecture/INTEGRATION/INTEGRATION_ID_DATA_FLOW_MAP.md
 Status: ✅ Complete
 Version: 1.0
 Last Updated: 2026-08-08

1. PURPOSE
This document defines how the Unique System ID moves through BestWayGrow.
The system is:
ID ORIENTED

Every operation must resolve and validate the correct ID before action.

2. MASTER ID FLOW
UNIQUE ID
 ↓
IDENTITY RECORD
 ↓
AUTHENTICATION
 ↓
SESSION
 ↓
CURRENT USER CONTEXT
 ↓
AUTHORIZATION
 ↓
BUSINESS OPERATION
 ↓
DATA / TRANSACTION
 ↓
STATE
 ↓
EVENT
 ↓
AUDIT


3. ID CREATION
Registration
 ↓
System ID Generation
 ↓
ID Uniqueness Check
 ↓
Identity Record
 ↓
Account Creation

The generated ID becomes the permanent system reference.

4. ID UNIQUENESS
The system must ensure:
ID ≠ EXISTING ID

Before creation:
Generate ID
 ↓
Check Existing Record
 ↓
Already Exists?
 ├─ YES → Reject / Regenerate
 └─ NO  → Create


5. IDENTITY BINDING
SYSTEM ID
 ↓
IDENTITY RECORD
 ↓
ACCOUNT RECORD

All related records must reference the appropriate system ID.

6. AUTHENTICATION ID FLOW
Login Input
 ↓
Authentication Authority
 ↓
Resolve ID
 ↓
Validate Credentials
 ↓
Validate Account
 ↓
Create Session
 ↓
Session → ID

The authenticated ID becomes the authoritative user context.

7. SESSION ID FLOW
SESSION
 ↓
USER ID
 ↓
ROLE
 ↓
ACCOUNT STATUS

Protected operations use the session-bound identity.
Client-provided identity must not override it.

8. CURRENT USER RESOLUTION
Conceptual flow:
getSession()
 ↓
Session Valid?
 ↓
getCurrentUser()
 ↓
Resolve User ID
 ↓
Load Current User

The current user is derived from authoritative session state.

9. AUTHORIZATION ID FLOW
ID
 ↓
SESSION
 ↓
ROLE
 ↓
PERMISSION
 ↓
REQUESTED ACTION

Therefore:
VALID ID
≠
AUTOMATIC PERMISSION

Authorization remains rule-controlled.

10. ACCOUNT ID FLOW
ID
 ↓
ACCOUNT
 ↓
ACCOUNT STATUS
 ↓
FEATURE ACCESS

Possible account states may include:
ACTIVE
SUSPENDED
BLOCKED
DEACTIVATED

Account status can restrict or terminate access.

11. PROFILE DATA FLOW
ID
 ↓
PROFILE RECORD
 ↓
PROFILE VALIDATION
 ↓
PROFILE UPDATE
 ↓
STORAGE

Profile data belongs to the resolved ID.
A client cannot update another ID merely by supplying its identifier.

12. KYC DATA FLOW
ID
 ↓
KYC REQUEST
 ↓
DOCUMENT VALIDATION
 ↓
KYC STORAGE
 ↓
KYC STATUS
 ↓
AUDIT

KYC records remain ID-bound.

13. PIN DATA FLOW
ID
 ↓
PIN REQUEST
 ↓
PIN PRODUCT
 ↓
PIN ASSIGNMENT
 ↓
PIN STATUS
 ↓
ACTIVATION

PIN operations must remain associated with the correct User ID.

14. PIN PRODUCT FLOW
PIN PRODUCT MASTER
 ↓
PRODUCT DEFINITION
 ↓
PIN OPERATION
 ↓
USER ID

Product parameters remain centrally defined.

15. UPGRADE DATA FLOW
ID
 ↓
SESSION
 ↓
PIN / PRODUCT
 ↓
ELIGIBILITY
 ↓
UPGRADE ACTION
 ↓
TRANSACTION
 ↓
LEDGER
 ↓
UPDATED STATE


16. REPURCHASE DATA FLOW
ID
 ↓
SESSION
 ↓
REPURCHASE REQUEST
 ↓
PRODUCT / PIN
 ↓
VALIDATION
 ↓
TRANSACTION
 ↓
LEDGER
 ↓
STATUS


17. WALLET DATA FLOW
ID
 ↓
WALLET ACCOUNT
 ↓
TRANSACTION
 ↓
LEDGER
 ↓
BALANCE

Wallet state must remain associated with the correct ID.

18. INCOME DATA FLOW
SOURCE EVENT
 ↓
BENEFICIARY ID
 ↓
INCOME RULE
 ↓
INCOME RECORD
 ↓
WALLET / LEDGER
 ↓
UPDATED BALANCE

Income must never be attributed to an unrelated ID.

19. WITHDRAWAL DATA FLOW
ID
 ↓
SESSION
 ↓
WALLET
 ↓
AVAILABLE BALANCE
 ↓
WITHDRAWAL REQUEST
 ↓
VALIDATION
 ↓
TRANSACTION
 ↓
WITHDRAWAL STATUS
 ↓
LEDGER / AUDIT


20. NETWORK DATA FLOW
USER ID
 ↓
NETWORK RELATION
 ↓
SPONSOR / INTRODUCER RELATION
 ↓
NETWORK RECORD
 ↓
QUALIFICATION / INCOME

The system uses IDs rather than human identity characteristics for relationship processing.

21. SPONSOR TREE
SPONSOR ID
 ↓
PLACEMENT RULE
 ↓
DOWNLINE ID

Sponsor structure is used for placement logic.

22. INTRODUCER TREE
INTRODUCER ID
 ↓
REFERRED USER ID
 ↓
VISIBLE NETWORK / INCOME CONTEXT

Introducer structure is used for user-visible relationship and income purposes.

23. RANK DATA FLOW
ID
 ↓
ACTIVITY DATA
 ↓
QUALIFICATION DATA
 ↓
RANK RULE
 ↓
RANK
 ↓
REWARD / BENEFIT


24. CTOR DATA FLOW
ID
 ↓
PIN N
 ↓
MONTHLY UPGRADES
 ↓
DIRECT LEG DATA
 ↓
PERSONAL ACTION
 ↓
CTOR RULE
 ↓
QUALIFICATION STATUS

Locked rule:
NEW UPGRADES ≥ 5 × N
AND
5 DISTINCT DIRECT LEGS WITH ≥1 UPGRADE
AND
1 PERSONAL ACTION


25. FRANCHISE DATA FLOW
ID
 ↓
ACCOUNT
 ↓
ELIGIBILITY
 ↓
KYC
 ↓
FRANCHISE APPLICATION
 ↓
APPROVAL
 ↓
FRANCHISE STATUS


26. NOTIFICATION DATA FLOW
ID
 ↓
BUSINESS EVENT
 ↓
NOTIFICATION
 ↓
USER

Notifications reference the affected ID.

27. AUDIT DATA FLOW
ID
 ↓
ACTION
 ↓
EVENT
 ↓
AUDIT RECORD

Audit should preserve the relationship between:
WHO
WHAT
WHEN
RESULT

using authoritative system identifiers.

28. EVENT DATA FLOW
ID
 ↓
BUSINESS ACTION
 ↓
EVENT
 ↓
EVENT CONSUMERS

Possible event consumers:
Audit
Notification
Monitoring
Reporting
Qualification
Ledger processing

29. ADMIN ID FLOW
ADMIN ID
 ↓
ADMIN SESSION
 ↓
ADMIN ROLE
 ↓
PERMISSION
 ↓
AUTHORIZED ACTION
 ↓
AUDIT


30. SUPER ADMIN ID FLOW
SUPER ADMIN ID
 ↓
AUTHORITY
 ↓
SYSTEM ADMIN
 ↓
ADMIN
 ↓
AUTHORIZED SYSTEM ACTION
 ↓
AUDIT


31. SYSTEM ADMIN ID FLOW
SYSTEM ADMIN ID
 ↓
ROLE
 ↓
DEPARTMENT / SCOPE
 ↓
AUTHORIZED ACTION
 ↓
AUDIT


32. CROSS-SUBSYSTEM ID FLOW
ID
 ↓
CORE
 ↓
PIN
 ↓
PLATFORM
 ↓
USER
 ↓
ADMIN / SYSTEM GOVERNANCE

Cross-subsystem operations must preserve the original authoritative ID.

33. ID CONSISTENCY RULE
For every operation:
REQUEST ID
        ↓
AUTHORITATIVE ID
        ↓
MATCH?
 ├─ NO → REJECT
 └─ YES → CONTINUE

No silent ID substitution is permitted.

34. CLIENT ID RULE
The following must never become authoritative by themselves:
URL userId
HTML userId
localStorage.userId
JavaScript variable
Form field
Hidden input
UI selection

They may be presentation/input references only.
The authoritative identity comes from the system/session authority.

35. ID DATA STORAGE RULE
All ID-linked records should preserve sufficient linkage for traceability.
Conceptually:
ID
 ↓
RECORD
 ↓
STATUS
 ↓
TIMESTAMP
 ↓
SOURCE / ACTION


36. ID STATUS FLOW
ID
 ↓
ACCOUNT STATUS
 ↓
BUSINESS STATUS
 ↓
TRANSACTION STATUS

Different statuses must not be confused.
Example:
ACCOUNT ACTIVE
≠
WITHDRAWAL APPROVED
≠
PIN ACTIVE

Each represents a separate state domain.

37. ID TRANSACTION FLOW
ID
 ↓
REQUEST
 ↓
VALIDATION
 ↓
AUTHORITY
 ↓
TRANSACTION
 ↓
LEDGER
 ↓
STATUS
 ↓
AUDIT


38. ID ERROR FLOW
ID RESOLUTION
 ↓
FAILURE
 ↓
STOP
 ↓
NO BUSINESS EXECUTION
 ↓
ERROR / AUDIT IF REQUIRED


39. ID SECURITY RULE
The system protects against:
ID substitution
Unauthorized ID access
Cross-user data access
Session identity mismatch
Stale ID context
Client-side ID manipulation
Unauthorized record modification

40. ID TRACEABILITY
Any important operation should be traceable:
ID
 ↓
SESSION
 ↓
MODULE
 ↓
FUNCTION
 ↓
ACTION
 ↓
DATA CHANGE
 ↓
RESULT
 ↓
AUDIT


41. INTEGRATION TESTING METHOD
When testing a function:
1. Identify ID
2. Verify ID resolution
3. Verify session binding
4. Verify authorization
5. Verify module dependency
6. Verify business rule
7. Verify data change
8. Verify resulting state
9. Verify event/audit

This avoids searching unrelated repository files.

42. ROOT-CAUSE TESTING
If a function fails:
FUNCTION
 ↓
ID
 ↓
SESSION
 ↓
AUTHORIZATION
 ↓
DEPENDENCY
 ↓
RULE
 ↓
DATA
 ↓
STATE

Find the earliest failed point.
That point is the primary integration investigation target.

43. MASTER ID DATA CHAIN
UNIQUE ID
 ↓
IDENTITY
 ↓
ACCOUNT
 ↓
AUTHENTICATION
 ↓
SESSION
 ↓
ROLE
 ↓
AUTHORIZATION
 ↓
BUSINESS MODULE
 ↓
RULE
 ↓
TRANSACTION
 ↓
WALLET / LEDGER / STORAGE
 ↓
STATE
 ↓
EVENT
 ↓
AUDIT
 ↓
MONITORING


44. FINAL SYSTEM RULE
BestWayGrow operates on:
ID
+
RULE
+
AUTHORITY
+
STATE

The system does not make business decisions based on a particular human body or personal characteristic.
The system resolves:
WHO IS THIS ID?
↓
WHAT IS THE CURRENT STATE?
↓
WHAT RULE APPLIES?
↓
IS THE ACTION AUTHORIZED?
↓
WHAT RESULT SHOULD BE STORED?


STATUS
INTEGRATION_ID_DATA_FLOW_MAP.md
Status: ✅ COMPLETE
Integration documentation now has:
01. ID_ORIENTED_SYSTEM_IMPLEMENTATION_RULE.md
02. INTEGRATION_MASTER_FLOW_MAP.md
03. INTEGRATION_MODULE_DEPENDENCY_MAP.md
04. INTEGRATION_ID_DATA_FLOW_MAP.md

Next recommended document:
docs/architecture/INTEGRATION/INTEGRATION_FUNCTION_FLOW_MAP.md

