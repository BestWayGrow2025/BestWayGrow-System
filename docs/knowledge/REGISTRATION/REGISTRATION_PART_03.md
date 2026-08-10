REGISTRATION PART 3
RBK-005 — core_registration_tree_connector.js
Registration Module: REGISTRATION
 RBK Sequence: RBK-005
 File: core_registration_tree_connector.js
 Role: Registration → Tree compatibility boundary
 Check Status: 🟡 HOLD — DEPENDENCY AUTHORITY CHECK REQUIRED
 Code Change: ❌ NONE
 Final Stamp: ⏳ Pending

1. FILE IDENTITY
core_registration_tree_connector.js is a compatibility wrapper.
It does not implement the actual tree creation business logic.
Its declared purpose is:
Registration
    ↓
Tree Compatibility Connector
    ↓
Existing Tree Engine


2. MASTER CHECKING HEADINGS
#
Master Checking Heading
RBK-005 Finding
01
File Identity
✅ Compatibility wrapper
02
Registration Responsibility
✅ Registration → tree boundary
03
Script / File Loading
🔴 Requires createUserWithTree() before activation
04
Registration Entry Flow
⚠️ Indirectly connected
05
Function Inventory
✅ No local business function
06
Duplicate Function Audit
⚠️ Alias may overlap existing registration functions
07
Legacy Registration Path Audit
🔴 tree_system.js dependency must be verified
08
Input Collection
❌ None
09
Input Normalization
❌ None
10
Registration Validation
❌ Delegated
11
Duplicate Protection
❌ Delegated
12
Referral / Introducer Flow
⚠️ Delegated to tree engine
13
Sponsor / Placement Boundary
⚠️ Delegated to tree engine
14
Registration Queue
❌ Not responsible
15
Registration Approval
❌ Not responsible
16
User Creation
⚠️ Delegates to createUserWithTree()
17
Tree Creation / Placement
⚠️ Delegated
18
Authentication Integration
❌ None
19
Session Integration
❌ None
20
Account Status Lifecycle
❌ None
21
Security Protection
⚠️ Boundary only
22
Password Security
❌ No password handling
23
Storage Architecture
❌ No direct storage
24
Event Architecture
❌ No event system
25
Lock / Concurrency Protection
❌ None
26
Error Handling
⚠️ Console diagnostic only
27
Failure Recovery
❌ None
28
Registration Status Monitoring
❌ None
29
Redirect / Navigation
❌ None
30
UI / Controller Separation
✅ No UI
31
Cross-Module Dependencies
🔴 Critical
32
Dependency Direction
⚠️ Registration connector → tree engine
33
Global Namespace Audit
🔴 Creates global aliases
34
HTML Integration Audit
🔍 Load order must be verified
35
Registration Flow Integrity
⚠️ Depends entirely on tree engine
36
End-to-End Test Points
🔍 Required
37
Duplicate / Legacy Final Sweep
🔴 Required
38
Code Change Decision
⏳ HOLD
39
Change Safety Check
⏳ Required
40
Final Registration Stamp
⏳ Pending
41
Registration Module Index Update
⏳ After final stamp

3. FUNCTION / EXPORT INVENTORY
The file does not define a conventional registration function.
It creates or aliases the following global objects:
window.__REGISTRATION_TREE_ENGINE__
window.registerUserWithTree
window.__TREE_ENGINE_ACTIVE__
window.getTreeData

The most important alias is:
window.registerUserWithTree =
    window.createUserWithTree;


4. PRIMARY DEPENDENCY
The critical dependency is:
core_registration_tree_connector.js
        ↓
window.createUserWithTree
        ↓
Existing Tree Engine

The file explicitly expects:
createUserWithTree()

to already exist.
If it does not exist, the connector stops after logging an error.

5. LEGACY / EXTERNAL ENGINE CHECK
The file comment states:
Reuses tree_system.js implementation

Therefore tree_system.js must be treated as a mandatory dependency candidate.
It must be verified before this RBK can receive a final stamp.
Required check:
Does tree_system.js exist?
        ↓
Does it define createUserWithTree()?
        ↓
Is tree_system.js still authoritative?
        ↓
Is another tree engine already authoritative?
        ↓
Is this wrapper still required?

Current status: 🔴 Unresolved.

6. DUPLICATE BUSINESS LOGIC CHECK
Positive finding:
The wrapper does not duplicate tree-placement business logic.
It delegates:
createUserWithTree()

