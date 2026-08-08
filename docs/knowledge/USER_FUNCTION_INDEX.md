USER FUNCTION INDEX
Document Name: USER_FUNCTION_INDEX.md
 Documentation Type: User Function Master Index
 Module: USER
 Location: docs/knowledge/USER_FUNCTION_INDEX.md
 Status: ✅ COMPLETE
 Version: 1.0
 Last Updated: 2026-08-08

1. PURPOSE
This document provides the centralized function-level navigation map for the User subsystem.
It identifies the major repository functions, their responsible files, functional domains, and execution responsibilities.
This document complements:
USER_KNOWLEDGE_INDEX.md
USER_ARCHITECTURE_INDEX.md
IMPLEMENTATION_MASTER_USER_INDEX.md

It does not replace individual Knowledge Base entries.

2. USER FUNCTION DOMAINS
The User function inventory is organized into:
Authentication
Registration
Dashboard
Profile
KYC
Franchise
PIN
Repurchase
Upgrade
Rank & Reward
Tree
Income
Notification
Audit
Support
Wallet
Withdrawal

3. AUTHENTICATION FUNCTIONS
Repository Files
user_auth.html
user_auth.js

Primary Responsibilities
Authentication UI
Login processing
Session establishment
Current-user resolution
Role validation
Logout handling

Core Runtime Functions
authenticateUser()
getSession()
getCurrentUser()
hasRole()
logoutSession()

The exact function implementation must always be verified against the current repository source.

4. REGISTRATION FUNCTIONS
Repository Files
user_registration_controller.js
user_registration_dashboard.html

Responsibilities
Registration input
User creation
Validation
Registration workflow
User initialization
Dashboard transition

Functional Concepts
registerUser()
validateRegistration()
createUser()
initializeUser()


5. DASHBOARD FUNCTIONS
Repository Files
user_dashboard.html
user_dashboard_controller.js

Responsibilities
Dashboard initialization
Current-user resolution
User information rendering
Module navigation
Dashboard state presentation


6. PROFILE FUNCTIONS
Repository File
user_profile_management_controller.js

Responsibilities
Profile loading
Profile display
Profile updates
User data validation
Profile persistence


7. KYC FUNCTIONS
Repository File
user_kyc_upload.js

Responsibilities
KYC input handling
Document upload
Validation
KYC state handling
Repository/storage integration


8. FRANCHISE FUNCTIONS
Repository Files
user_apply_franchise.js
user_franchise_application_dashboard.html

Responsibilities
Franchise application
Application validation
Application submission
Application status display
Application lifecycle


9. PIN FUNCTIONS
Repository Files
user_pin_request.html
user_pin_request_controller.js
user_pin_activation.html
user_pin_activation.js
user_pin_dashboard.html
user_pin_dashboard_controller.js

Responsibilities
PIN request
PIN activation
PIN dashboard
PIN status
PIN lifecycle

Functional Concepts
requestPIN()
activatePIN()
loadPINDashboard()
validatePIN()

Exact runtime names must be verified from the repository before implementation changes.

10. REPURCHASE FUNCTIONS
Repository Files
user_repurchase_dashboard.html
user_repurchase_execution_controller.js

Responsibilities
Repurchase display
Repurchase execution
Validation
Transaction processing
Status handling


11. UPGRADE FUNCTIONS
Repository Files
user_upgrade_dashboard.html
user_upgrade_execution_controller.js

Primary Entry Function
upgradeNow()

Execution Authority
executeUpgrade()

Workflow
User Session
     ↓
Current User
     ↓
PIN Input
     ↓
Upgrade Validation
     ↓
Core Upgrade Execution Engine
     ↓
Upgrade Event Bridge
     ↓
Success
     ↓
User Dashboard

The User controller is intentionally UI/controller oriented and delegates actual upgrade execution to the core upgrade engine.

12. RANK AND REWARD FUNCTIONS
Repository File
user_rank_reward_system.js

Responsibilities
Rank calculation
Qualification evaluation
Reward processing
Rank status
User achievement state

