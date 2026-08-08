USER_LAYER_06_USER_NETWORK_MANAGEMENT.md
USER LAYER 06 — USER NETWORK MANAGEMENT ARCHITECTURE
Document Name: USER_LAYER_06_USER_NETWORK_MANAGEMENT.md
 Documentation Type: User Architecture — Network Management
 Subsystem: USER
 Layer: 06
 Location: docs/architecture/USER/USER_LAYER_06_USER_NETWORK_MANAGEMENT.md
 Status: ✅ Architecture Defined
 Version: 1.0
 Owner: BestWayGrow Project

1. PURPOSE
The User Network Management layer defines the architecture responsible for User network relationships, hierarchy visibility, team representation, referral relationships, and network-derived User information.
This layer provides the structural foundation for:
User network
Sponsor relationships
Introducer relationships
Team visibility
Downline representation
Network traversal
Referral relationships
Network statistics
Network-based service integration
Network event coordination
The layer must maintain a strict separation between network placement logic and network visibility/income relationships.

2. ARCHITECTURAL POSITION
The User Network Management layer operates after User identity and account resolution.
USER SUBSYSTEM
      │
      ▼
AUTHENTICATION
      │
      ▼
ACCOUNT MANAGEMENT
      │
      ▼
NETWORK MANAGEMENT
      │
      ├── Sponsor Relationship
      ├── Introducer Relationship
      ├── Network Tree
      ├── Team
      ├── Referral
      └── Network Statistics
      │
      ▼
USER BUSINESS SERVICES


3. NETWORK ARCHITECTURAL PRINCIPLE
The User network consists of multiple relationship models.
The two most important relationship structures are:
SPONSOR TREE

and
INTRODUCER TREE

They must not be treated as interchangeable.

4. SPONSOR TREE
The Sponsor Tree is the structural placement hierarchy.
Its primary purpose is:
Placement
Network Position
Leg Structure
Tree Calculation
Qualification Support

The Sponsor Tree is not the primary User-facing income/display hierarchy.
Architectural model:
Sponsor
   │
   ├── Placement
   │
   ├── Direct Legs
   │
   └── Downline Structure


5. INTRODUCER TREE
The Introducer Tree represents the relationship between the User and the person who introduced/referred the User.
Its primary purpose is:
Referral Relationship
User Visibility
Income Relationship
Team Display
Referral Reporting

Architectural model:
Introducer
    │
    ├── Direct Introduced Users
    │
    └── Referral Network


6. CRITICAL TREE SEPARATION
The architecture requires:
SPONSOR TREE
      =
PLACEMENT LOGIC

while:
INTRODUCER TREE
      =
VISIBLE USER / INCOME RELATIONSHIP

Therefore:
Sponsor Tree
     │
     └── Invisible structural placement

Introducer Tree
     │
     └── Visible relationship / income tree

This separation must be preserved throughout future implementation.

7. USER NETWORK IDENTITY
Every network relationship must resolve against the authoritative User identity.
Primary identity:
userId

Potential relationship fields include:
sponsorId
introducerId
parentId
placementPosition
leg

The actual repository schema remains authoritative.
Architecture must not introduce duplicate relationship identifiers without explicit design approval.

8. NETWORK RELATIONSHIP MODEL
A User may have:
User
 │
 ├── Sponsor
 │
 ├── Introducer
 │
 ├── Placement Parent
 │
 ├── Direct Team
 │
 └── Downline

These relationships may overlap in some cases but must remain logically independent.

9. NETWORK TREE MODEL
The network can be represented as:
ROOT USER
   │
   ├── USER A
   │     ├── USER C
   │     └── USER D
   │
   └── USER B
         ├── USER E
         └── USER F

The exact visual structure depends on the relationship being requested.
The system must not automatically assume that every tree request means the Sponsor Tree.

10. NETWORK VIEW REQUEST
A User-facing network request should explicitly determine the intended relationship.
Conceptually:
REQUEST
  │
  ├── Introducer Tree
  │
  └── Sponsor/Placement Structure

For normal User income/team display:
Introducer Tree

is the preferred visible relationship.

11. USER TREE UI RELATIONSHIP
The repository contains User tree components such as:
user_tree.html
user_tree.js
user_tree.css

These represent the User-facing network presentation layer.
Architecture:
Network Data
      ↓
Network Resolver
      ↓