instead of implementing another tree creation algorithm.
This is architecturally preferable to maintaining two tree engines.
However, the alias:
registerUserWithTree

must be searched across the repository.
Required verification:
registerUserWithTree
        ↓
Where defined?
Where called?
How many definitions?
How many callers?
Legacy or active?


7. TREE DATA FALLBACK
The wrapper provides:
window.getTreeData

only when it does not already exist.
Fallback:
getTreeData()
    ↓
getUsers()
    ↓
return users

This is potentially significant.
A user list is not necessarily equivalent to actual tree data.
Therefore this fallback must not automatically be considered architecturally correct.
Required verification:
Actual tree data authority
        vs
getUsers()

Decision: HOLD.

8. REGISTRATION → TREE BOUNDARY
Current conceptual flow:
RBK-002
user_registration_controller.js
        ↓
RBK-004
core_registration_queue_manager.js
        ↓
createUserWithTree()
        ↓
RBK-005
core_registration_tree_connector.js
        ↓
Existing Tree Engine

However, the actual runtime direction must be confirmed because RBK-004 currently calls:
createUserWithTree(req)

directly.
This means RBK-005 may be acting as a bootstrap/compatibility layer, rather than the direct execution authority.
That distinction is important.

9. GLOBAL NAMESPACE AUDIT
The file intentionally writes into window.
Important globals:
__REGISTRATION_TREE_ENGINE__
registerUserWithTree
__TREE_ENGINE_ACTIVE__
getTreeData

Potential risks:
Existing global with same name
Legacy alias still active
Multiple tree engines
Hidden dependency on alias
Incorrect assumption that getTreeData() equals tree authority
No global names should be removed or renamed until repository-wide usage is confirmed.

10. SECURITY CHECK
No direct credential or password processing exists.
Positive:
No password handling
No authentication handling
No session handling
No direct financial operation

However, because this file exposes tree/user-related globals, its dependency authority must still be trusted.

11. ERROR HANDLING
Current failure handling:
createUserWithTree missing
        ↓
console.error()
        ↓
return

This is useful diagnostically but does not provide a registration failure contract to RBK-004.
Therefore the actual failure behavior depends on how RBK-004 handles the missing/failed tree engine.
This must be verified in the end-to-end flow.

12. CRITICAL DEPENDENCY CHAIN
RBK-005 must be checked together with:
RBK-004
    ↓
RBK-005
    ↓
RBK-006
    ↓
RBK-007
    ↓
RBK-008

Especially:
createUserWithTree()
getTreeData()
registerUserWithTree()


13. CODE CHANGE DECISION
DECISION: ❌ NO CODE CHANGE NOW
Reason:
RBK-005 is a compatibility wrapper.
Changing it before checking the actual tree authority could:
break registration
remove required compatibility
create duplicate tree logic
disconnect RBK-004
break legacy callers
create incorrect tree data behavior
Therefore the correct action is:
CHECK DEPENDENCIES FIRST
        ↓
CHECK TREE AUTHORITY
        ↓
CHECK CALLERS
        ↓
THEN DECIDE


14. REQUIRED NEXT CHECK
Next file:
RBK-006
core_tree_api_layer.js

This file must be checked before any decision is made regarding the registration-tree connector.
After RBK-006, the tree chain continues:
RBK-007
core_tree_management_engine.js

RBK-008
core_tree_placement_engine.js


15. RBK-005 CURRENT STAMP
RBK-005
core_registration_tree_connector.js

FUNCTION INVENTORY: COMPLETE
DIRECT BUSINESS LOGIC: NONE
TREE AUTHORITY: EXTERNAL
TREE DEPENDENCY: UNRESOLVED
LEGACY DEPENDENCY: UNRESOLVED
GLOBAL ALIASES: IDENTIFIED
DUPLICATE AUDIT: PENDING
FLOW AUDIT: PENDING
CODE CHANGE: NONE
FINAL STAMP: PENDING

STATUS: 🟡 HOLD


16. MASTER RULE
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

REGISTRATION PART 3
RBK-006 — core_tree_api_layer.js
Registration Module: REGISTRATION
 RBK Sequence: RBK-006
 File: core_tree_api_layer.js
 Role: Central Tree API Access Layer
 Check Status: 🟡 HOLD — TREE AUTHORITY / PLACEMENT DEPENDENCY CHECK REQUIRED
 Code Change: ❌ NONE
 Final Stamp: ⏳ Pending

