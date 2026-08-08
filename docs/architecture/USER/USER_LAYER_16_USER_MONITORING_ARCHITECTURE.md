USER_LAYER_18_USER_SERVICE_DEPENDENCIES.md
Document Name: USER_LAYER_18_USER_SERVICE_DEPENDENCIES.md
 Documentation Type: User Architecture — Layer 18
 Subsystem: USER
 Location: docs/architecture/USER/USER_LAYER_18_USER_SERVICE_DEPENDENCIES.md
 Status: ✅ Complete
 Version: 1.0
 Last Updated: 2026-08-08

1. PURPOSE
This document defines the complete service dependency architecture of the BestWayGrow USER subsystem.
It establishes:
Which services the User subsystem depends upon
Which Core authorities provide infrastructure
Which Platform services provide enterprise capabilities
Which User modules consume those services
Dependency direction
Service ownership
Execution boundaries
Financial dependency rules
Authentication and session dependencies
Storage dependencies
Event and audit dependencies
Failure boundaries
Future service extraction requirements
The permanent architectural principle is:
USER MODULES CONSUME AUTHORITIES — THEY DO NOT REPLACE THEM.

2. SERVICE DEPENDENCY ARCHITECTURE
The User subsystem operates within the enterprise architecture:
SUPER ADMIN
    ↓
SYSTEM ADMIN
    ↓
PLATFORM / CORE AUTHORITIES
    ↓
USER SERVICES
    ↓
USER CONTROLLERS / UI

The User subsystem is therefore a consumer and execution layer, not an independent infrastructure authority.

3. CORE DEPENDENCY PRINCIPLE
The User subsystem follows:
User Feature
    ↓
User Controller
    ↓
Business Authority / Service
    ↓
Core / Platform Authority
    ↓
Repository / Storage

A User controller must not directly bypass an authoritative service when such a service exists.

4. PRIMARY USER SERVICE DOMAINS
The User subsystem may depend upon the following service domains:
Authentication Service
Session Service
User Account Service
User Profile Service
PIN Service
Wallet Service
Ledger Service
Withdrawal Service
Upgrade Service
Rank / Qualification Service
Network / Tree Service
Income Service
Notification Service
Support Service
KYC Service
Franchise Service
Audit Service
Event Service
Storage Service
Security Service

5. AUTHENTICATION DEPENDENCY
User authentication depends upon the centralized authentication authority.
User Login
    ↓
Authentication Authority
    ↓
Identity Verification
    ↓
Account Resolution
    ↓
Session Creation
    ↓
User Access

User modules must not independently establish authentication state.

6. SESSION DEPENDENCY
Protected User operations depend upon Session Authority.
User Request
    ↓
Session Validation
    ↓
Current User Resolution
    ↓
Role Validation
    ↓
Account Status Validation
    ↓
User Operation

Typical authority-facing functions include:
getSession()
getCurrentUser()
hasRole()
logoutSession()

These functions represent service boundaries rather than independent User implementations.

7. USER ACCOUNT DEPENDENCY
User account operations depend upon authoritative User Account services.
Responsibilities include:
User identity
Account status
Account ownership
Profile ownership
Account lifecycle
Account restrictions
User state
The User interface may display account information but must not become the authoritative account store.

8. PROFILE SERVICE DEPENDENCY
Profile management depends upon the User Profile authority.
Examples:
Profile Read
Profile Update
Profile Validation
Profile Status
Profile Ownership

Profile data must remain bound to the authenticated User identity.

9. PIN SERVICE DEPENDENCY
User PIN operations depend upon the centralized PIN subsystem.
Examples include:
PIN request
PIN approval
PIN activation
PIN dashboard
PIN status
PIN package information
PIN usage
The User subsystem consumes PIN authority rather than redefining PIN product rules.

10. WALLET SERVICE DEPENDENCY
Wallet operations are financially authoritative.
The User subsystem depends upon the authoritative wallet implementation.
User Wallet UI
      ↓
Wallet Authority
      ↓
Wallet Transaction Authority
      ↓
Ledger / Storage

User controllers must not independently become the final financial authority.
The repository currently identifies:
wallet_system.js

as the authoritative wallet implementation.
wallet_engine.js is intentionally disabled to prevent duplicate wallet authority.

