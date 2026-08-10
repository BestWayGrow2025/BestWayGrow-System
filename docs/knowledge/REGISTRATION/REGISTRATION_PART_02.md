REGISTRATION PART 2
RBK-003 — core_registration_validation_authority.js
Documentation Type: Registration Knowledge / Architecture Check
 RBK: RBK-003
 File: core_registration_validation_authority.js
 Role: Central Registration Validation Authority
 Status: 🔍 Checked — Code Change Pending Decision
 Checking Standard: 41 Master Checking Headings
 Protocol: FILE LIST → RBK SEQUENCE → FUNCTION INVENTORY → LINK / DEPENDENCY CHECK → DUPLICATE CHECK → LEGACY CHECK → SECURITY CHECK → FLOW CHECK → NOTES → CHANGE DECISION → CONTROLLED CODE CHANGE → RECHECK → STAMP → NEXT FILE

01. FILE IDENTITY
File: core_registration_validation_authority.js
The file is clearly identified as a centralized registration validation authority.
Finding: ✅ Correct identity.

02. REGISTRATION RESPONSIBILITY
The file is responsible for:
Email validation
Mobile validation
Position validation
Duplicate mobile detection
Duplicate email detection
Introducer validation
Main registration-data validation
Finding: ✅ Responsibility is appropriate for RBK-003.

03. SCRIPT / FILE LOADING
The file itself contains no <script> loading.
It depends on externally available functions:
getUsers()
getUserById()

These dependencies must be available before validation functions execute.
Finding: ⚠️ Dependency exists and must be verified in RBK dependency checking.

04. REGISTRATION ENTRY FLOW
The file does not initiate registration.
Expected relationship:
Registration UI
↓
Registration Controller
↓
Validation Authority
↓
Validation Result
↓
Queue / Registration Processing

The authority is correctly positioned as a validation layer rather than an entry controller.
Finding: ✅ Architectural position is correct.

05. FUNCTION INVENTORY
Functions found:
isValidEmail()
isValidMobile()
isValidPosition()
isDuplicateMobile()
isDuplicateEmail()
isValidIntroducer()
validateRegistration()

Exports:
window.isValidEmail
window.isValidMobile
window.isValidPosition
window.isDuplicateMobile
window.isDuplicateEmail
window.isValidIntroducer
window.validateRegistration

Finding: ✅ Function inventory complete.

06. DUPLICATE FUNCTION AUDIT
The file contains one implementation of each listed validation function.
However, RBK-002 previously contains direct validation logic for:
Required fields
Mobile format
Duplicate mobile
Duplicate email
Position selection
Therefore, there is already evidence of validation duplication across the registration module.
Finding: 🔴 Duplicate validation responsibility exists.
Important: Do not remove anything yet. Confirm through RBK-002/RBK-003 dependency comparison before controlled change.

07. LEGACY REGISTRATION PATH AUDIT
No explicit legacy registration path is present inside this file.
The file appears to represent the current centralized validation authority.
Finding: 🟢 No internal legacy path identified.

08. INPUT COLLECTION
The authority does not collect UI input directly.
It receives a data object through:
validateRegistration(data)

This is appropriate.
Finding: ✅ Correct separation.

09. INPUT NORMALIZATION
The main validator normalizes:
username
email
mobile
password
introducerId
position

using:
String(...).trim()

Email duplicate comparison additionally uses lowercase normalization.
Finding: ✅ Basic normalization exists.
Note: Normalization policy should eventually be centralized consistently across controller and authority.

10. REGISTRATION VALIDATION
Validation covers:
Object existence
Required fields
Username minimum length
Email format
Mobile format
Password minimum length
Position
Introducer
Duplicate mobile
Duplicate email
Finding: ✅ Strong basic validation coverage.
Finding: ⚠️ Validation policy needs alignment with the registration controller so two different validation authorities do not drift.

11. DUPLICATE PROTECTION
Duplicate protection exists for:
Mobile
Email

using current users retrieved from:
getUsers()

However, duplicate protection is currently also performed directly in RBK-002.
Finding: ⚠️ Duplicate protection is functionally duplicated.
Decision: Authority should remain the architectural source; final change requires dependency confirmation.

12. REFERRAL / INTRODUCER FLOW
The authority validates the introducer through:
isValidIntroducer(introducerId)

which calls:
getUserById(introducerId)