1. FILE IDENTITY
core_tree_api_layer.js is a central read/access layer for tree information.
Its declared architecture is:
Tree Data
    ↓
Tree API Layer
    ↓
Authorized Tree Queries
    ↓
User / Admin Consumers

It does not directly create users or perform placement.

2. MASTER CHECKING HEADINGS
#
Master Checking Heading
RBK-006 Finding
01
File Identity
✅ Central tree API
02
Registration Responsibility
⚠️ Supporting dependency
03
Script / File Loading
🔴 Requires getUsers()
04
Registration Entry Flow
⚠️ Indirect
05
Function Inventory
✅ 6 functions/operations identified
06
Duplicate Function Audit
🔍 Required repository-wide
07
Legacy Registration Path Audit
🔴 Tree data authority must be verified
08
Input Collection
❌ None
09
Input Normalization
❌ None
10
Registration Validation
❌ None
11
Duplicate Protection
❌ None
12
Referral / Introducer Flow
⚠️ Supports tree lookup
13
Sponsor / Placement Boundary
⚠️ Read boundary only
14
Registration Queue
❌ None
15
Registration Approval
❌ None
16
User Creation
❌ None
17
Tree Creation / Placement
❌ Read-only API
18
Authentication Integration
❌ No direct authentication
19
Session Integration
❌ No direct session handling
20
Account Status Lifecycle
❌ None
21
Security Protection
⚠️ Role filtering present
22
Password Security
✅ No password handling
23
Storage Architecture
⚠️ Reads through getUsers()
24
Event Architecture
❌ None
25
Lock / Concurrency Protection
❌ None
26
Error Handling
⚠️ Safe empty/null fallbacks
27
Failure Recovery
❌ None
28
Registration Status Monitoring
❌ None
29
Redirect / Navigation
❌ None
30
UI / Controller Separation
✅ No UI logic
31
Cross-Module Dependencies
🔴 Significant
32
Dependency Direction
⚠️ Tree API → user storage
33
Global Namespace Audit
⚠️ Three public exports
34
HTML Integration Audit
🔍 Callers must be identified
35
Registration Flow Integrity
⚠️ Indirect dependency
36
End-to-End Test Points
🔍 Required
37
Duplicate / Legacy Final Sweep
🔍 Required
38
Code Change Decision
⏳ HOLD
39
Change Safety Check
⏳ Required
40
Final Registration Stamp
⏳ Pending
41
Registration Module Index Update
⏳ After final stamp

3. FUNCTION INVENTORY
The file contains the following primary operations:
getAllUsersSafe()
findUser(userId)
getTreeRoot(userId)
getLevelUsers(userId, level)
getUserTreeByRole(userId, role)
getTreeSummary(userId)

Public exports:
window.getLevelUsers
window.getUserTreeByRole
window.getTreeSummary


4. PRIMARY STORAGE DEPENDENCY
The central dependency is:
core_tree_api_layer.js
        ↓
getUsers()
        ↓
User Data Store

The file does not own the user repository.
It assumes getUsers() already exists.
Therefore the actual storage authority must be verified.

5. REGISTRATION FLOW RELATIONSHIP
RBK-006 is not the direct registration execution authority.
Current relationship:
RBK-002
Registration Controller
        ↓
RBK-004
Registration Queue
        ↓
RBK-005
Tree Connector
        ↓
Tree Creation Authority
        ↓
User Storage
        ↑
RBK-006
Tree API Layer

This distinction is important:
RBK-005 = Registration → Tree execution boundary
RBK-006 = Tree data access/query boundary

They must not accidentally become duplicate authorities.

6. TREE ROOT CHECK
Current:
getTreeRoot(userId)

returns:
findUser(userId)

This means the tree root is represented by the user record itself.
Required verification:
User record
    vs
Actual tree root authority

If the tree engine maintains separate tree metadata, this function may not represent the complete tree root.
Status: 🔍 Pending dependency verification.

7. LEVEL QUERY
getLevelUsers() performs breadth-first traversal.
Conceptually:
Root
 ↓
Level 1
 ↓
Level 2
 ↓
Level N

It follows:
leftChild
rightChild

and uses a visited set.
Positive findings:
BFS traversal
Level control
Cycle protection through visited
Missing-user protection

8. ROLE-BASED TREE VIEW
getUserTreeByRole() provides different depth limits:
user       → depth 30
admin      → depth 100
super_admin → unlimited

Important architectural concern:
These are application-level depth restrictions, not a complete authorization system.
The function accepts:
role

