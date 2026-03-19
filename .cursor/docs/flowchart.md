# Architecture Flowcharts

This document contains Mermaid diagrams representing the final routing model and the final multi-domain architecture.

## 1. Global Sitemap

```mermaid
flowchart TD
   R[ROOT /] --> LANDING[/]
   R --> AUTH[Auth routes]
   AUTH --> SIGNIN[/auth/signin]
   AUTH --> SIGNUP[/auth/signup]
   AUTH --> VERIFY[/auth/verify-email]
   AUTH --> RESET[/auth/reset-password]
   AUTH --> UPDATE[/auth/update-password]
   AUTH --> CALLBACK[/auth/callback]

   R --> STATIC[Static routes]
   STATIC --> PRICING[/pricing]
   STATIC --> LEGAL[/legal]

   R --> JOIN[/join/:token]
   R --> PROTECTED[(auth) route group]
   PROTECTED --> WS[/workspace]
   PROTECTED --> ACCOUNT[/account]
   PROTECTED --> PROJ[/:projectId]

   PROJ --> BOARD[/:projectId/board]
   PROJ --> EPICS[/:projectId/epics]
   PROJ --> SETTINGS[/:projectId/settings]

   R --> API[API routes]
   API --> CHECKOUT[/api/stripe/checkout]
   API --> PORTAL[/api/stripe/portal]
   API --> WEBHOOK[/api/stripe/webhook]
```

## 2. End-to-End Product Flow

```mermaid
stateDiagram-v2
   [*] --> Landing
   Landing --> SignIn: click sign in
   Landing --> SignUp: click sign up
   Landing --> Workspace: session exists

   SignIn --> Workspace: authenticated
   SignUp --> VerifyEmail: signup success
   VerifyEmail --> Workspace: email verified

   Workspace --> Account: account settings
   Workspace --> ProjectBoard: select project
   Workspace --> BillingPortal: manage plan

   ProjectBoard --> ProjectEpics: navigate
   ProjectBoard --> ProjectSettings: navigate
   ProjectBoard --> BillingPortal: upgrade
   ProjectEpics --> ProjectBoard: navigate
   ProjectSettings --> ProjectBoard: navigate
```

## 3. Route Composition Flow

```mermaid
flowchart TD
   REQ[Request] --> APP[src/app/* route]
   APP --> MIDDLEWARE[middleware.ts]
   MIDDLEWARE --> ROUTE{Route family}

   ROUTE -->|public auth| AUTH_ROUTE[Auth route composition]
   ROUTE -->|workspace/account| WS_ROUTE[Workspace route composition]
   ROUTE -->|project| PROJECT_ROUTE[Project route composition]
   ROUTE -->|billing api| BILLING_ROUTE[Billing route composition]

   AUTH_ROUTE --> AUTH_PAGE[domains/auth/presentation/...]
   WS_ROUTE --> WS_PAGE[domains/workspace/presentation/...]
   PROJECT_ROUTE --> PM_LAYOUT[domains/project-management/presentation/layouts/projectShell/ProjectShell.tsx]
   BILLING_ROUTE --> BILLING_FLOW[domains/billing/...]

   PM_LAYOUT --> PM_PAGES[domains/project-management/presentation/pages/...]
   PM_PAGES --> PM_HOOKS[project-management presentation hooks]
   AUTH_PAGE --> AUTH_HOOKS[auth presentation hooks]
   WS_PAGE --> WS_HOOKS[workspace presentation hooks]
```

## 4. Final Domain Architecture Map

```mermaid
flowchart LR
   subgraph APP[src/app]
      APP1[route files]
      APP2[route layouts]
      APP3[route handlers]
   end

   subgraph DOMAINS[src/domains]
      subgraph AUTH[auth]
         AUTH_PRE[presentation]
         AUTH_CORE[core]
         AUTH_INFRA[infrastructure]
      end

      subgraph BILLING[billing]
         BILLING_PRE[presentation]
         BILLING_CORE[core]
         BILLING_INFRA[infrastructure]
      end

      subgraph WORKSPACE[workspace]
         WORKSPACE_PRE[presentation]
         WORKSPACE_CORE[core]
         WORKSPACE_INFRA[infrastructure]
      end

      subgraph PM[project-management]
         PM_PRE[presentation]
         PM_CORE[core]
         PM_INFRA[infrastructure]
      end
   end

   subgraph SHARED[src/shared]
      SHARED_1[design-system]
      SHARED_2[i18n]
      SHARED_3[observability]
      SHARED_4[infrastructure/supabase]
      SHARED_5[infrastructure/stripe]
      SHARED_6[infrastructure/web]
      SHARED_7[constants]
      SHARED_8[types]
      SHARED_9[utils]
      SHARED_10[a11y]
   end

   subgraph EXT[External Services]
      EXT1[Supabase]
      EXT2[Stripe]
      EXT3[Web APIs]
   end

   APP1 --> AUTH_PRE
   APP1 --> WORKSPACE_PRE
   APP1 --> PM_PRE
   APP3 --> BILLING_INFRA

   AUTH_PRE --> AUTH_CORE
   AUTH_INFRA --> SHARED_4

   BILLING_PRE --> BILLING_CORE
   BILLING_INFRA --> SHARED_5
   BILLING_INFRA --> SHARED_4

   WORKSPACE_PRE --> WORKSPACE_CORE
   WORKSPACE_INFRA --> SHARED_4

   PM_PRE --> PM_CORE
   PM_PRE --> SHARED_1
   PM_INFRA --> SHARED_4

   SHARED_4 --> EXT1
   SHARED_5 --> EXT2
   SHARED_6 --> EXT3
```

## 5. Data Flow Reference

```mermaid
flowchart TD
   ROUTE[src/app/(auth)/[projectId]/board/page.tsx]
   PAGE[domains/project-management/presentation/pages/board/index.tsx]
   HOOK[domains/project-management/presentation/hooks/ticket/useTickets.ts]
   USECASE[domains/project-management/core/usecases/ticket/listTickets.ts]
   PORT[domains/project-management/core/ports/ticketRepository.ts]
   REPO[domains/project-management/infrastructure/supabase/ticket/TicketRepository.supabase.ts]
   CLIENT[shared/infrastructure/supabase/client-browser.ts]
   DB[Supabase]

   ROUTE --> PAGE
   PAGE --> HOOK
   HOOK --> USECASE
   USECASE --> PORT
   PORT --> REPO
   REPO --> CLIENT
   CLIENT --> DB
```

The routing layer composes domain pages. Domain presentation calls domain use cases. Domain infrastructure relies on shared infrastructure clients.