Tree Structure
      ↓
User Tree Controller
      ↓
user_tree.html

The UI must not independently reconstruct authoritative network relationships if a central network service is available.

12. NETWORK RESOLUTION
Network resolution should follow:
Authenticated User
       ↓
Resolve User ID
       ↓
Select Relationship Type
       ↓
Resolve Network
       ↓
Build Tree
       ↓
Apply Visibility Rules
       ↓
Return Network Data


13. NETWORK VISIBILITY
The User should only receive network information that they are authorized to view.
Visibility must consider:
Current User
Relationship
Network Scope
Account Status
Privacy Rules
Administrative Rules

The system should not expose arbitrary users or unrelated network branches.

14. USER-OWNED NETWORK SCOPE
A User's normal network scope is:
Current User
      +
Authorized Downline

The User should not be able to modify:
Sponsor
Introducer
Placement
Other User relationships

through normal User-facing interfaces unless explicitly permitted by a controlled workflow.

15. SPONSOR PLACEMENT LOGIC
Sponsor placement may involve:
Sponsor
   ↓
Placement Rules
   ↓
Available Leg
   ↓
Placement Position
   ↓
Network Assignment

Placement rules belong to the appropriate network/placement authority.
User UI should not independently determine final placement.

16. DIRECT LEG MODEL
A Sponsor may have multiple direct placement legs.
Conceptually:
SPONSOR
 ├── LEG 1
 ├── LEG 2
 ├── LEG 3
 ├── LEG 4
 └── ...

The exact number and qualification requirements are controlled by the applicable business rules.
The network architecture provides the structural representation.

17. INTRODUCER RELATIONSHIP
The Introducer relationship should remain stable after User creation unless a formally authorized correction workflow exists.
Conceptually:
Introducer
     │
     ▼
New User

The relationship may be used by:
Income
Referral
Team
Notifications
Reporting
Qualification


18. NETWORK AND INCOME
Network structure may provide relationship data to income services.
However:
NETWORK
≠
INCOME ENGINE

The Network layer provides:
Who is related to whom?

The Income system determines:
What income is generated?

This separation prevents duplication of financial business logic.

19. NETWORK AND CTOR
Network structure may support CTOR qualification.
For example:
Network
   ↓
Direct Legs
   ↓
Upgrade Activity
   ↓
Qualification Engine

The Network layer provides structural facts.
The CTOR engine remains responsible for qualification calculations.

20. NETWORK AND RANK
Rank calculation may consume network-derived information.
Architecture:
Network
   ↓
Network Statistics
   ↓
Rank Engine
   ↓
Rank Result

The Network layer should not independently calculate final rank unless explicitly designated as the rank authority.

21. NETWORK AND PIN
PIN activity may contribute to network activity.
Relationship:
User
 ↓
PIN
 ↓
User Activity
 ↓
Network Statistics

PIN ownership and PIN lifecycle remain under the PIN subsystem.

22. NETWORK AND UPGRADE
Upgrade activity may affect network-derived metrics.
Architecture:
Upgrade Engine
      ↓
Upgrade Event
      ↓
Network Event / Statistics
      ↓
Rank / Qualification / Reporting

The Network layer should consume authoritative events rather than duplicate upgrade processing.

23. NETWORK DATA SOURCE
Current repository network data may be derived from User records.
Possible fields:
userId
sponsorId
introducerId
placement data
status

Repository implementations remain the source of truth for the current data model.
Future architecture may centralize this through:
user_network_service.js

and:
user_network_repository.js


24. NETWORK STORAGE
Network relationship data must remain persistent and consistent.
Potential storage model:
USER RECORD
 │
 ├── userId
 ├── sponsorId
 ├── introducerId
 └── placement metadata

A future normalized relationship repository may provide:
Network Relationship
 ├── relationshipId
 ├── userId
 ├── relatedUserId
 ├── relationshipType
 ├── createdAt
 └── status

This is a future architectural option, not a claim about the current repository implementation.

25. NETWORK CONSISTENCY
Network relationships are foundational data.
Therefore:
User A → User B

must be consistent across:
Registration
Network
Income
Rank
Qualification
Tree
Reporting
Audit

A relationship correction must propagate safely to all dependent services where applicable.

26. NETWORK VALIDATION
Network validation should include:
User Validation
User exists
User ID valid
Account eligible