directly as an argument.
Therefore the caller could potentially supply a role value unless another authority validates it.
Required verification:
Caller
 ↓
Actual authenticated role
 ↓
Access Control Authority
 ↓
Tree API

This must be compared with RBK-016.
No modification yet.

9. SPONSOR / INTRODUCER BOUNDARY
The file traverses:
leftChild
rightChild

It does not explicitly distinguish:
Introducer Tree
Sponsor Tree
Placement Tree

Because the project architecture requires a clear distinction between visible introducer relationships and placement/sponsor relationships, this must be verified against:
RBK-005
RBK-007
RBK-008
The API must not accidentally expose the wrong tree relationship.
Status: 🔴 Dependency check required.

10. TREE SUMMARY
getTreeSummary() calculates:
totalNodes
leftNodes
rightNodes

It uses the same:
leftChild
rightChild

structure.
Positive finding:
visited Set

helps prevent infinite traversal from cyclic data.
However, this is still dependent on the correctness of the underlying tree structure.

11. SECURITY CHECK
No password or credential processing exists.
Positive:
No password access
No credential storage
No session creation
No financial execution

Potential issue:
role

is supplied directly to getUserTreeByRole().
Therefore authorization authority must remain outside this API.
Required dependency:
RBK-016
core_access_control_guard.js


12. STORAGE ARCHITECTURE
The API directly depends on:
getUsers()

This means its actual data source is inherited.
Required verification:
Where is getUsers() defined?
        ↓
Is it the authoritative user repository?
        ↓
Does tree creation update the same repository?
        ↓
Does tree API read the same structure?

This is especially important because RBK-004 verifies created users using getUsers().

13. GLOBAL NAMESPACE AUDIT
Public global functions:
window.getLevelUsers
window.getUserTreeByRole
window.getTreeSummary

Required repository-wide search:
getLevelUsers
getUserTreeByRole
getTreeSummary

Check:
Duplicate definitions
Duplicate exports
Legacy implementations
UI callers
Admin callers
User callers
Platform callers
No export should be removed until all callers are confirmed.

14. DUPLICATE / LEGACY CHECK
The file claims:
Single tree access layer

That claim must be verified against the repository.
Search required for:
getLevelUsers
getUserTreeByRole
getTreeSummary
getTreeRoot
findUser
leftChild
rightChild

Also verify whether older tree APIs exist inside:
tree_system.js
core_tree_management_engine.js
core_tree_placement_engine.js
user_tree.js

or other modules.

15. CROSS-MODULE DEPENDENCY MAP
RBK-005
Tree Connector
      ↓
Tree Engine
      ↓
User / Tree Storage
      ↑
RBK-006
Tree API
      ↓
User / Admin / Platform Consumers

Security boundary:
Authentication
      ↓
Session Authority
      ↓
Access Control
      ↓
Tree API

Relevant future check:
RBK-015
core_session_authority.js

RBK-016
core_access_control_guard.js


16. CODE CHANGE DECISION
DECISION: ❌ NO CODE CHANGE
Reasons:
Actual getUsers() authority is not yet confirmed.
Actual tree storage model is not yet confirmed.
tree_system.js dependency from RBK-005 remains unresolved.
Tree management and placement files have not yet been checked.
Role authorization must be compared with RBK-016.
Duplicate/legacy tree API implementations have not yet been audited.
Introducer vs placement tree boundaries require verification.

17. REQUIRED NEXT CHECK
Next:
RBK-007
core_tree_management_engine.js

Then:
RBK-008
core_tree_placement_engine.js

These two files are critical because RBK-006 reads the tree structure that they may create or maintain.

18. RBK-006 CURRENT STAMP
RBK-006
core_tree_api_layer.js

FILE IDENTITY: CHECKED
FUNCTION INVENTORY: COMPLETE
STORAGE AUTHORITY: UNRESOLVED
TREE AUTHORITY: UNRESOLVED
PLACEMENT RELATIONSHIP: UNRESOLVED
ROLE SECURITY: DEPENDENCY CHECK REQUIRED
DUPLICATE AUDIT: PENDING
LEGACY AUDIT: PENDING
FLOW AUDIT: PENDING
CODE CHANGE: NONE
FINAL STAMP: PENDING

STATUS: 🟡 HOLD


19. MASTER RULE
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

RBK-006 remains unchanged until RBK-007 and RBK-008 establish the actual tree-management and placement authority.

