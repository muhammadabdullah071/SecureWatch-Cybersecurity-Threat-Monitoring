# SecureWatch - Phase 3: Database Verification

> **Status:** Complete ✅
> **Schema Version:** v1.1 (with fixes)

---

## Entity Relationship Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SECUREWATCH DATABASE                           │
│                              PostgreSQL 16                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────┐
│         User          │
│───────────────────────│
│ PK  id: UUID          │──┐
│     email: String  🔑  │  │ 1
│     password: String   │  │
│     firstName: String  │  │
│     lastName: String   │  │
│     role: Role(enum)   │  │
│     isActive: Bool     │  │
│     lastLogin: DateTime│  │
│     resetToken: String?│  │
│     resetTokenExp: Date│  │
│     createdAt: DateTime│  │
│     updatedAt: DateTime│  │
└───────────────────────┘  │
     │    │    │    │      │
     │    │    │    │      │
     │1   │1   │1   │1     │
     │    │    │    │      │
     ▼N   ▼N   ▼N   ▼N     │
┌──────────┐ ┌──────────┐  │
│ Session  │ │Notificat.│  │
│──────────│ │──────────│  │
│PK id     │ │PK id     │  │
│FK userId │ │FK userId │  │
│refreshTok│ │title     │  │
│expiresAt │ │message   │  │
│          │ │type      │  │
└──────────┘ │read      │  │
             │link?     │  │
┌──────────┐ └──────────┘  │
│ AuditLog │               │
│──────────│  ┌───────────────────────┐
│PK id     │  │        Threat         │
│FK userId │  │───────────────────────│
│userEmail │  │ PK  id: UUID          │
│action    │◄─│ FK assignedToId: UUID?│──┘
│entity    │  │     title: String      │
│entityId? │  │     sourceIP: String   │
│createdAt │  │     attackType: String │
└──────────┘  │     severity: Sev(enum)│
              │     status: TS(enum)   │
┌───────────────────┐  │     createdAt      │
│   ThreatFeed      │  └───────────────────────┘
│───────────────────│           │1
│ PK  id: UUID      │           │
│      type: String │           │N
│      value: String│  ┌───────────────────────┐
│      riskScore:Int│  │       Incident        │
│      isActive:Bool│  │───────────────────────│
└───────────────────┘  │ PK  id: UUID          │
                       │ FK threatId: UUID?    │
                       │ FK assignedToId: UUID?│
                       │ FK createdById: UUID  │
                       │     title: String      │
                       │     priority: IP(enum) │
                       │     status: IS(enum)   │
                       │     createdAt: DateTime│
                       └───────────────────────┘
```

---

## Model Analysis

### User
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, default uuid() | |
| email | String | UNIQUE, indexed | |
| password | String | Required | bcrypt hashed |
| firstName | String | Required | |
| lastName | String | Required | |
| role | Role enum | Default: VIEWER | ADMIN, ANALYST, VIEWER |
| isActive | Boolean | Default: true | Soft delete flag |
| resetToken | String? | Nullable | Password reset |
| resetTokenExpiresAt | DateTime? | Nullable | Token TTL |
| lastLogin | DateTime? | Nullable | |
| createdAt | DateTime | Auto | |
| updatedAt | DateTime | Auto | |

### Session
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User, CASCADE | |
| refreshToken | String | UNIQUE, indexed | JWT refresh |
| expiresAt | DateTime | Required | Session TTL |
| userAgent | String? | | Device info |
| ipAddress | String? | | |

### Threat
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| title | String | Required | |
| description | String | Required | |
| sourceIP | String | Indexed | |
| destinationIP | String? | | |
| attackType | String | Indexed | |
| severity | Severity enum | Default: MEDIUM | Indexed |
| status | ThreatStatus enum | Default: NEW | Indexed |
| assignedToId | UUID? | FK → User, SET NULL | |
| assignedAnalyst | String? | Denormalized | Display name |

### Incident
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| title | String | Required | |
| description | String | Required | |
| priority | IncidentPriority enum | Default: MEDIUM | |
| status | IncidentStatus enum | Default: OPEN | |
| threatId | UUID? | FK → Threat, SET NULL | |
| assignedToId | UUID? | FK → User, SET NULL | |
| createdById | UUID | FK → User, RESTRICT | |
| notes | String? | | |
| closedAt | DateTime? | | |

### Notification
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User, CASCADE | |
| title | String | Required | |
| message | String | Required | |
| type | String | Default: "info" | |
| read | Boolean | Default: false | |
| link | String? | | |
| createdAt | DateTime | Auto | |

### AuditLog
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User, CASCADE | |
| userEmail | String | Denormalized | For display after user deletion |
| action | String | Indexed | |
| entity | String | Indexed | |
| entityId | String? | | |
| details | String? | JSON string | |
| ipAddress | String? | | |

### ThreatFeed
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| type | String | Default: "ip" | ip, domain, country |
| value | String | UNIQUE with type | |
| riskScore | Int | Default: 50 | 0-100 |
| isActive | Boolean | Default: true | |
| source | String | Default: "internal" | |

---

## Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| User | email | UNIQUE | Fast login lookup |
| User | role | B-tree | Role filtering |
| Session | userId | B-tree | User sessions lookup |
| Session | refreshToken | UNIQUE | Token validation |
| Threat | severity | B-tree | Filter by severity |
| Threat | status | B-tree | Filter by status |
| Threat | attackType | B-tree | Attack type queries |
| Threat | sourceIP | B-tree | IP lookup |
| Threat | createdAt | B-tree | Time-range queries |
| Incident | priority | B-tree | Priority filtering |
| Incident | status | B-tree | Status filtering |
| Incident | createdAt | B-tree | Time-range queries |
| Notification | (userId, read) | Composite | User unread count |
| Notification | createdAt | B-tree | Time sorting |
| AuditLog | userId | B-tree | User audit trail |
| AuditLog | action | B-tree | Action filtering |
| AuditLog | entity | B-tree | Entity filtering |
| AuditLog | createdAt | B-tree | Time-range queries |
| ThreatFeed | (type, value) | UNIQUE composite | No duplicate feeds |
| ThreatFeed | type | B-tree | Type filtering |
| ThreatFeed | riskScore | B-tree | Risk-based queries |

---

## Cascade Rules

| Action | Parent Delete → Child | Rule |
|--------|----------------------|------|
| Delete User | Session | CASCADE (delete sessions) |
| Delete User | Notification | CASCADE (delete notifications) |
| Delete User | AuditLog | CASCADE (delete audit logs) |
| Delete User | Threat (assigned) | SET NULL (unassign threats) |
| Delete User | Incident (assigned) | SET NULL (unassign incidents) |
| Delete User | Incident (created) | RESTRICT (prevent deletion) |
| Delete Threat | Incident | SET NULL (unlink incidents) |

---

## Schema Changes Made During Audit

| Change | Rationale |
|--------|-----------|
| Added `resetToken` + `resetTokenExpiresAt` to User | Required for functional password reset flow |
| Added `onDelete: SetNull` to Threat.assignedTo | Prevent FK errors when user is deleted |
| Added `onDelete: SetNull` to Incident.assignedTo | Prevent FK errors when user is deleted |
| Added `onDelete: SetNull` to Incident.threatId | Prevent FK errors when threat is deleted |

---

*Phase 3 complete. Proceeding to Phase 4.*