11. LEDGER DEPENDENCY
Financial User operations depend upon ledger integrity.
Examples:
Wallet credit
Wallet debit
Income posting
Withdrawal deduction
Upgrade payment
Repurchase payment
Financial adjustment
The architectural rule is:
Financial Action
    ↓
Business Authority
    ↓
Ledger Posting
    ↓
Wallet / Financial State

A UI controller must not silently create financial state outside the authoritative financial path.

12. WITHDRAWAL SERVICE DEPENDENCY
Withdrawal functionality depends upon:
Authentication
Session Authority
User Account
Wallet Authority
Withdrawal Authority
Ledger
Audit
Storage
The intended flow is:
User
 ↓
Withdrawal UI
 ↓
Session Validation
 ↓
Withdrawal Guard
 ↓
Withdrawal Authority
 ↓
Wallet / Ledger Validation
 ↓
Withdrawal Request
 ↓
Pending State
 ↓
Administrative / Financial Processing

The repository's user_withdrawal_request_controller.js follows the UI-only responsibility model and delegates the withdrawal operation through the withdrawal authority.

13. UPGRADE SERVICE DEPENDENCY
User upgrade execution depends upon:
Session Authority
User Account
PIN / Product Authority
Wallet / Payment Authority
Business validation
Ledger
Audit
The User controller must coordinate the operation rather than independently redefine upgrade rules.

14. RANK AND QUALIFICATION DEPENDENCY
Rank functionality depends upon authoritative qualification and reward logic.
Potential dependencies include:
User Activity
    ↓
Network Data
    ↓
Qualification Rules
    ↓
Rank Calculation
    ↓
Reward Eligibility
    ↓
Ledger / Income

Rank display is a User responsibility.
Rank authority remains a business-rule responsibility.

15. NETWORK / TREE DEPENDENCY
User network functionality depends upon the appropriate network authorities.
The architecture distinguishes between:
Sponsor Tree
Used for placement and structural logic and remains invisible to normal Users.
Introducer Tree
Used for User-visible relationship and income/tree presentation.
User interfaces must consume the appropriate authority rather than reconstructing enterprise tree relationships from arbitrary client data.

16. INCOME SERVICE DEPENDENCY
Income history and income display depend upon authoritative income records.
The User subsystem may display:
Income history
Income categories
Amounts
Dates
Transaction references
Status
However, income creation must remain controlled by the appropriate business and ledger authority.

17. NOTIFICATION SERVICE DEPENDENCY
User notification features depend upon the centralized notification capability.
Examples:
System notifications
PIN notifications
Wallet notifications
Withdrawal status notifications
Account notifications
Security notifications
Notification presentation belongs to the User layer.
Notification generation and authoritative event handling belong to the service/event architecture.

18. SUPPORT SERVICE DEPENDENCY
Support ticket functionality depends upon the Support Service.
User
 ↓
Support UI
 ↓
Ticket Service
 ↓
Support Workflow
 ↓
Administrative Resolution

The User layer may create and display tickets but should not bypass support workflow authority.

19. KYC SERVICE DEPENDENCY
KYC functionality depends upon:
User identity
Account service
Document storage
Validation
Security
Administrative review
The User subsystem may upload or present KYC information, while verification authority remains outside the presentation layer.

20. FRANCHISE SERVICE DEPENDENCY
User franchise applications depend upon:
User Account
Franchise business authority
Validation
Approval workflow
Storage
Notification
Audit
The User layer submits and displays application state.
Final approval remains controlled by the appropriate authority.

21. AUDIT SERVICE DEPENDENCY
Sensitive User actions should integrate with enterprise audit services.
Examples:
LOGIN
PROFILE_UPDATE
PIN_REQUEST
PIN_ACTIVATION
UPGRADE
REPURCHASE
WITHDRAW_REQUEST
WALLET_TRANSACTION
SECURITY_FAILURE
SESSION_TERMINATION

Audit records should preserve sufficient traceability for enterprise review.

22. EVENT SERVICE DEPENDENCY
User services may publish or consume enterprise events.
Examples:
USER_REGISTERED
USER_LOGIN
SESSION_CREATED
PIN_ACTIVATED
WALLET_CREDITED
WALLET_DEBITED
UPGRADE_COMPLETED
WITHDRAW_REQUESTED
WITHDRAW_STATUS_CHANGED
RANK_CHANGED
NOTIFICATION_CREATED

