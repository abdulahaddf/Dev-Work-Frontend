# DevWork Frontend

## 🚀 Live Demo

**🌐 [Live Link](https://dev-work-df.netlify.app/)**

**A modern Next.js application for the DevWork project marketplace platform.**

DevWork connects project buyers with skilled solvers through an intuitive, role-based dashboard system featuring beautiful UI animations and real-time state management.

---

## 🎯 System Overview

DevWork Frontend provides three distinct user experiences based on roles:

```
┌──────────────────────────────────────────────────────┐
│                   DEVWORK PLATFORM                   │
├──────────────────┬──────────────────┬───────────────┤
│  ADMIN PORTAL    │  BUYER PORTAL    │ SOLVER PORTAL │
├──────────────────┼──────────────────┼───────────────┤
│ • Manage Users   │ • Create Projects│ • Browse Open │
│ • Assign Roles   │ • Review Requests│   Projects    │
│ • View All       │ • Assign Solvers │ • Request to  │
│   Projects       │ • Review Tasks   │   Work        │
│ • System Stats   │ • Accept/Reject  │ • Create Tasks│
│                  │   Work           │ • Submit Work │
└──────────────────┴──────────────────┴───────────────┘
```

### **Key Features**

1. ✅ **Full-Stack Marketplace Platform** - Complete project marketplace connecting Buyers with Solvers, managed by Admins with role-based access control

2. ✅ **Modern Tech Stack** - Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand for state management

3. ✅ **Real-Time Communication** - WebSocket chat with typing indicators, message status (sending → sent → delivered → seen), unread badges, and global notifications

4. ✅ **State Machine Workflows** - Strict project lifecycle (DRAFT → OPEN → REQUESTED → ASSIGNED → IN_PROGRESS → UNDER_REVIEW → COMPLETED)

5. ✅ **Role-Based Access Control** - Three-tier RBAC (Admin, Buyer, Solver) with RoleGate component and protected routes

6. ✅ **JWT Authentication** - Secure stateless auth with tokens in localStorage, protected routes, and role-based guards

7. ✅ **Optimized Performance** - Cursor-based pagination, Optimistic UI updates, Zustand for lightweight state

8. ✅ **Profile Management** - Comprehensive profile pages with user stats, project history, and role request system

9. ✅ **Type-Safe Development** - Full TypeScript coverage with strict typing throughout

10. ✅ **Production-Ready** - Deployed on Netlify with proper error handling and security practices

---

## 🛠 Tech Stack

| Layer                | Technology         | Purpose                         |
| -------------------- | ------------------ | ------------------------------- |
| **Framework**        | Next.js 16         | React framework with App Router |
| **Language**         | TypeScript 5       | Type-safe development           |
| **UI Library**       | React 19           | Component-based UI              |
| **Styling**          | Tailwind CSS 4     | Utility-first CSS               |
| **Animations**       | Framer Motion      | Smooth UI animations            |
| **HTTP Client**      | Axios              | API requests                    |
| **State Management** | Zustand            | Lightweight state store         |
| **Auth**             | JWT + localStorage | Client-side auth                |
| **Icons**            | Lucide React       | Modern icon set                 |
| **Real-time**        | Socket.IO Client   | WebSocket connectivity          |
| **Notifications**    | React Hot Toast    | Toast messages                  |
| **Deployment**       | Vercel             | Serverless deployment           |

---

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn** package manager
- **Backend API** running (see backend README)

---

## 🚀 Setup Instructions

### **1. Clone and Install**

```bash
cd frontend
npm install
```

### **2. Environment Configuration**

Create a `.env.local` file in the project root:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# For production (Vercel):
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

> **Important**: Variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser

### **3. Run Development Server**

```bash
npm run dev
```

Application starts at: **http://localhost:3000**

### **4. Build for Production**

```bash
npm run build
npm start
```

---

## 👥 Role Hierarchy

DevWork implements a **multi-role system** where users can have multiple roles simultaneously:

```
┌─────────────────────────────────────────────┐
│              USER (Base Entity)             │
├─────────────────────────────────────────────┤
│  • email, password, name                    │
│  • Can have multiple roles                  │
└──────────────┬──────────────────────────────┘
                │
        ┌───────┴───────┬──────────┐
        ▼               ▼          ▼
    ┌──────┐      ┌────────┐  ┌────────┐
    │ADMIN │      │ BUYER  │  │SOLVER  │
    └──────┘      └────────┘  └────────┘
```

### **Role Capabilities**

| Role       | Capabilities                                                                                                                                                                   | Dashboard Access |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **ADMIN**  | • Assign/remove roles for any user<br>• View all users with statistics<br>• View all projects across platform<br>• Access system metrics                                       | Admin Dashboard  |
| **BUYER**  | • Create and publish projects<br>• Review solver requests<br>• Assign solvers to projects<br>• Review and accept/reject submissions                                            | Buyer Dashboard  |
| **SOLVER** | • Browse open projects<br>• Request to work on projects<br>• View assigned projects<br>• Create tasks for assigned projects<br>• Upload ZIP submissions<br>• Track task status | Solver Dashboard |

### **Role Assignment Flow**

```
1. User registers (email, password, name)
       ↓
2. User account created with SOLVER role by default
       ↓
3. User gets access to Solver dashboard immediately
       ↓
4. Admin can assign additional roles (BUYER, ADMIN)
       ↓
5. Admin can change or remove any role from any user
       ↓
6. User can have multiple roles simultaneously
```

> **Note**:
>
> - **All new users start as SOLVER** by default
> - **Admins have full control** to assign/remove any role to/from any user
> - First user must be manually given ADMIN role via database or seed script

---

## 🔄 Project Lifecycle

### **Visual Workflow**

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐    ┌──────────┐
│  DRAFT  │───▶│   OPEN   │───▶│REQUESTED │───▶│ASSIGNED│───▶│IN_PROGRESS│
└─────────┘    └──────────┘    └──────────┘    └────────┘    └──────────┘
  (Buyer)      (Buyer Pub)     (Solver Req)   (Buyer Asgn)   (Solver Work)
                                                                      │
                                                                      ▼
                          ┌───────────┐                   ┌────────────┐
                          │ COMPLETED │◀──────────────────│UNDER_REVIEW│
                          └───────────┘                   └────────────┘
                            (Buyer Accept)                  (All Submit)
```

### **Detailed State Transitions**

| #   | State            | Description                          | Visible To        | Actions Available                            |
| --- | ---------------- | ------------------------------------ | ----------------- | -------------------------------------------- |
| 1️⃣  | **DRAFT**        | Project created but not published    | Buyer only        | Edit, Delete, **Publish**                    |
| 2️⃣  | **OPEN**         | Published and accepting requests     | All Solvers       | **Request to Work** (Solver)                 |
| 3️⃣  | **REQUESTED**    | Has pending solver requests          | Buyer, Requesters | **View Requests**, **Assign Solver** (Buyer) |
| 4️⃣  | **ASSIGNED**     | Solver assigned, work not started    | Buyer, Solver     | **Start Work** (Solver)                      |
| 5️⃣  | **IN_PROGRESS**  | Solver actively working on tasks     | Buyer, Solver     | **Create Tasks**, **Submit Work** (Solver)   |
| 6️⃣  | **UNDER_REVIEW** | All tasks submitted, awaiting review | Buyer, Solver     | **Review Tasks** (Buyer)                     |
| 7️⃣  | **COMPLETED**    | All tasks accepted, project done     | Buyer, Solver     | View only (archived)                         |

### **State Transition Rules**

```typescript
// Valid transitions enforced by backend
DRAFT       → OPEN          (Buyer publishes)
OPEN        → REQUESTED     (Solver requests)
REQUESTED   → ASSIGNED      (Buyer assigns solver)
ASSIGNED    → IN_PROGRESS   (Solver starts work)
IN_PROGRESS → UNDER_REVIEW  (All tasks submitted)
UNDER_REVIEW → COMPLETED    (Buyer accepts all tasks)
```

### **Example: Complete Project Flow**

```
Day 1: Buyer creates project "Build E-commerce Site"
  └─ Status: DRAFT
  └─ Action: Buyer edits details, sets budget $5000

Day 2: Buyer publishes project
  └─ Status: OPEN
  └─ Visible in "Open Projects" for all Solvers

Day 3: Solver "John" requests to work
  └─ Status: REQUESTED
  └─ Buyer sees request in dashboard

Day 4: Buyer assigns John
  └─ Status: ASSIGNED
  └─ John gets notification

Day 5: John starts work
  └─ Status: IN_PROGRESS
  └─ John creates tasks: "Homepage", "Cart", "Checkout"

Day 10: John submits all tasks
  └─ Status: UNDER_REVIEW
  └─ Buyer reviews each task

Day 12: Buyer accepts all
  └─ Status: COMPLETED
  └─ Project archived
```

---

## 📊 Task State Transitions

### **Task Workflow**

```
┌─────────┐    ┌────────────┐    ┌──────────┐
│ CREATED │───▶│IN_PROGRESS │───▶│ SUBMITTED│
└─────────┘    └────────────┘    └──────────┘
 (Solver       (Solver Start)    (Solver Upload)
  Creates)                              │
                                         ▼
                                  ┌──────────────┐
                                  │ Buyer Reviews│
                                  └──────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
                   ┌──────────┐                   ┌──────────┐
                   │ ACCEPTED │                   │ REJECTED │
                   └──────────┘                   └──────────┘
                   (Task Complete)                      │
                                                        │
                                         (Solver Fixes)◀┘
                                                 │
                                                 ▼
                                          IN_PROGRESS
```

### **Task Status Details**

| Status        | Who Can Change | Next Status              | Action Required            |
| ------------- | -------------- | ------------------------ | -------------------------- |
| `CREATED`     | Solver         | `IN_PROGRESS`            | Solver clicks "Start Work" |
| `IN_PROGRESS` | Solver         | `SUBMITTED`              | Solver uploads ZIP file    |
| `SUBMITTED`   | Buyer          | `ACCEPTED` or `REJECTED` | Buyer reviews work         |
| `ACCEPTED`    | _(final)_      | -                        | Task is complete           |
| `REJECTED`    | Solver         | `IN_PROGRESS`            | Solver fixes and resubmits |

### **Buyer-Solver Task Interaction Flow**

This section details how buyers and solvers collaborate on tasks within a project:

```
┌───────────────────────────────────────────────────────────────────────────── ┐
│                     BUYER-SOLVER TASK COLLABORATION                          │
├───────────────────────────────────────────────────────────────────────────── ┤
│                                                                              │
│  BUYER ACTIONS                              SOLVER ACTIONS                   │
│  ─────────────                              ──────────────                   │
│                                                                              │
│  1. Project Created                     ↔    (watches for new projects)      │
│       │                                       │                              │
│       ▼                                       ▼                              │
│  2. Project Published                  ↔    3. Browse & Find Project         │
│       │                                       │                              │
│       ▼                                       ▼                              │
│  4. Review Solver Requests            ↔    5. Request to Work                │
│       │                                       │                              │
│       ▼                                       ▼                              │
│  6. Assign Solver                     ↔    7. Project Assigned               │
│       │                                       │                              │
│       ▼                                       ▼                              │
│  (Monitors Progress)                     8. Start Work → Create Tasks        │
│       │                                       │                              │
│       │                              ┌─────────┴──────────┐                  │
│       │                              ▼                    ▼                  │
│       │                        9a. Update Tasks    9b. Submit Tasks          │
│       │                        (Work in progress)   (Upload ZIP)             │
│       │                              │                    │                  │
│       │                              └────────┬───────────┘                  │
│       │                                       │                              │
│       ▼                                       ▼                              │
│  10. Review Submitted Tasks            ↔    (Waiting for review)             │
│       │                                       │                              │
│       ├───────────────────┬───────────────────┤                              │
│       ▼                   ▼                   ▼                              │
│  ┌──────────┐      ┌────────────┐    ┌──────────┐                            │
│  │ ACCEPT   │      │ REQUEST     │    │ REJECT   │                            │
│  │ All OK!  │      │ CHANGES     │    │ NOT OK!  │                            │
│  └────┬─────┘      └──────┬─────┘    └────┬─────┘                            │
│       │                    │               │                                  │
│       │              ┌─────┴─────┐         │                                  │
│       │              ▼           ▼         │                                  │
│       │        (Resubmit)  (Submit       │                                  │
│       │                  New Version)     │                                  │
│       │                    │               │                                  │
│       └───────────────────┴───────────────┘                               │
│                           │                                                │
│                           ▼                                                │
│                    Project Complete                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **Detailed Buyer Task Actions**

| Action                | Description                     | Trigger Point                        |
| --------------------- | ------------------------------- | ------------------------------------ |
| **View Tasks**        | See all tasks created by solver | When project is ASSIGNED/IN_PROGRESS |
| **Review Submission** | Download and review ZIP file    | When solver submits task             |
| **Accept Task**       | Approve completed work          | After reviewing submission           |
| **Reject Task**       | Request revisions               | If work doesn't meet requirements    |
| **Request Changes**   | Specify what needs fixing       | When rejecting a task                |

### **Detailed Solver Task Actions**

| Action              | Description                         | Trigger Point              |
| ------------------- | ----------------------------------- | -------------------------- |
| **Create Task**     | Break project into manageable tasks | When project is ASSIGNED   |
| **Start Task**      | Begin working on a task             | Click "Start Work"         |
| **Update Progress** | Mark task progress                  | During IN_PROGRESS status  |
| **Submit Task**     | Upload ZIP with completed work      | When task is ready         |
| **Resubmit**        | Fix issues and resubmit             | After rejection from buyer |

### **Task Submission Requirements**

- ✅ ZIP file format only
- ✅ Include all deliverables
- ✅ Proper file naming
- ✅ Maximum file size: 100MB
- ✅ Review before submitting

---

## 🎨 Application Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Global styles
│   │   ├── login/                    # Login page
│   │   │   └── page.tsx
│   │   ├── register/                 # Registration page
│   │   │   └── page.tsx
│   │   ├── dashboard/                # Protected dashboards (role-based)
│   │   │   ├── layout.tsx            # Dashboard wrapper with sidebar
│   │   │   ├── page.tsx              # Dashboard redirector (routes by role)
│   │   │   ├── admin/                # Admin dashboard
│   │   │   │   ├── users/            # User management
│   │   │   │   ├── projects/         # All platform projects
│   │   │   │   └── role-requests/    # Role request approvals
│   │   │   ├── browse/               # Browse open projects (for solvers)
│   │   │   │   └── page.tsx
│   │   │   ├── chat/                 # Real-time messaging
│   │   │   │   └── page.tsx
│   │   │   ├── projects/             # Projects management
│   │   │   │   ├── page.tsx          # My projects (buyer) / assigned (solver)
│   │   │   │   ├── [id]/             # Project detail page
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/              # Create new project (buyer)
│   │   │   │       └── page.tsx
│   │   │   ├── role-request/         # Request role upgrade
│   │   │   │   └── page.tsx
│   │   │   └── tasks/                # Task management
│   │   │       ├── page.tsx          # My tasks list
│   │   │       └── [id]/             # Task detail
│   │   │           └── page.tsx
│   │   ├── projects/                 # Public project pages
│   │   │   └── [id]/                 # Public project detail
│   │   │       └── page.tsx
│   │   ├── profile/                  # User profile pages
│   │   │   └── [id]/                 # Profile detail
│   │   │       └── page.tsx
│   │   └── view-all-projects/        # Public project listing
│   │       └── page.tsx
│   │
│   ├── components/                   # Reusable components
│   │   ├── auth/                     # Authentication components
│   │   │   └── RoleGate.tsx          # Role-based access control
│   │   ├── chat/                     # Chat components
│   │   │   └── ChatNotificationPopup.tsx  # Global notification popup
│   │   ├── layout/
│   │   │   ├── Nav.tsx               # Public navigation bar
│   │   │   ├── Footer.tsx            # Global footer
│   │   │   ├── DashboardNav.tsx      # Dashboard navigation
│   │   │   ├── HeoSection.tsx        # Hero section (landing)
│   │   │   ├── StatsSection.tsx     # Statistics section
│   │   │   ├── WorkFlowSection.tsx   # Workflow diagram section
│   │   │   ├── TrustSection.tsx      # Trust/testimonials section
│   │   │   ├── ReviewsSection.tsx    # Reviews display section
│   │   │   ├── SolverCTA.tsx         # Solver call-to-action
│   │   │   └── ProjectsSection.tsx   # Projects showcase
│   │   ├── modals/
│   │   │   └── Modal.tsx             # Base modal component
│   │   ├── status/
│   │   │   └── StatusBadge.tsx       # Status badge component
│   │   ├── steppers/
│   │   │   └── LifecycleStepper.tsx  # Project lifecycle display
│   │   └── upload/
│   │       └── FileUpload.tsx        # ZIP file upload component
│   │
│   ├── store/                        # Zustand State Management
│   │   └── useChatStore.ts           # Chat state (messages, conversations, unread)
│   │
│   ├── lib/                          # Utilities & configs
│   │   ├── api.ts                    # Axios API client with interceptors
│   │   ├── auth.ts                   # Auth helpers
│   │   └── useSocket.ts              # Socket.IO hook
│   │
│   └── providers/                    # React Context Providers
│       └── ChatProvider.tsx          # Chat context provider
│
├── public/                           # Static assets
├── .env.local                        # Environment variables
└── package.json                      # Dependencies
```

### **Store Architecture (Zustand)**

The frontend uses Zustand for lightweight, performant state management:

```
src/store/
└── useChatStore.ts       # Chat/messaging state
    ├── conversations     # All conversations
    ├── activeConversation # Current chat ID
    ├── messages          # Messages in active chat
    ├── unreadCount      # Total unread count
    ├── typingStatus     # Who is typing per conversation
    ├── addMessage()     # Add message to store
    ├── setTyping()      # Set typing status
    ├── markAsRead()     # Mark messages as read
    └── setActiveConversation() # Switch active chat
```

> **Note**: Authentication state is managed via localStorage and React Context. The auth token and user data are stored in localStorage, with authentication state checked via useEffect in protected routes.

### **Chat System Architecture**

```
src/components/chat/
├── ChatNotificationPopup.tsx    # Global notification popup
│
src/lib/
├── useSocket.ts                 # Socket.IO connection hook
│   ├── socket                   # Socket instance
│   ├── connect()                # Connect to server
│   ├── emit()                   # Emit events
│   └── on()                     # Listen for events
│
src/providers/
└── ChatProvider.tsx             # Chat context
    ├── Socket.IO integration
    ├── Real-time message handling
    ├── Typing indicators
    └── Notification management
```

---

## 🔐 Authentication Flow

### **Registration & Login**

```
┌──────────────┐
│ User visits  │
│  /register   │
└──────┬───────┘
       │
       ▼
┌──────────────┐      POST /api/auth/register
│ Fill form    │────────────────────────────────┐
│ (email, pwd) │                                │
└──────┬───────┘                                ▼
       │                                 ┌──────────────┐
       │                                 │   Backend    │──
       │                                 │ Creates User │   │
       │                                 │ + Assigns    │   │
       │                                 │ SOLVER Role  │   │
       │                                 └──────┬───────┘   │
       │                                        │           │
       │                                        ▼           │
       │                                  User has SOLVER role
       │                              (Can browse/request projects)
       │
       ▼
┌──────────────┐      POST /api/auth/login
│ Login page   │────────────────────────────────┐
│ (email, pwd) │                                │
└──────┬───────┘                                ▼
       │                                 ┌──────────────┐
       │                                 │   Backend    │──
       │                                 │ Validates &  │   │
       │                                 │ Returns JWT  │   │
       │                                 └──────┬───────┘   │
       │                                        │           │
       │◀───────────────────────────────────────┘           │
       │      JWT Token + User Data                         │
       ▼                                                     │
┌──────────────┐                                             │
│ Store in     │                                             │
│ localStorage │─────────────────────────────────────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Redirect to  │
│ Dashboard    │
│ (Solver by   │
│  default)    │
└──────────────┘
```

### **Protected Routes**

All dashboard routes check for:

1. Valid JWT token in localStorage
2. User has appropriate role
3. Token not expired

---

## 🎭 Dashboard Navigation

### **Admin Dashboard**

```
┌────────────────────────────────────────┐
│  ADMIN DASHBOARD                       │
├────────────────────────────────────────┤
│  📊 Overview                           │
│     • Total Users: 150                 │
│     • Total Projects: 45              │
│     • Active Projects: 12              │
│                                        │
│  👥 Users                              │
│     • View all users                   │
│     • Assign/remove roles              │
│     • View user statistics             │
│                                        │
│  📁 All Projects                       │
│     • View all platform projects       │
│     • Filter by status                 │
│     • Delete projects                  │
└────────────────────────────────────────┘
```

### **Buyer Dashboard**

```
┌────────────────────────────────────────┐
│  BUYER DASHBOARD                       │
├────────────────────────────────────────┤
│  📈 My Projects                        │
│     • Create New Project               │
│     • View Draft Projects              │
│     • View Open Projects               │
│     • View In-Progress Projects        │
│                                        │
│  🔍 Project Details (when selected)    │
│     • Edit project (if DRAFT)          │
│     • Publish project                  │
│     • View solver requests             │
│     • Assign solver                    │
│     • Review task submissions          │
│     • Accept/Reject work               │
└────────────────────────────────────────┘
```

### **Solver Dashboard**

```
┌────────────────────────────────────────┐
│  SOLVER DASHBOARD                      │
├────────────────────────────────────────┤
│  🔍 Browse Projects                    │
│     • View open projects               │
│     • Request to work                  │
│     • View request status              │
│                                        │
│  📋 My Assignments                     │
│     • View assigned projects           │
│     • Create tasks                     │
│     • Upload ZIP submissions           │
│     • Track task status                │
│                                        │
│  ✅ My Tasks                           │
│     • View all tasks                   │
│     • Update task status               │
│     • Submit work                      │
│                                        │
│  💬 Chat & Notifications              │
│     • Global message alerts            │
│     • Real-time unread badges          │
│     • Instant seen status              │
└────────────────────────────────────────┘
```

---

## 🎨 UI/UX Features

### **Animations**

- ✅ **Global Notifications** - Interactive bottom-right popup for new messages
- ✅ **Unread Badges** - Real-time counters in Navbar and Chat List
- ✅ **Typing Indicators** - Visual feedback when others are typing
- ✅ **Message Status** - Real-time "Sending", "Sent" (single tick), and "Seen" (blue double tick) indicators
- ✅ **Loading Skeletons** - Sophisticated pulse animations for chats and threads
- ✅ **Empty State Guidance** - Helpful placeholders for new users
- ✅ **Page Transitions** - Smooth Framer Motion transitions

### **Real-time Features**

- ✅ **Socket.IO Integration** - Persistent WebSocket connection
- ✅ **Typing Indicators** - See when others are typing in real-time
- ✅ **Online Status** - Green dot for online users
- ✅ **Message Delivery** - Instant message delivery across all clients
- ✅ **Live Notifications** - Desktop push notifications for new messages
- ✅ **Chat Unread Count** - Badge showing unread messages per conversation

### **User Experience**

- ✅ **Auto-scroll to Latest** - Chat automatically scrolls to newest messages
- ✅ **Message Input States** - Clear visual states for sending/sent/delivered/read
- ✅ **Emoji Support** - Full emoji picker for messages
- ✅ **Responsive Chat** - Works on mobile and desktop
- ✅ **Message Timestamps** - Relative time display (e.g., "2 min ago")
- ✅ **Date Separators** - Chat messages grouped by date

---

## 📁 Project Structure Deep Dive

### **Authentication (src/app/login, src/app/register)**

```
login/
├── page.tsx              # Login page with form validation
└── components/           # Login-specific components

register/
├── page.tsx              # Registration with role selection
└── components/           # Registration-specific components
```

### **Dashboard (src/app/dashboard)**

```
dashboard/
├── layout.tsx            # Dashboard wrapper with sidebar
├── page.tsx              # Role-based redirector
├── admin/                # Admin-specific routes
│   ├── users/            # User management
│   ├── projects/         # Platform-wide projects
│   └── role-requests/    # Role request approvals
├── buyer/                # Buyer-specific routes
│   ├── projects/         # Manage projects
│   └── create/           # New project wizard
├── solver/               # Solver-specific routes
│   ├── browse/           # Find projects
│   ├── assigned/         # Active projects
│   └── tasks/            # Task management
├── chat/                 # Real-time messaging
├── projects/             # Project details
└── tasks/                # Task details
```

### **Components Organization**

```
components/
├── auth/                 # Authentication components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── RoleGate.tsx      # Role-based access control
│
├── chat/                 # Chat components
│   ├── ChatList.tsx      # Conversation list
│   ├── ChatWindow.tsx    # Message display
│   ├── MessageBubble.tsx # Individual message
│   ├── ChatInput.tsx     # Message composer
│   └── ChatNotificationPopup.tsx
│
├── layout/               # Layout components
│   ├── Header.tsx        # Global header
│   ├── Footer.tsx        # Global footer
│   ├── Sidebar.tsx       # Dashboard navigation
│   └── DashboardNav.tsx  # Role-based navigation
│
├── cards/                # Card components
│   ├── ProjectCard.tsx
│   ├── TaskCard.tsx
│   └── UserCard.tsx
│
├── modals/               # Modal dialogs
│   ├── CreateProjectModal.tsx
│   ├── RequestModal.tsx
│   └── ReviewModal.tsx
│
├── forms/                # Form components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── TaskForm.tsx
│
├── upload/               # File upload
│   └── FileUpload.tsx    # ZIP file uploader
│
└── status/               # Status components
    └── StatusBadge.tsx   # Project/Task status display
```

### **State Management (src/store)**

```
store/
├── useAuthStore.ts       # Authentication state
├── useChatStore.ts       # Chat/messaging state
└── useUIStore.ts        # UI state (modals, sidebar)
```

---

## 🔧 Environment Variables

| Variable                 | Description          | Required | Default                     |
| ------------------------ | -------------------- | -------- | --------------------------- |
| `NEXT_PUBLIC_API_URL`    | Backend API URL      | Yes      | `http://localhost:4000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | No       | Same as API URL             |

### **Development (.env.local)**

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### **Production (.env.production)**

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

---

### **Lint & Format**

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

---

## 🚢 Deployment

### **Vercel (Recommended)**

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy automatically on push

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Environment-Specific Builds**

```bash
# Development
npm run dev

# Staging
npm run build && npm start

# Production
npm run build
NODE_ENV=production npm start
```

---

## 📚 API Integration

### **API Client Configuration**

The frontend uses Axios with interceptors for:

- Automatic JWT token attachment
- Request/response logging
- Error handling
- Token refresh

```typescript
// API methods available
api.get(endpoint, config);
api.post(endpoint, data, config);
api.put(endpoint, data, config);
api.patch(endpoint, data, config);
api.delete(endpoint, config);
```

### **Authentication Headers**

```typescript
// Automatically added to all requests
{
  Authorization: `Bearer ${token}`;
}
```

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Socket.IO](https://socket.io) - Real-time communication
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
