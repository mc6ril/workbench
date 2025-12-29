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
   R[ROOT /] --> L[Landing Page]
   R --> AUTH[Auth Pages]
   AUTH --> SIGNIN[/auth/signin]
   AUTH --> SIGNUP[/auth/signup]
   AUTH --> VERIFY[/auth/verify-email]
   AUTH --> RESET[/auth/reset-password]
   AUTH --> UPDATE[/auth/update-password]
   
   R --> PROTECTED[(auth) Route Group]
   PROTECTED --> WS[/workspace]
   PROTECTED --> PROJ[/:projectId]
   
   PROJ --> BOARD[/:projectId/board]
   PROJ --> BACKLOG[/:projectId/backlog]
   PROJ --> EPICS[/:projectId/epics]
   PROJ --> SETTINGS[/:projectId/settings]
```

**Note**: For detailed user flows and route guard architecture, see `docs/architecture/user-flows.md`.

## 2. Complete End-to-End User Flow

```mermaid
stateDiagram-v2
   [*] --> Landing
   Landing --> SignIn: click sign in
   Landing --> SignUp: click sign up
   Landing --> Workspace: session exists (auto redirect)
   
   SignIn --> Workspace: authenticated
   SignUp --> VerifyEmail: signup success
   VerifyEmail --> Workspace: email verified
   
   Workspace --> CreateProject: no projects
   Workspace --> ProjectBoard: select project
   Workspace --> Landing: logout
   CreateProject --> ProjectBoard: project created
   
   ProjectBoard --> ProjectBacklog: navigate
   ProjectBoard --> ProjectEpics: navigate
   ProjectBoard --> ProjectSettings: navigate
   
   ProjectBacklog --> ProjectBoard: navigate
   ProjectEpics --> ProjectBoard: navigate
   ProjectSettings --> ProjectBoard: navigate
```

**Note**: For detailed route guard flow and layout responsibilities, see `docs/architecture/user-flows.md`.

**Access Control Notes:**
- All users must be authenticated to access any feature
- Users must be project members to view project data
- Only users with `admin` or `member` roles can create, update, or delete data
- Only users with `admin` role can delete projects or manage project members

## 3. Route & Layout Guard Flow

```mermaid
flowchart TD
   REQ[Request] --> MIDDLEWARE{Middleware<br/>Optional Routing Optimization}
   MIDDLEWARE -->|Public Route| PUBLIC[Public Routes]
   MIDDLEWARE -->|Protected Route| AUTH_LAYOUT[(auth) Layout]
   
   PUBLIC --> LANDING_LAYOUT[Landing Layout<br/>(public) route group]
   LANDING_LAYOUT -->|Session Exists| REDIRECT_WS[Redirect to /workspace]
   LANDING_LAYOUT -->|No Session| LANDING[/ Landing Page]
   PUBLIC --> AUTH_PAGES[/auth/* Auth Pages]
   
   AUTH_LAYOUT -->|No Session| REDIRECT_LANDING[Redirect to /]
   AUTH_LAYOUT -->|Session OK| CHILD{Child Route}
   
   CHILD -->|/workspace| WS_LAYOUT[Workspace Layout]
   CHILD -->|/:projectId| PROJ_LAYOUT[Project Layout]
   
   WS_LAYOUT --> WS_PAGE[Workspace Page<br/>Client: useProjects]
   
   PROJ_LAYOUT -->|getProject = null| REDIRECT_WS[Redirect to /workspace]
   PROJ_LAYOUT -->|getProject OK| PROJ_CHILD{Project Child}
   
   PROJ_CHILD -->|/:projectId| REDIRECT_BOARD[Redirect to /:projectId/board]
   PROJ_CHILD -->|/:projectId/board| BOARD_PAGE[Board Page<br/>Client: useProject(projectId)<br/>useProjectTickets(projectId)]
   PROJ_CHILD -->|/:projectId/backlog| BACKLOG_PAGE[Backlog Page<br/>Client: useProject(projectId)<br/>useProjectTickets(projectId, filters)]
   PROJ_CHILD -->|/:projectId/epics| EPICS_PAGE[Epics Page<br/>Client: useProject(projectId)<br/>useProjectEpics(projectId)]
   PROJ_CHILD -->|/:projectId/settings| SETTINGS_PAGE[Settings Page<br/>Client: useProject(projectId)<br/>useProjectMembers(projectId)]
```

**Security Architecture Notes:**
- **Middleware** is an optimization layer for UX redirects and route filtering. It is NOT the source of truth for security.
- **AuthLayout** and **ProjectLayout** (server components) are the primary security guards, checking authentication and access before rendering.
- **RLS (Row Level Security)** at the database level is the ultimate source of truth for data access control.
- This layered approach ensures security even if middleware is bypassed or misconfigured.

**Note**: For detailed documentation on route structure and layout responsibilities, see `docs/architecture/user-flows.md`.

## 4. Domain and Use Cases (Clean Architecture Map)

This diagram serves as a "build plan": each node represents a building block.

```mermaid
flowchart LR
   subgraph AUTH[Authentication & Authorization]
      A1[Supabase Auth]
      A2[RLS Policies]
      A3[Project Membership]
   end

   subgraph UI[UI Pages]
      UI1[Workspace Page]
      UI2[Board Page /:projectId/board]
      UI3[Backlog Page /:projectId/backlog]
      UI4[Epics Page /:projectId/epics]
      UI5[Settings Page /:projectId/settings]
      UI6[Ticket Detail Page]
   end

   subgraph APP[Application Use Cases]
      subgraph PROJ_UC[Project Use Cases]
         UC_PROJ1[List Projects]
         UC_PROJ2[Create Project]
         UC_PROJ3[Get Project]
         UC_PROJ4[Add User to Project]
      end
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

   UI1 --> UC_PROJ1
   UI1 --> UC_PROJ2
   UI1 --> UC_PROJ4

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

   UC_PROJ1 --> D5
   UC_PROJ2 --> D5
   UC_PROJ3 --> D5
   UC_PROJ4 --> D5
   UC_PROJ4 --> D6
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

   UC_PROJ1 --> P4
   UC_PROJ2 --> P4
   UC_PROJ3 --> P4
   UC_PROJ4 --> P4
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

## 5. Detailed Drag and Drop Flow (Board)

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