Relationship Validation
Sponsor exists
Introducer exists
No invalid self-reference
No unauthorized relationship change

Tree Validation
No unintended circular relationship
Valid parent relationship
Valid placement position


27. CIRCULAR RELATIONSHIP PROTECTION
The system must prevent invalid structures such as:
A
 ↓
B
 ↓
C
 ↓
A

Network traversal must detect and reject circular structures.
This is essential for:
Tree rendering
Qualification
Reporting
Rank
Income
Network statistics

28. DUPLICATE RELATIONSHIP PROTECTION
The network system should prevent unintended duplicate relationships.
Examples:
Duplicate placement
Duplicate introducer assignment
Duplicate direct relationship
Duplicate network node

Where historical corrections are required, they should be recorded as controlled events rather than silently overwritten.

29. NETWORK STATUS
Network membership should respect User account state.
Example:
ACTIVE USER
     ↓
Normal Network Visibility

SUSPENDED USER
     ↓
Restricted according to business rules

BLOCKED USER
     ↓
Restricted Network Access

The exact visibility policy belongs to the security/governance layer.

30. NETWORK SECURITY
Network information can expose sensitive business relationships.
Therefore the system must protect:
User IDs
Sponsor relationships
Introducer relationships
Team structure
Network statistics
Private account information

A User should not be able to retrieve arbitrary network branches by manipulating browser parameters.

31. CLIENT-SIDE SECURITY LIMITATION
UI-level filtering is not sufficient security.
For example:
?userId=OTHER_USER

must not automatically grant access.
The authoritative service must verify:
Authenticated User
       ↓
Requested User
       ↓
Authorized Network Scope


32. NETWORK TRAVERSAL
Network traversal should use controlled functions/services.
Conceptual functions:
getIntroducerTree(userId)
getSponsorTree(userId)
getDirectTeam(userId)
getDownline(userId)
getNetworkStats(userId)

These are architectural service concepts.
They should map to actual repository functions when implemented.

33. NETWORK STATISTICS
The Network layer may expose structural statistics such as:
Direct Users
Total Downline
Active Users
Active Legs
Network Depth
Team Size

These statistics should be calculated from authoritative network data.
Financial values should come from financial authorities.

34. NETWORK EVENTS
Network-related events may include:
USER_NETWORK_CREATED
USER_PLACED
USER_INTRODUCED
NETWORK_RELATIONSHIP_UPDATED
NETWORK_RELATIONSHIP_CORRECTED
USER_NETWORK_STATUS_CHANGED

The centralized Event Architecture should handle propagation.

35. NETWORK AUDIT
Important relationship changes must be auditable.
Examples:
Sponsor Assigned
Introducer Assigned
Placement Completed
Relationship Corrected
Relationship Removed
Network Status Changed

Audit information should identify:
Who
Whom
Relationship
Action
Previous State
New State
Timestamp
Authority


36. ADMINISTRATIVE RELATIONSHIP
Network governance may require administrative intervention.
Architecture:
SUPER ADMIN
     ↓
SYSTEM ADMIN
     ↓
AUTHORIZED ADMIN
     ↓
NETWORK GOVERNANCE

Normal User operations remain limited to viewing their authorized network.
Administrative network correction must use controlled authority.

37. USER NETWORK SERVICE
Future centralized service:
user_network_service.js

Potential responsibilities:
resolveSponsor()
resolveIntroducer()
getNetworkTree()
getDirectTeam()
getDownline()
validateRelationship()
getNetworkStatistics()

The service should become the central orchestration layer for network operations.

38. NETWORK REPOSITORY
Future persistence boundary:
user_network_repository.js

Potential responsibilities:
read relationship
create relationship
validate relationship
update controlled relationship
query network

Business rules should remain outside the raw repository layer.

39. UI SERVICE SEPARATION
The User tree UI should follow:
HTML
 ↓
Controller
 ↓
Network Service
 ↓
Network Repository
 ↓
Storage

Not:
HTML
 ↓
Direct Storage

This separation protects the network authority.

40. NETWORK FAILURE HANDLING
If network resolution fails:
Network unavailable
       ↓
Safe error state
       ↓
No fabricated network
       ↓
No destructive account change

The system must never display fabricated relationships as authoritative network data.

41. NETWORK PERFORMANCE
Large network trees may require controlled traversal.
Future optimization may include:
Pagination
Lazy loading
Depth limits
Caching
Indexed relationships
Server-side traversal