Event generation must remain controlled by the appropriate service boundary.

23. STORAGE SERVICE DEPENDENCY
User services depend upon authoritative repository/storage mechanisms.
Storage responsibilities may include:
User records
Session state
Wallet state
Transaction records
Withdrawal requests
KYC records
Support tickets
Notifications
Audit records
The User UI must not assume that browser state is the authoritative database.

24. SECURITY SERVICE DEPENDENCY
Security-sensitive User operations depend upon centralized security controls.
Security boundaries include:
Authentication
Authorization
Session validation
Role validation
Account status
Identity binding
Financial authorization
Audit
Security events

25. DEPENDENCY DIRECTION
The permanent dependency direction is:
USER UI
   ↓
USER CONTROLLER
   ↓
USER SERVICE
   ↓
CORE / PLATFORM AUTHORITY
   ↓
REPOSITORY / STORAGE

Reverse dependency is prohibited where it creates authority conflicts.
Core services must not depend upon User UI implementations.

26. NO DUPLICATE AUTHORITY RULE
The User subsystem must never create competing implementations of:
Authentication
Session
Wallet
Ledger
PIN products
Authorization
Enterprise audit
Core storage authority
If an authoritative service already exists, User modules must consume it.

27. CURRENT WALLET DEPENDENCY ALIGNMENT
The repository contains:
wallet_engine.js
wallet_sync_engine.js

Both are explicitly disabled.
Their documented purpose is compatibility and prevention of conflicting wallet implementations.
Current architectural authority:
wallet_system.js
        ↓
Authoritative Wallet State

Therefore:
wallet_engine.js
    = Disabled

wallet_sync_engine.js
    = Disabled

wallet_system.js
    = Wallet Authority

This prevents wallet overwrite and reconciliation conflicts.

28. SERVICE FAILURE BOUNDARY
If a required authoritative service is unavailable:
Service Failure
    ↓
Stop Operation
    ↓
Do Not Create Partial Business State
    ↓
Display Safe Error
    ↓
Audit Where Required

A User controller must not silently substitute an unsafe local implementation for an unavailable financial or security authority.

29. FINANCIAL SERVICE SAFETY
Financial operations require the strongest dependency enforcement.
Examples:
Wallet credit
Wallet debit
Withdrawal
Upgrade
Repurchase
Income posting
Required model:
Session
 ↓
Authorization
 ↓
Business Authority
 ↓
Financial Validation
 ↓
Ledger
 ↓
Wallet State
 ↓
Audit

UI-only validation is never sufficient for financial execution.

30. DEPENDENCY VALIDATION
Every User module should be evaluated for:
Required services
Required functions
Authority ownership
Initialization order
Failure behavior
Security dependency
Storage dependency
Audit dependency
A missing dependency must fail safely.

31. INITIALIZATION DEPENDENCY
Protected User pages should follow:
Page Load
 ↓
Core Boot
 ↓
Core Initialization
 ↓
Authentication Authority
 ↓
Session Authority
 ↓
Required Services
 ↓
Current User
 ↓
Role / Account Validation
 ↓
User Controller
 ↓
UI Initialization

This prevents User modules from executing before required infrastructure is available.

32. SERVICE INTERFACE PRINCIPLE
User controllers should consume stable service interfaces.
Conceptually:
Authentication
getCurrentUser()

Session
getSession()
logoutSession()

Authorization
hasRole()

Wallet
wallet authority functions

Withdrawal
requestWithdraw()

User Repository
getUsers()

Actual function names may evolve, but authority ownership must remain stable.

33. SECURITY DEPENDENCY RULE
Security dependencies are mandatory rather than optional.
A User feature must not execute protected operations merely because:
The page loaded
A button was clicked
A User ID exists in HTML
A User ID exists in local storage
A client-side variable contains a User
A URL contains an account identifier
Authority validation remains mandatory.

