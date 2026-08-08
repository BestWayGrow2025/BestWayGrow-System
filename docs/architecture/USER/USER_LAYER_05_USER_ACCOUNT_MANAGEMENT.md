USER_LAYER_05_USER_ACCOUNT_MANAGEMENT.md
USER LAYER 05 — USER ACCOUNT MANAGEMENT ARCHITECTURE
Document Name: USER_LAYER_05_USER_ACCOUNT_MANAGEMENT.md
 Documentation Type: User Architecture — Account Management
 Subsystem: USER
 Layer: 05
 Location: docs/architecture/USER/USER_LAYER_05_USER_ACCOUNT_MANAGEMENT.md
 Status: ✅ Architecture Defined
 Version: 1.0
 Owner: BestWayGrow Project

1. PURPOSE
The User Account Management layer defines the architecture responsible for managing the complete lifecycle and operational state of a registered User account.
This layer governs:
User account profile
Account identity
Account status
Profile information
User-controlled account information
KYC-related account information
Account eligibility
Account state visibility
Account security boundaries
Account lifecycle coordination
User account service dependencies
The layer provides the structural boundary between the authenticated User and the operational services available to that User.

2. ARCHITECTURAL POSITION
The User Account Management layer operates after authentication and before higher-level User business services.
USER SUBSYSTEM
      │
      ▼
USER AUTHENTICATION
      │
      ▼
USER ACCOUNT MANAGEMENT
      │
      ├── Profile
      ├── Account Status
      ├── KYC
      ├── Account Eligibility
      ├── User Preferences
      └── Account Lifecycle
      │
      ▼
USER BUSINESS SERVICES
      │
      ├── Dashboard
      ├── PIN
      ├── Wallet
      ├── Upgrade
      ├── Rank
      ├── Network
      ├── Withdrawal
      └── Enterprise Services


3. ACCOUNT MANAGEMENT RESPONSIBILITY
The Account Management layer is responsible for maintaining a consistent representation of the User account.
It does not replace the authentication layer.
Authentication determines:
WHO IS THE USER?

Account Management determines:
WHAT IS THE CURRENT STATE OF THAT USER ACCOUNT?

Therefore:
Authentication
      ↓
Identity Verification
      ↓
Account Resolution
      ↓
Account Status
      ↓
Account Eligibility
      ↓
User Service Access


4. USER ACCOUNT IDENTITY
Every User account must have a unique User identity.
Primary identity:
userId

Additional account information may include:
username
name
mobile
email
address
profile information
KYC information
accountStatus
createdAt
updatedAt

The exact repository schema remains authoritative for currently implemented fields.
Architecture must not assume fields that are not implemented.

5. ACCOUNT LIFECYCLE
The User account lifecycle follows a controlled state model.
REGISTRATION
     │
     ▼
ACCOUNT CREATED
     │
     ▼
ACCOUNT ACTIVE
     │
     ├───────────────┐
     ▼               ▼
SUSPENDED         BLOCKED
     │               │
     ▼               ▼
REVIEW / RECOVERY
     │
     ▼
ACTIVE

Possible final lifecycle state:
CLOSED

The exact transition authority depends on the applicable administrative and system governance rules.

6. ACCOUNT STATUS
Account status is a critical authorization input.
Typical states include:
ACTIVE
INACTIVE
PENDING
SUSPENDED
BLOCKED
CLOSED

The implementation must treat the actual repository status values as authoritative.
A User should not receive normal business-service access solely because a session exists.
The service access decision should consider:
Valid Session
      +
Valid User
      +
Valid Role
      +
Valid Account Status
      =
Permitted User Operation


7. PROFILE MANAGEMENT
Profile management belongs to the Account Management layer.
The profile subsystem may manage:
User name
Contact information
Address
Personal account information
Profile display information
KYC-related information
Account metadata
Profile modification must be restricted to fields that the User is authorized to modify.
Sensitive or governance-controlled information must not be freely editable.