Optimization must not change the underlying relationship truth.

42. NETWORK PRIVACY
User network visibility should follow the principle:
Minimum Necessary Visibility

A User should receive only the information required for their authorized network experience.
Private fields such as:
KYC documents
private contact data
financial details
security information

must not automatically become visible merely because a User is in the same network.

43. NETWORK AND NOTIFICATIONS
Network events may trigger notifications.
Example:
New Referral
     ↓
Network Event
     ↓
Notification Service
     ↓
User Notification

The Network layer should publish the event but should not become the notification authority.

44. NETWORK AND REPORTING
Reporting services may consume network structure.
Network
   ↓
Reporting
   ↓
Team Reports
   ↓
Management Analytics

Network reporting must use authoritative relationship data.

45. NETWORK IMPLEMENTATION RULE
The implementation must preserve:
ONE USER IDENTITY
        +
ONE AUTHORITATIVE RELATIONSHIP MODEL
        +
EXPLICIT RELATIONSHIP TYPE
        +
CONTROLLED TRAVERSAL
        +
AUTHORIZED VISIBILITY


46. CURRENT REPOSITORY ALIGNMENT
Known User repository network components include:
user_tree.html
user_tree.js
user_tree.css

These provide the current User-facing tree presentation.
The architectural responsibility remains:
Network Data
      ↓
Tree Resolution
      ↓
User Tree Presentation

Future centralization should not break existing User tree functionality.

47. ARCHITECTURAL ANTI-PATTERNS
The following patterns must be avoided:
Anti-Pattern 1
UI directly modifies sponsorId

Anti-Pattern 2
Income engine independently rebuilds network

Anti-Pattern 3
Rank engine creates separate network truth

Anti-Pattern 4
User can request arbitrary userId and retrieve network

Anti-Pattern 5
Sponsor Tree treated as User income tree

Anti-Pattern 6
Introducer relationship silently changed


48. NETWORK GOVERNANCE RULE
The Network layer is a structural authority, but it does not own every business rule derived from the network.
Ownership:
NETWORK
→ Relationship

INCOME
→ Income Calculation

RANK
→ Rank Calculation

CTOR
→ Qualification

PIN
→ PIN Lifecycle

UPGRADE
→ Upgrade Lifecycle

WALLET
→ Financial Balance

AUDIT
→ Audit Record

This separation is mandatory for maintainability.

49. FINAL NETWORK ARCHITECTURE
┌─────────────────────────────────────────┐
│          USER ACCOUNT MANAGEMENT         │
└───────────────────┬─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        USER NETWORK MANAGEMENT           │
│                                         │
│  User Identity                          │
│  Sponsor Relationship                   │
│  Introducer Relationship                │
│  Placement                              │
│  Direct Team                            │
│  Downline                               │
│  Network Statistics                     │
└───────────────┬───────────────┬─────────┘
                │               │
                ▼               ▼
        SPONSOR TREE       INTRODUCER TREE
        Placement          Visible Relationship
        Structure          Income / Team
                │               │
                └───────┬───────┘
                        ▼
              NETWORK SERVICES
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
        Rank          CTOR          Income
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                 User Presentation
                        │
                        ▼
                 user_tree.html


50. LAYER 06 STATUS
Architecture Status: ✅ Defined
 Network Identity: ✅ Defined
 Sponsor Tree: ✅ Defined
 Introducer Tree: ✅ Defined
 Placement Boundary: ✅ Defined
 Visibility Boundary: ✅ Defined
 Security Boundary: ✅ Defined
 Income Separation: ✅ Defined
 Rank/CTOR Separation: ✅ Defined
 Future Service Path: ✅ Defined

51. REMARKS
The User Network Management layer is the authoritative architectural boundary for User relationship structure.
The most important permanent rule is:
SPONSOR TREE
=
PLACEMENT / STRUCTURAL LOGIC

INTRODUCER TREE
=
VISIBLE USER / INCOME / TEAM RELATIONSHIP

Future User implementation must preserve this distinction.
Network relationship data must remain consistent across User, Income, Rank, CTOR, PIN, Upgrade, Reporting, Event, and Audit services without allowing those services to create competing network authorities.
Next architectural layer:
 USER_LAYER_07_USER_PIN_MANAGEMENT.md