34. USER SERVICE DEPENDENCY MATRIX
User Domain
Primary Dependencies
Authentication
Authentication Authority, User Account
Session
Session Authority, Security
Dashboard
Session, User Account, Feature Services
Profile
User Account, Profile Service
PIN
PIN Authority, Session
Wallet
Wallet Authority, Ledger, Session
Withdrawal
Withdrawal Authority, Wallet, Ledger, Session
Upgrade
Upgrade Authority, Wallet/PIN, Ledger, Session
Rank
Qualification, Network, Income/Reward
Income
Income Authority, Ledger
Network
Sponsor/Introducer authorities
KYC
Account, Storage, Verification
Franchise
Franchise Authority, Account, Approval
Notifications
Notification/Event Service
Support
Support Service
Audit
Audit Service
Monitoring
Event, Security, Audit
Storage
Repository / Storage Authority

35. CURRENT REPOSITORY ALIGNMENT
The current User repository demonstrates increasing service-boundary alignment.
Examples include:
user_withdrawal_request_controller.js

which validates:
Session
 ↓
Current User
 ↓
User Role
 ↓
Account Status
 ↓
Withdrawal Safety
 ↓
Withdrawal Authority

This confirms the intended architecture of:
UI Controller → Authority → Execution
rather than:
UI Controller → Direct Business Mutation

36. FUTURE SERVICE EXTRACTION
As the system evolves, the following dedicated services may become explicit:
user_service.js
wallet_service.js
ledger_service.js
rank_service.js
upgrade_service.js
profile_service.js
notification_service.js
audit_service.js
withdrawal_service.js
income_service.js
network_service.js

Service extraction must preserve current authority ownership and must not create duplicate business logic.

37. SERVICE OWNERSHIP RULE
Every major business capability should have one clearly identifiable authority.
Example:
Wallet
→ Wallet Authority

Session
→ Session Authority

PIN Product
→ PIN Authority

Ledger
→ Ledger Authority

Withdrawal
→ Withdrawal Authority

The User subsystem consumes these authorities.

38. DEPENDENCY GOVERNANCE
Any new User dependency must be evaluated for:
Ownership
Security
Initialization
Data source
Storage
Failure handling
Audit
Event integration
Financial impact
Duplicate-authority risk
No new dependency should be introduced without architectural justification.

39. ARCHITECTURAL SAFETY RULE
The permanent User service dependency rule is:
NO AUTHORITY
    ↓
NO BUSINESS EXECUTION

For financial operations:
NO FINANCIAL AUTHORITY
    ↓
NO FINANCIAL MUTATION

For security operations:
NO SECURITY AUTHORITY
    ↓
NO PROTECTED ACCESS


40. COMPLETE USER SERVICE FLOW
USER
 ↓
USER UI
 ↓
USER CONTROLLER
 ↓
SESSION / AUTHORIZATION
 ↓
USER SERVICE
 ↓
BUSINESS AUTHORITY
 ↓
CORE / PLATFORM SERVICE
 ↓
LEDGER / REPOSITORY / STORAGE
 ↓
AUDIT / EVENT
 ↓
USER RESULT


41. ARCHITECTURAL SUMMARY
The User subsystem is intentionally dependent upon centralized enterprise authorities.
The architecture establishes:
Authentication authority remains centralized.
Session authority remains centralized.
User identity remains session-bound.
PIN authority remains centralized.
Wallet authority remains centralized.
Ledger authority remains centralized.
Withdrawal execution remains authority-driven.
Rank and qualification remain business-rule controlled.
Network relationships remain authority-controlled.
Storage remains repository-controlled.
Audit remains enterprise-controlled.
Events remain service-controlled.
User controllers remain orchestration and presentation components.

42. LAYER 18 FINAL STATEMENT
The User Service Dependency Architecture establishes a controlled dependency boundary between User functionality and enterprise infrastructure.
The permanent model is:
USER EXPERIENCE → USER CONTROLLER → USER SERVICE → CORE / PLATFORM AUTHORITY → STORAGE / LEDGER
This prevents:
Duplicate authorities
Direct unauthorized mutation
Wallet conflicts
Session bypass
Identity substitution
Financial inconsistency
Service coupling failures
Uncontrolled repository access
The User subsystem therefore remains scalable, replaceable, auditable, and compatible with the broader BestWayGrow enterprise architecture.
Status: ✅ USER LAYER 18 COMPLETE
NEXT ARCHITECTURE LAYER:
USER_LAYER_19_USER_EXECUTION_LIFECYCLE.md