8. KYC ACCOUNT INTEGRATION
KYC is associated with the User account but should remain logically separated from ordinary profile data.
Architecture:
USER ACCOUNT
     │
     ├── Profile
     │
     ├── KYC Identity
     │
     ├── KYC Documents
     │
     └── KYC Status

Possible KYC states:
NOT_SUBMITTED
SUBMITTED
UNDER_REVIEW
APPROVED
REJECTED

The actual repository implementation remains authoritative.
KYC approval may become an eligibility requirement for selected User operations.

9. ACCOUNT ELIGIBILITY
Account eligibility is evaluated before protected business operations.
Examples:
Account Active
KYC Requirement Satisfied
Required PIN Available
Required Upgrade Completed
Required Rank Achieved
Wallet Eligibility Satisfied

The Account Management layer may provide account-state information to downstream services.
It should not duplicate business rules owned by those services.

10. AUTHENTICATION RELATIONSHIP
Account Management depends on the authenticated User identity.
Session
   ↓
Current User
   ↓
Account Record
   ↓
Account State

The account layer must never blindly trust a User ID supplied by the browser when a trusted session identity is available.
Preferred source:
getCurrentUser()

or the repository's authoritative session-resolution mechanism.

11. AUTHORIZATION
Authorization must be evaluated independently from authentication.
A User may be:
Authenticated = YES

but:
Authorized = NO

for a specific operation.
Account Management therefore provides account-state information that downstream authorization checks can use.
Examples:
Active account → normal User services
Suspended account → restricted services
Blocked account → no normal User services
Pending account → limited services


12. SESSION RELATIONSHIP
The Account Management layer does not own the session authority.
The session authority belongs to the User Session Architecture.
Relationship:
Session Authority
       │
       ▼
Current User
       │
       ▼
Account Management
       │
       ▼
Account State

Account information must be resolved against the current authenticated session.

13. USER DASHBOARD RELATIONSHIP
The User Dashboard is a consumer of Account Management information.
Account Management
        │
        ├── User ID
        ├── Username
        ├── Account Status
        ├── KYC State
        └── Account Metadata
                │
                ▼
        User Dashboard

The dashboard should display account information but should not become the authoritative owner of that information.

14. USER PROFILE ARCHITECTURE
Profile operations follow:
User
 │
 ▼
Authenticated Session
 │
 ▼
Account Resolution
 │
 ▼
Profile Validation
 │
 ▼
Authorized Update
 │
 ▼
Persistent User Record
 │
 ▼
Updated Account State

The browser UI is not the source of truth.

15. DATA SOURCE
The authoritative User account data source is the repository's User storage layer.
Current repository implementations may use existing storage mechanisms such as:
getCurrentUser()
getUsers()
saveUsers()

where implemented.
These functions are integration points rather than architectural ownership definitions.
The permanent architecture should allow migration to a centralized repository/service layer later.

16. DATA STORAGE
Account data may currently be represented in the User record.
Typical structure:
User
 ├── userId
 ├── username
 ├── accountStatus
 ├── profile
 ├── KYC
 ├── wallet
 ├── network references
 └── account metadata

Financial data should not be duplicated unnecessarily inside profile-management logic.
Wallet and ledger systems remain responsible for financial authority.

17. ACCOUNT UPDATE RULE
Account updates must follow:
Input
 ↓
Validation
 ↓
Authorization
 ↓
Controlled Update
 ↓
Persistence
 ↓
Audit

No direct uncontrolled modification of the User account record should be permitted from arbitrary UI code.

18. VALIDATION
Account management validation may include:
Identity Validation
User exists
User ID valid
Session User matches account

Profile Validation
Required fields present
Correct data format
Allowed field modification

Status Validation
Account state valid
Transition permitted

Security Validation
Authenticated session
Correct role
Authorized operation


19. ACCOUNT STATUS TRANSITIONS
Status changes must follow controlled transitions.
Example:
PENDING
   │
   ▼
ACTIVE

or:
ACTIVE
   │
   ▼
SUSPENDED

or:
SUSPENDED
   │
   ▼
ACTIVE

