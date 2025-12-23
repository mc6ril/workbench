# Architecture Flowcharts

This document contains Mermaid diagrams representing the application architecture, user flows, and system interactions.

## Authentication and Authorization

**Important**: All features require user authentication and project membership:

- **Authentication**: Users must be authenticated via Supabase Auth to access any feature
- **Project Membership**: Users must be members of a project to view or interact with it
- **Permissions**:
  - **View access**: All project members (admin, member, viewer) can view project data
  - **Edit access**: Only users with `admin` or `member` roles can create, update, or delete data
  - **Admin access**: Only users with `admin` role can delete projects or manage project members

See `docs/row-level-security.md` for detailed information about RLS policies and permissions.

## 1. Global Sitemap

```mermaid
flowchart TD
   R[ROOT] --> H[Home Dashboard]
   R --> BL[Backlog]
   R --> BD[Board]
   R --> EP[Epics]
   R --> TK[Ticket Detail]
   R --> SE[Settings]

   H --> H1[Quick Add Ticket]
   H --> H2[My Work]
   H --> H3[Recent Activity]
   H --> H4[Shortcuts]

   BL --> BL1[Ticket List]
   BL --> BL2[Filters and Search]
   BL --> BL3[Sort]
   BL --> BL4[Bulk Actions]
   BL --> BL5[Create Ticket]

   BD --> BD1[Board View]
   BD --> BD2[Columns Config]
   BD --> BD3[Drag and Drop]
   BD --> BD4[Swimlanes Optional]
   BD --> BD5[Board Filters]

   EP --> EP1[Epics List]
   EP --> EP2[Create Epic]
   EP --> EP3[Epic Detail]
   EP3 --> EP31[Epic Tickets]
   EP3 --> EP32[Epic Progress]

   TK --> TK1[Overview]
   TK --> TK2[Edit Fields]
   TK --> TK3[Comments Optional]
   TK --> TK4[Subtasks]
   TK --> TK5[Link to Epic]
   TK --> TK6[History Optional]

   SE --> SE1[Project Settings]
   SE --> SE2[Statuses and Columns]
   SE --> SE3[Priorities]
   SE --> SE4[Labels Optional]
   SE --> SE5[Export and Import]
   SE --> SE6[Theme Optional]
```

## 2. Complete End-to-End User Flow

```mermaid
stateDiagram-v2
   [*] --> Authenticate
   Authenticate --> Home : authenticated & project member
   
   Home --> Backlog : has view access
   Home --> Board : has view access
   Home --> Epics : has view access
   Home --> Settings : has view access

   Backlog --> CreateTicket : add ticket (if admin/member)
   CreateTicket --> Backlog : saved

   Backlog --> TicketDetail : open ticket
   Board --> TicketDetail : open ticket card
   Epics --> TicketDetail : open ticket from epic

   TicketDetail --> EditTicket : edit fields (if admin/member)
   EditTicket --> TicketDetail : saved

   TicketDetail --> CreateSubtask : add subtask (if admin/member)
   CreateSubtask --> TicketDetail : saved

   TicketDetail --> LinkEpic : assign epic (if admin/member)
   LinkEpic --> TicketDetail : saved

   Backlog --> Board : send to board
   Board --> MoveTicket : drag card (if admin/member)
   MoveTicket --> Board : status and position updated

   Settings --> ConfigureColumns : edit columns (if admin/member)
   ConfigureColumns --> Board : board updated

   Epics --> CreateEpic : add epic (if admin/member)
   CreateEpic --> Epics : saved
   Epics --> EpicDetail : open epic
   EpicDetail --> TicketDetail : open linked ticket

   TicketDetail --> [*]
```

**Access Control Notes:**
- All users must be authenticated to access any feature
- Users must be project members to view project data
- Only users with `admin` or `member` roles can create, update, or delete data
- Only users with `admin` role can delete projects or manage project members

## 3. Domain and Use Cases (Clean Architecture Map)

This diagram serves as a "build plan": each node represents a building block.