This confirms that the supplied introducer exists.
Finding: ✅ Introducer existence validation exists.
Important: This does not itself perform placement or sponsor-tree logic.

13. SPONSOR / PLACEMENT BOUNDARY
Position validation only accepts:
L
R

The file does not create placement.
This is appropriate because placement belongs to the registration/tree integration layer.
Finding: ✅ Boundary respected.

14. REGISTRATION QUEUE
The authority does not enqueue registrations.
Expected relationship:
Validation Authority
↓
Queue Manager

Finding: ✅ Correct separation.

15. REGISTRATION APPROVAL
No approval logic exists.
This is correct for the validation authority.
Finding: ✅ No responsibility leakage.

16. USER CREATION
No user creation occurs.
This is architecturally correct.
Finding: ✅ Correct boundary.

17. TREE CREATION / PLACEMENT
No tree creation or placement is performed.
The authority only validates introducer existence and position syntax.
Finding: ✅ Correct boundary.

18. AUTHENTICATION INTEGRATION
No authentication logic is present.
This file validates registration data and does not authenticate existing users.
Finding: ✅ Correct separation.

19. SESSION INTEGRATION
No session manipulation is performed.
Finding: ✅ Correct.

20. ACCOUNT STATUS LIFECYCLE
No account-status lifecycle logic is performed.
The authority validates registration input only.
Finding: ✅ Correct boundary.

21. SECURITY PROTECTION
Security-related validation includes:
Required fields
Input format checks
Duplicate checks
Introducer existence
However, password validation is only:
password.length < 4

This is weak as a registration security policy.
More importantly, RBK-002 encodes the password using:
btoa(password)

That is encoding, not password hashing.
Finding: 🔴 Security concern identified.
Decision: Do not modify this file in isolation. Password-security architecture must be checked against the authentication/password authority before any change.

22. PASSWORD SECURITY
Current validation:
password.length < 4

No hashing occurs in this file.
The validator accepts the password as supplied.
Finding: 🔴 Password policy is too weak for production architecture.
Important: This heading identifies an architectural issue; it does not authorize a code change yet.

23. STORAGE ARCHITECTURE
The authority reads user data through:
getUsers()

It does not directly write storage.
Finding: ✅ Read-only dependency from this file.
Dependency requiring verification: getUsers() implementation and storage source.

24. EVENT ARCHITECTURE
No event emission or event subscription is present.
No direct dependency on:
core_event_bus.js

is visible.
Finding: 🟢 No event-bus dependency established from supplied code.
RBK-017 should only be considered if repository linkage proves registration validation events are expected.

25. LOCK / CONCURRENCY PROTECTION
No lock exists inside this authority.
This is not automatically a defect because validation should not be responsible for registration execution locking.
However:
validate → duplicate check → queue/write

can have a race condition if multiple registrations are processed concurrently.
Finding: ⚠️ Concurrency protection must be owned by the appropriate execution/queue layer, not necessarily this file.

26. ERROR HANDLING
The validator consistently returns:
{
  valid: false,
  message: "..."
}

instead of throwing for normal validation failures.
Finding: ✅ Basic error-result architecture is clean.
Note: Internal technical errors from dependencies such as getUsers() are not explicitly handled.

27. FAILURE RECOVERY
No recovery mechanism exists.
This is appropriate for a validation authority.
It returns failure results to the caller.
Finding: ✅ Recovery responsibility remains outside this file.

28. REGISTRATION STATUS MONITORING
No registration status monitoring is performed.
This is correct.
Finding: ✅ No responsibility leakage.

29. REDIRECT / NAVIGATION
No redirect or navigation exists.
Finding: ✅ Correct.

30. UI / CONTROLLER SEPARATION
No DOM access exists.
No HTML element manipulation exists.
No event listener exists.
Finding: ✅ Strong separation from UI/controller layer.

31. CROSS-MODULE DEPENDENCIES
Direct external dependencies identified:
getUsers()
getUserById()
window

Indirect architectural relationship:
Registration Controller
        ↓
Validation Authority
        ↓
User Data / Introducer Data

Finding: ⚠️ Dependency implementations must be verified.

32. DEPENDENCY DIRECTION
Expected direction:
UI
↓
Registration Controller
↓
Registration Validation Authority
↓
Data / Core Services

The authority itself does not depend on the registration controller.
Finding: ✅ Direction is appropriate.