Invalid arbitrary transitions should be rejected.

20. SECURITY BOUNDARY
The Account Management layer must protect:
User identity
Profile information
KYC information
Account status
Sensitive account metadata
The browser must never be treated as a trusted authority for:
userId
accountStatus
role
KYC approval
financial eligibility
administrative state


21. FINANCIAL SEPARATION
Account Management must not become the wallet authority.
The separation is:
ACCOUNT MANAGEMENT
       │
       │ account identity/state
       ▼
WALLET / FINANCIAL SYSTEM
       │
       │ financial authority
       ▼
LEDGER / TRANSACTION SYSTEM

Account information may reference wallet information, but financial calculations and ledger posting belong to the financial subsystem.

22. UPGRADE RELATIONSHIP
User Upgrade is a downstream business service.
Account
   │
   ▼
Authenticated User
   │
   ▼
Upgrade Service

Account Management may establish that the User account is valid and active.
The Upgrade subsystem owns the actual upgrade business rules and execution.

23. WITHDRAWAL RELATIONSHIP
Withdrawal operations require a valid User account.
Account Active
      ↓
Authenticated User
      ↓
Withdrawal Eligibility
      ↓
Wallet Authority
      ↓
Withdrawal Lifecycle

Account Management does not independently deduct wallet balances.

24. PIN RELATIONSHIP
PIN operations depend on the User account identity.
Authenticated User
       ↓
User Account
       ↓
PIN Service
       ↓
PIN Request / Activation / Usage

PIN ownership and PIN business rules remain within the PIN subsystem.

25. NETWORK RELATIONSHIP
User network/tree functionality may consume:
userId
sponsor references
introducer references
network status

The Account Management layer should not duplicate network-tree calculation logic.
Network ownership remains with the User Network subsystem.

26. AUDIT REQUIREMENT
Important account events should be auditable.
Examples:
Account Created
Profile Updated
KYC Submitted
KYC Status Changed
Account Suspended
Account Reactivated
Account Blocked
Account Status Changed

Audit implementation may currently be distributed across repository modules.
Future architecture should centralize enterprise audit recording.

27. ERROR HANDLING
Account Management must fail safely.
Examples:
No session
    → Login Required

User not found
    → Account unavailable

Invalid status
    → Operation blocked

Unauthorized update
    → Access denied

Invalid profile input
    → Validation error

Storage failure
    → Safe failure without partial state

Sensitive internal implementation details should not be exposed to the User.

28. EVENT MANAGEMENT
Account-related events may include:
USER_REGISTERED
USER_PROFILE_UPDATED
USER_KYC_SUBMITTED
USER_KYC_UPDATED
USER_STATUS_CHANGED
USER_SUSPENDED
USER_REACTIVATED
USER_BLOCKED

The Event Architecture layer remains responsible for centralized event propagation.

29. SERVICE DEPENDENCIES
Primary dependencies:
User Authentication
User Session Authority
User Storage
User Security
KYC
Audit
Event System

Downstream consumers include:
Dashboard
PIN
Wallet
Upgrade
Rank
Network
Withdrawal
Enterprise Services


30. ARCHITECTURAL DEPENDENCY RULE
Dependency direction should remain:
CORE
  ↓
USER AUTH / SESSION
  ↓
USER ACCOUNT
  ↓
USER BUSINESS SERVICES
  ↓
UI

UI modules must not become the central authority for account state.

31. CURRENT REPOSITORY ALIGNMENT
The existing User repository already contains account-related implementation components such as:
user_profile_management_controller.js
user_auth.js
user_auth.html
user_dashboard_controller.js
user_kyc_upload.js
user_registration_controller.js

These files represent implementation-level components.
This architecture document defines their intended architectural relationship rather than replacing their implementation documentation.

32. FUTURE SERVICE MODEL
The architecture supports a future centralized service:
user_account_service.js

Potential responsibilities:
getUserAccount()
updateUserProfile()
getAccountStatus()
validateAccount()
getAccountEligibility()
updateAccountStatus()