```mermaid
flowchart LR
   subgraph AUTH[Authentication & Authorization]
      A1[Supabase Auth]
      A2[RLS Policies]
      A3[Project Membership]
   end

   subgraph UI[UI Pages]
      UI1[Backlog Page]
      UI2[Board Page]
      UI3[Epics Page]
      UI4[Ticket Detail Page]
      UI5[Settings Page]
   end

   subgraph APP[Application Use Cases]
      UC1[Create Ticket]
      UC2[Update Ticket]
      UC3[Delete Ticket]
      UC4[List Tickets]
      UC5[Create Epic]
      UC6[Assign Ticket to Epic]
      UC7[Create Subtask]
      UC8[Move Ticket]
      UC9[Reorder Ticket]
      UC10[Configure Columns]
      UC11[List Epics]
      UC12[Get Ticket Detail]
   end

   subgraph DOM[Domain Entities]
      D1[Ticket]
      D2[Epic]
      D3[Board]
      D4[Column]
      D5[Project]
      D6[Project Member]
   end

   subgraph PORTS[Ports]
      P1[Ticket Repository]
      P2[Epic Repository]
      P3[Board Repository]
      P4[Project Repository]
      P5[Event Store Optional]
   end

   subgraph INFRA[Infrastructure]
      I1[DB Ticket Repo]
      I2[DB Epic Repo]
      I3[DB Board Repo]
      I4[DB Project Repo]
      I5[Migration Tool]
      I6[RLS Policies]
   end

   A1 --> UI1
   A1 --> UI2
   A1 --> UI3
   A1 --> UI4
   A1 --> UI5
   A3 --> A2

   UI1 --> UC1
   UI1 --> UC4
   UI1 --> UC12
   UI1 --> UC2
   UI1 --> UC3

   UI2 --> UC8
   UI2 --> UC9
   UI2 --> UC10
   UI2 --> UC4
   UI2 --> UC12

   UI3 --> UC5
   UI3 --> UC11
   UI3 --> UC6

   UI4 --> UC12
   UI4 --> UC2
   UI4 --> UC6
   UI4 --> UC7

   UI5 --> UC10

   UC1 --> D1
   UC2 --> D1
   UC3 --> D1
   UC4 --> D1
   UC12 --> D1
   UC5 --> D2
   UC11 --> D2
   UC6 --> D1
   UC6 --> D2
   UC7 --> D1
   UC8 --> D1
   UC8 --> D3
   UC9 --> D1
   UC10 --> D3
   UC10 --> D4

   UC1 --> P1
   UC2 --> P1
   UC3 --> P1
   UC4 --> P1
   UC12 --> P1
   UC5 --> P2
   UC11 --> P2
   UC6 --> P1
   UC6 --> P2
   UC8 --> P1
   UC9 --> P1
   UC10 --> P3

   P1 --> I1
   P2 --> I2
   P3 --> I3
   P4 --> I4
   I5 --> I1
   I5 --> I2
   I5 --> I3
   I5 --> I4
   I6 --> I1
   I6 --> I2
   I6 --> I3
   I6 --> I4

   A2 --> I6
```

**Security Layer Notes:**
- All UI interactions require authentication (Supabase Auth)
- RLS policies enforce project membership and role-based permissions at database level
- Project membership is checked before any data access
- Edit operations require admin or member role (enforced by RLS)

## 4. Detailed Drag and Drop Flow (Board)

```mermaid
sequenceDiagram
   autonumber
   participant U as User (authenticated & member)
   participant UI as Board UI
   participant UC as MoveTicket usecase
   participant TR as TicketRepository
   participant DB as Database (with RLS)
   participant RLS as Row Level Security

   Note over U,RLS: User must be authenticated and project member

   U->>UI: Drag ticket card
   UI->>UC: MoveTicket(ticketId, toColumnId, newIndex)
   
   Note over UC: Verify user has edit permission (admin/member)
   
   UC->>TR: getById(ticketId)
   TR->>DB: SELECT ticket
   DB->>RLS: Check RLS policy (is_project_member)
   RLS-->>DB: Allow (user is project member)
   DB-->>TR: ticket
   TR-->>UC: ticket
   
   UC->>TR: updateStatusAndPosition(ticketId, toColumnId, newIndex)
   TR->>DB: UPDATE ticket position and status
   DB->>RLS: Check RLS policy (can_edit_project)
   RLS-->>DB: Allow (user is admin or member)
   DB-->>TR: ok
   TR-->>UC: ok
   UC-->>UI: updated ticket
   UI-->>U: Board re-renders with new order
```

**Security Notes:**
- User must be authenticated (Supabase Auth)
- RLS policies verify user is project member before SELECT
- RLS policies verify user has edit permission (admin/member) before UPDATE
- If user lacks permission, database returns error, usecase handles it