33. GLOBAL NAMESPACE AUDIT
All functions are declared globally and then explicitly exported to:
window

This creates global namespace exposure.
Examples:
window.validateRegistration
window.isValidEmail
window.isValidMobile

Finding: ⚠️ Global namespace pollution exists.
Decision: Do not change until repository-wide usage is confirmed.

34. HTML INTEGRATION AUDIT
The supplied RBK-001 HTML does not directly load:
core_registration_validation_authority.js

RBK-001 loads:
core_registration_tree_connector.js
core_registration_queue_manager.js
user_registration_controller.js

Therefore, validation authority loading/integration is currently not demonstrated by RBK-001.
Finding: 🔴 Important integration gap to verify.
Possible explanations:
Controller loads/uses it indirectly.
Core module wiring loads it.
It is currently not loaded.
Another registration page loads it.
This must be confirmed before code change.

35. REGISTRATION FLOW INTEGRITY
The intended architecture should be:
Registration UI
↓
Registration Controller
↓
Validation Authority
↓
Queue Manager
↓
Approval / Processing
↓
User Creation
↓
Tree Integration

The authority itself fits correctly into this flow.
However, RBK-002 currently performs validation independently.
Finding: 🔴 Flow integrity is incomplete until controller-to-authority linkage is confirmed.

36. END-TO-END TEST POINTS
Required test points:
Valid registration
Invalid email
Invalid mobile
Invalid position
Missing field
Short username
Short password
Invalid introducer
Duplicate mobile
Duplicate email
Missing getUsers()
Missing getUserById()
Queue submission after validation

Additional security test:
Password handling must never rely on btoa() as hashing.

Finding: ⚠️ Test matrix required before final stamp.

37. DUPLICATE / LEGACY FINAL SWEEP
Current evidence indicates:
Duplicate responsibility
RBK-002 duplicates several validation operations.
Legacy code
No legacy implementation is proven from RBK-003 alone.
Finding: 🔴 Duplicate responsibility confirmed; legacy status remains pending repository-wide verification.

38. CODE CHANGE DECISION
Current decision
DO NOT CHANGE CODE YET.
Reasons:
RBK-002 already performs direct validation.
RBK-001 does not visibly load RBK-003.
getUsers() dependency must be traced.
getUserById() dependency must be traced.
Password handling requires wider security review.
Global function usage must be checked before any namespace change.
Preliminary architectural direction
If dependency verification confirms RBK-003 is the intended authority:
RBK-002
↓
validateRegistration()
↓
RBK-003

and duplicated controller-side validation can then be considered for controlled removal.
No removal yet.

39. CHANGE SAFETY CHECK
Before modifying RBK-003 or RBK-002, verify:
All references to validateRegistration()
All references to individual validation functions
All files loading RBK-003
All implementations of getUsers()
All implementations of getUserById()
Existing password authority
Existing registration queue contract
Existing registration approval flow
Existing tree integration
Global namespace consumers
Finding: 🔴 Change is not yet safe.

40. FINAL REGISTRATION STAMP
RBK-003 STATUS
CHECKED:        ✅
41 HEADINGS:    ✅
CODE CHANGED:   ❌
CHANGE SAFE:    ❌ NOT YET
DEPENDENCIES:   🔍 PENDING
DUPLICATES:     🔴 CONFIRMED
SECURITY ISSUE: 🔴 CONFIRMED
NEXT ACTION:    DEPENDENCY / LINK CHECK

STAMP:
RBK-003 — CHECK COMPLETE
CODE CHANGE — HOLD
DEPENDENCY VERIFICATION REQUIRED


41. REGISTRATION MODULE INDEX UPDATE
RBK-003 must be recorded in the Registration Knowledge Index as:
RBK-003
core_registration_validation_authority.js
Central Registration Validation Authority
Status: Checked — Change Pending Dependency Verification

Do not mark RBK-003 as fully code-complete yet.

RBK-003 FINAL NOTES
Confirmed strengths
Centralized validation function exists.
Validation responsibilities are clearly defined.
UI separation is clean.
Queue and tree responsibilities are not mixed into the authority.
Error-result pattern is consistent.
Introducer and position validation are present.
Confirmed concerns
1. Controller-side validation duplication
2. RBK-003 loading/linkage not yet proven
3. getUsers() dependency not yet traced
4. getUserById() dependency not yet traced
5. Password minimum length is weak
6. btoa() password encoding exists in RBK-002
7. Global namespace exposure
8. Concurrency ownership requires verification