This service should become the controlled interface between User business modules and persistent account data.

33. FUTURE REPOSITORY MODEL
Long-term architecture:
USER UI
   ↓
USER CONTROLLER
   ↓
USER ACCOUNT SERVICE
   ↓
USER REPOSITORY
   ↓
PERSISTENT STORAGE

This separates:
Presentation
Business orchestration
Account service
Persistence


34. ACCOUNT GOVERNANCE
Account governance must remain controlled by the appropriate authority.
User-level operations:
View own account
Update permitted profile fields
Submit permitted account information

Administrative operations:
Review account
Change controlled status
Approve/reject controlled workflows
Perform governance actions

The exact administrative authority follows the enterprise Admin/Super Admin governance architecture.

35. USER OWNERSHIP BOUNDARY
A User may access only their own account information unless an explicitly authorized administrative workflow applies.
Therefore:
Current Session User
        =
Target User

must normally be true for User-level account operations.
Cross-user account modification belongs to authorized administrative services.

36. ACCOUNT CONSISTENCY
The same User identity must remain consistent across:
Authentication
Session
Account
Profile
PIN
Wallet
Network
Upgrade
Rank
Withdrawal
Audit

The primary identity key is:
userId

No subsystem should silently create a competing User identity.

37. FAILURE ISOLATION
Failure in one User service must not corrupt the core account identity.
For example:
Wallet failure
     ≠
Account deletion

Upgrade failure
     ≠
Profile corruption

Notification failure
     ≠
Account status change

Account integrity must remain protected from downstream service failures.

38. IMPLEMENTATION PRINCIPLE
The Account Management layer follows:
Single User Identity
        +
Controlled Account State
        +
Session-Based Resolution
        +
Explicit Authorization
        +
Validated Updates
        +
Centralized Storage Authority
        +
Auditability


39. ARCHITECTURAL SUMMARY
The User Account Management layer is the central account-state boundary of the User subsystem.
It connects:
AUTHENTICATION
      ↓
ACCOUNT IDENTITY
      ↓
ACCOUNT STATE
      ↓
PROFILE / KYC
      ↓
USER ELIGIBILITY
      ↓
BUSINESS SERVICES

It does not own:
Authentication authority
Wallet authority
Ledger authority
PIN authority
Network authority
Upgrade authority
Rank authority
Withdrawal financial authority

Instead, it provides the trusted User account context required by those services.

40. FINAL ARCHITECTURE MODEL
┌──────────────────────────────────────┐
│          USER AUTHENTICATION         │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│       USER SESSION AUTHORITY         │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│       USER ACCOUNT MANAGEMENT        │
│                                      │
│  Identity                            │
│  Profile                             │
│  Account Status                      │
│  KYC State                           │
│  Eligibility                         │
│  Account Lifecycle                   │
└──────────────────┬───────────────────┘
                   │
       ┌───────────┼────────────┐
       ▼           ▼            ▼
   Dashboard     Profile       KYC
       │
       ├────────── PIN
       ├────────── Wallet
       ├────────── Upgrade
       ├────────── Rank
       ├────────── Network
       └────────── Withdrawal
                   │
                   ▼
          Audit / Event System
                   │
                   ▼
             User Storage


41. LAYER 05 STATUS
Architecture Status: ✅ Defined
 Repository Alignment: ✅ Mapped
 Account Boundary: ✅ Defined
 Authentication Boundary: ✅ Defined
 Authorization Boundary: ✅ Defined
 KYC Relationship: ✅ Defined
 Financial Separation: ✅ Defined
 Future Service Path: ✅ Defined

42. REMARKS
This document defines the architectural responsibility of User Account Management.
Repository-level implementation details remain documented separately in the User Knowledge Base.
The Account Management layer must remain independent from UI presentation and must not become a duplicate authority for financial, PIN, network, upgrade, or authentication logic.
Future User implementation work must preserve this separation of responsibility.
Next architectural layer:
 USER_LAYER_06_USER_NETWORK_MANAGEMENT.md
