1. Sitemap global des pages
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

2. Flow utilisateur complet end-to-end
   stateDiagram-v2
   [*] --> Home
   Home --> Backlog
   Home --> Board
   Home --> Epics
   Home --> Settings

Backlog --> CreateTicket : add ticket
CreateTicket --> Backlog : saved

Backlog --> TicketDetail : open ticket
Board --> TicketDetail : open ticket card
Epics --> TicketDetail : open ticket from epic

TicketDetail --> EditTicket : edit fields
EditTicket --> TicketDetail : saved

TicketDetail --> CreateSubtask : add subtask
CreateSubtask --> TicketDetail : saved

TicketDetail --> LinkEpic : assign epic
LinkEpic --> TicketDetail : saved

Backlog --> Board : send to board
Board --> MoveTicket : drag card
MoveTicket --> Board : status and position updated

Settings --> ConfigureColumns : edit columns
ConfigureColumns --> Board : board updated

Epics --> CreateEpic : add epic
CreateEpic --> Epics : saved
Epics --> EpicDetail : open epic
EpicDetail --> TicketDetail : open linked ticket

TicketDetail --> [*]

3. Domaine et Use cases (Clean Architecture map)

Ce diagramme te sert de “plan de build” : chaque nœud = une brique.

flowchart LR
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
end

subgraph PORTS[Ports]
P1[Ticket Repository]
P2[Epic Repository]
P3[Board Repository]
P4[Event Store Optional]
end

subgraph INFRA[Infrastructure]
I1[DB Ticket Repo]
I2[DB Epic Repo]
I3[DB Board Repo]
I4[Migration Tool]
end

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
I4 --> I1
I4 --> I2
I4 --> I3

4. Flow drag and drop (Board) détaillé
   sequenceDiagram
   autonumber
   participant U as User
   participant UI as Board UI
   participant UC as MoveTicket usecase
   participant TR as TicketRepository
   participant DB as Database

U->>UI: Drag ticket card
UI->>UC: MoveTicket(ticketId, toColumnId, newIndex)
UC->>TR: getById(ticketId)
TR->>DB: SELECT ticket
DB-->>TR: ticket
TR-->>UC: ticket
UC->>TR: updateStatusAndPosition(ticketId, toColumnId, newIndex)
TR->>DB: UPDATE ticket position and status
DB-->>TR: ok
TR-->>UC: ok
UC-->>UI: updated ticket
UI-->>U: Board re-renders with new order