Current architecture decision
RBK-003 SHOULD remain the centralized
registration validation authority.

BUT

RBK-002 → RBK-003 linkage must be proven
before duplicate controller validation is removed.


RBK-003 CHECKPOINT
RBK-001  user_registration_dashboard.html
         ✅ DONE / SAVED

RBK-002  user_registration_controller.js
         ✅ DONE / SAVED

RBK-003  core_registration_validation_authority.js
         ✅ 41-HEADING CHECK COMPLETE
         ⏸ CODE CHANGE ON HOLD
         🔍 DEPENDENCY VERIFICATION REQUIRED

REGISTRATION PART 2
RBK-004 — core_registration_queue_manager.js
Registration Module: REGISTRATION
 RBK Sequence: RBK-004
 File: core_registration_queue_manager.js
 Check Status: 🟡 HOLD — DEEP DEPENDENCY CHECK REQUIRED
 Code Change: ❌ NOT YET
 Final Stamp: ⏳ Pending

1. FILE IDENTITY
File: core_registration_queue_manager.js
Primary responsibility:
Registration queue lifecycle
Queue persistence
Queue duplicate protection
Queue processing
Retry handling
Registration status tracking
Queue cleanup
Queue execution scheduling

2. MASTER CHECKING HEADINGS
#
Master Checking Heading
RBK-004 Finding
01
File Identity
✅ Registration queue authority
02
Registration Responsibility
✅ Queue lifecycle
03
Script / File Loading
⚠️ Depends on getUsers() and createUserWithTree()
04
Registration Entry Flow
✅ Receives registration request
05
Function Inventory
⚠️ 15 functions/operations identified
06
Duplicate Function Audit
🔍 Must compare queue functions elsewhere
07
Legacy Registration Path Audit
⚠️ Verify no older queue processor
08
Input Collection
❌ Not responsible
09
Input Normalization
⚠️ Minimal normalization only
10
Registration Validation
⚠️ Basic queue-row validation exists but is not used by submission
11
Duplicate Protection
⚠️ Multiple duplicate layers; fingerprint is incomplete
12
Referral / Introducer Flow
⚠️ Passed through, not validated here
13
Sponsor / Placement Boundary
⚠️ Delegated to tree creation
14
Registration Queue
✅ Core responsibility
15
Registration Approval
❌ Delegated
16
User Creation
⚠️ Delegated to createUserWithTree()
17
Tree Creation / Placement
⚠️ Delegated
18
Authentication Integration
❌ No direct authentication
19
Session Integration
❌ No direct session handling
20
Account Status Lifecycle
⚠️ Queue status only
21
Security Protection
⚠️ Weak client-side/localStorage boundary
22
Password Security
🔴 Critical: receives/stores supplied password value
23
Storage Architecture
⚠️ localStorage queue/archive
24
Event Architecture
⚠️ Timer-driven, no registration event authority
25
Lock / Concurrency Protection
⚠️ Lock exists but is not atomic
26
Error Handling
✅ Retry + error capture
27
Failure Recovery
✅ Three retries + FAILED state
28
Registration Status Monitoring
✅ PENDING/DONE/FAILED
29
Redirect / Navigation
❌ Not responsible
30
UI / Controller Separation
⚠️ Mostly separated
31
Cross-Module Dependencies
🔴 Significant
32
Dependency Direction
⚠️ Queue → tree/user storage
33
Global Namespace Audit
⚠️ Many global functions/variables
34
HTML Integration Audit
🔍 Must verify all callers
35
Registration Flow Integrity
⚠️ Needs end-to-end verification
36
End-to-End Test Points
🔍 Required
37
Duplicate / Legacy Final Sweep
🔍 Required
38
Code Change Decision
⏳ No change yet
39
Change Safety Check
⏳ Required after dependency check
40
Final Registration Stamp
⏳ Pending
41
Registration Module Index Update
⏳ After stamp

3. CRITICAL FINDINGS
3.1 Password Security — CRITICAL
The queue stores the supplied password value and persists queue data through localStorage.
Current architecture:
Registration
    ↓
Password
    ↓
Queue Object
    ↓
localStorage

RBK-002 also performs:
encodePass(password)

using Base64.
Finding:
Base64 is encoding, not password hashing.
Therefore password handling must not be changed blindly inside RBK-004.
The authoritative password architecture must first be identified.