The authoritative qualification rules remain governed by the relevant Core/PIN architecture and must not be duplicated incorrectly inside the User UI layer.

13. USER TREE FUNCTIONS
Repository Files
user_tree.html
user_tree.css
user_tree.js

Responsibilities
Tree loading
Tree rendering
User network display
Node interaction
Tree presentation

The User-visible tree must respect the enterprise distinction between visible introducer relationships and internal sponsor/placement logic.

14. INCOME FUNCTIONS
Repository Files
user_income_history_controller.js
user_income_history_dashboard.html

Responsibilities
Income history loading
Income display
Transaction/history presentation
User-specific filtering


15. NOTIFICATION FUNCTIONS
Repository File
user_notification_center_controller.js

Responsibilities
Notification loading
Notification rendering
Read/unread handling
Notification state
User notification presentation


16. AUDIT FUNCTIONS
Repository File
user_login_audit_controller.js

Responsibilities
Login activity
Audit presentation
User login history
Security activity visibility


17. SUPPORT FUNCTIONS
Repository File
user_support_ticket_controller.js

Responsibilities
Ticket creation
Ticket loading
Ticket status
Support interaction
User support workflow


18. WALLET FUNCTIONS
Repository Files
user_wallet_dashboard_controller.js
user_wallet_history_controller.js
wallet_engine.js
wallet_sync_engine.js

Wallet Dashboard
loadWallet()

Wallet History
loadWalletHistory()
loadUserWalletHistory()

Wallet Authority
The repository currently identifies:
wallet_system.js

as the authoritative wallet implementation.
Disabled Compatibility Layer
wallet_engine.js

does not provide active wallet business logic.
Disabled Synchronization Layer
wallet_sync_engine.js

does not rebuild or synchronize wallet balances.

19. WITHDRAWAL FUNCTIONS
Repository Files
user_withdraw_system.js
user_withdrawal_dashboard.html
user_withdrawal_request_controller.js

User Withdrawal Functions
loadWithdrawSection()
submitWithdraw()
loadWithdrawHistory()

Controller Entry
submitWithdraw()

Core Dependency
requestWithdraw()

Safety Dependency
isWithdrawSystemSafe()

Current Controller Workflow
DOM Ready
   ↓
Authentication
   ↓
Authorization
   ↓
Load User
   ↓
Bind Submit Event
   ↓
Validate Amount
   ↓
Check Withdrawal System
   ↓
Request Withdrawal
   ↓
Display Result
   ↓
Return to User Dashboard


20. FUNCTION AUTHORITY PRINCIPLE
User controllers should not independently become financial authorities when an authoritative Core financial engine exists.
The intended pattern is:
USER UI
   ↓
USER CONTROLLER
   ↓
CORE AUTHORITY / ENGINE
   ↓
DATA / LEDGER / WALLET

User controllers should primarily provide:
Authentication
Authorization
Input Handling
UI State
Validation Guard
Event Binding
Core Engine Invocation
Result Display
Navigation


21. FUNCTION INVENTORY STATUS
Domain
Documentation
Authentication
✅
Registration
✅
Dashboard
✅
Profile
✅
KYC
✅
Franchise
✅
PIN
✅
Repurchase
✅
Upgrade
✅
Rank
✅
Tree
✅
Income
✅
Notification
✅
Audit
✅
Support
✅
Wallet
✅
Withdrawal
✅

22. IMPORTANT RULE
Function names shown in this index are documentation-level navigation references.
Before modifying or implementing a function:
Repository Source
      ↓
Knowledge Documentation
      ↓
Architecture
      ↓
Function Index
      ↓
Implementation

The repository source remains the final runtime authority.

23. FINAL STATUS
USER FUNCTION INDEX
Authentication
Registration
Dashboard
Profile
KYC
Franchise
PIN
Repurchase
Upgrade
Rank
Tree
Income
Notification
Audit
Support
Wallet
Withdrawal

Status: ✅ COMPLETE