3.2 Registration Validation Boundary
RBK-003 contains the centralized:
validateRegistration(data)

However RBK-004 independently performs basic queue checks and duplicate checks.
Current concern:
RBK-002
    ↓
RBK-003 Validation Authority
    ↓
RBK-004 Queue Manager

must be compared against the actual implementation.
The queue manager must not independently become a second registration validation authority.
Decision: HOLD until RBK-003/RBK-004 dependency verification is complete.

3.3 Registration Fingerprint
Current fingerprint fields include:
mobile
username
sponsorId
parentId
position

RBK-002 currently submits:
introducerId
position

Therefore there is a possible field-model mismatch between:
sponsorId / parentId

and:
introducerId

This must be checked against the tree connector and placement architecture.
Decision: HOLD.

3.4 Queue Lock
Current lock sequence:
getRegLock()
    ↓
isRegLocked()
    ↓
setRegLock(true)

The existence of a lock does not guarantee atomic concurrency protection across browser contexts.
RBK-016 and RBK-018 must be checked before deciding whether this local queue lock should remain.
Decision: HOLD.

3.5 User Creation Dependency
RBK-004 invokes:
createUserWithTree(req)

Therefore the queue manager is directly dependent on the registration → tree → user creation chain.
Required verification:
RBK-004
    ↓
RBK-005
    ↓
RBK-006
    ↓
RBK-007
    ↓
RBK-008

No change should be made to createUserWithTree() calls until this chain is completely checked.

3.6 Cleanup TTL
The file defines:
REG_FAILED_TTL
REG_DONE_TTL

but completed records are currently archived immediately.
Therefore:
REG_DONE_TTL

appears unused by the current cleanup implementation.
Decision: Do not remove until legacy/configuration audit is completed.

3.7 Global Namespace
RBK-004 exposes queue functions through:
window.*

This may be intentional for the current architecture.
However, duplicate/global namespace checks are still required before any rename or consolidation.

4. DEPENDENCY MAP
RBK-002
user_registration_controller.js
        ↓
Registration submission
        ↓
RBK-004
core_registration_queue_manager.js
        ↓
createUserWithTree()
        ↓
RBK-005
core_registration_tree_connector.js
        ↓
RBK-006
core_tree_api_layer.js
        ↓
RBK-007
core_tree_management_engine.js
        ↓
RBK-008
core_tree_placement_engine.js

Validation dependency:
RBK-003
core_registration_validation_authority.js
        ↑
RBK-002
        ?
RBK-004

The ? represents an unresolved dependency boundary that must be verified before code modification.

5. CODE CHANGE DECISION
Decision: ❌ NO CODE CHANGE
Reasons:
Password security boundary requires verification.
Validation authority relationship requires verification.
Registration fingerprint model requires verification.
Queue lock requires concurrency verification.
createUserWithTree() dependency chain requires verification.
Duplicate and legacy queue implementations have not yet been fully checked.
Cleanup TTL behavior requires legacy/configuration verification.

6. REQUIRED NEXT CHECK
The next registration sequence is:
RBK-005
core_registration_tree_connector.js

RBK-006
core_tree_api_layer.js

RBK-007
core_tree_management_engine.js

RBK-008
core_tree_placement_engine.js

These files must be checked before deciding whether RBK-004 requires modification.

7. MASTER RULE
FILE LIST
↓
RBK SEQUENCE
↓
FUNCTION INVENTORY
↓
LINK / DEPENDENCY CHECK
↓
DUPLICATE CHECK
↓
LEGACY CHECK
↓
SECURITY CHECK
↓
FLOW CHECK
↓
NOTES
↓
CHANGE DECISION
↓
CONTROLLED CODE CHANGE
↓
RECHECK
↓
STAMP
↓
NEXT FILE


8. RBK-004 STATUS
RBK-004
core_registration_queue_manager.js

CHECKED: PARTIAL
DEPENDENCIES: NOT COMPLETE
SECURITY: ISSUE IDENTIFIED
DUPLICATE AUDIT: PENDING
LEGACY AUDIT: PENDING
FLOW AUDIT: PENDING
CODE CHANGE: NONE
FINAL STAMP: NOT YET

STATUS: 🟡 HOLD

Important: RBK-004 is not marked DONE until its dependent registration/tree files have been checked and the complete registration flow has been re-evaluated.


