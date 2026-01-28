# DevWork Frontend

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

- ✅ **Role-Based Dashboards** - Customized UI per user role
- ✅ **Real-Time State Updates** - Instant UI updates with Zustand
- ✅ **Beautiful Animations** - Framer Motion & GSAP transitions
- ✅ **Toast Notifications** - User-friendly feedback system
- ✅ **File Upload** - Drag-and-drop ZIP submission
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Type-Safe** - Full TypeScript coverage

---

## 🛠 Tech Stack

| Layer                | Technology         | Purpose                         |
| -------------------- | ------------------ | ------------------------------- |
| **Framework**        | Next.js 16         | React framework with App Router |
| **Language**         | TypeScript 5       | Type-safe development           |
| **UI Library**       | React 19           | Component-based UI              |
| **Styling**          | Tailwind CSS 4     | Utility-first CSS               |
| **Animations**       | Framer Motion      | Smooth UI animations            |
| **Animations**       | GSAP               | Advanced animations             |
| **HTTP Client**      | Axios              | API requests                    |
| **State Management** | Zustand            | Lightweight state store         |
| **Auth**             | JWT + localStorage | Client-side auth                |
| **Icons**            | Lucide React       | Modern icon set                 |
| **Icons**            | React Icons        | Additional icons                |
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
| **BUYER**  | • Create and publish projects<br>• Review solver requests<br>• Assign solvers to projects<br>• Create tasks for assigned projects<br>• Review and accept/reject submissions    | Buyer Dashboard  |
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
│   │   ├── register/                 # Registration page
│   │   ├── dashboard/                # Protected dashboards
│   │   │   ├── layout.tsx            # Dashboard wrapper
│   │   │   ├── admin/                # Admin dashboard
│   │   │   │   ├── page.tsx          # Admin home
│   │   │   │   ├── users/            # User management
│   │   │   │   └── projects/         # All projects view
│   │   │   ├── buyer/                # Buyer dashboard
│   │   │   │   ├── page.tsx          # Buyer home
│   │   │   │   ├── projects/         # My projects
│   │   │   │   └── create/           # Create project
│   │   │   └── solver/               # Solver dashboard
│   │   │       ├── page.tsx          # Solver home
│   │   │       ├── browse/           # Browse projects
│   │   │       ├── assigned/         # My assignments
│   │   │       └── tasks/            # My tasks
│   │   ├── projects/                 # Public project pages
│   │   │   └── [id]/                 # Project detail page
│   │   └── view-all-projects/        # Public project listing
│   │
│   ├── components/                   # Reusable components
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Global header
│   │   │   ├── Sidebar.tsx           # Dashboard sidebar
│   │   │   └── Footer.tsx            # Global footer
│   │   ├── cards/
│   │   │   ├── ProjectCard.tsx       # Project display card
│   │   │   ├── TaskCard.tsx          # Task display card
│   │   │   └── UserCard.tsx          # User display card
│   │   ├── modals/
│   │   │   ├── CreateProjectModal.tsx
│   │   │   ├── RequestModal.tsx
│   │   │   └── ReviewModal.tsx
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── TaskForm.tsx
│   │   └── upload/
│   │       └── FileUpload.tsx        # ZIP upload component
│   │
│   └── lib/                          # Utilities & configs
│       ├── api.ts                    # Axios API client
│       └── auth.ts                   # Auth helpers
│
├── public/                           # Static assets
├── .env.local                        # Environment variables
└── package.json                      # Dependencies
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
       │                                 │   Backend    │
       │                                 │ Creates User │
       │                                 │ + Assigns    │
       │                                 │ SOLVER Role  │
       │                                 └──────┬───────┘
       │                                        │
       │                                        ▼
       │                                  User has SOLVER role
       │                              (Can browse/request projects)
       │
       ▼
┌──────────────┐      POST /api/auth/login
│ Login page   │────────────────────────────────┐
│ (email, pwd) │                                │
└──────┬───────┘                                ▼
       │                                 ┌──────────────┐
       │                                 │   Backend    │
       │                                 │ Validates &  │
       │                                 │ Returns JWT  │
       │                                 └──────┬───────┘
       │                                        │
       │◀───────────────────────────────────────┘
       │      JWT Token + User Data
       ▼
┌──────────────┐
│ Store in     │
│ localStorage │
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

```typescript
// Automatic redirect if not authenticated
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
  }
}, []);
```

---

## 🎭 Dashboard Navigation

### **Admin Dashboard**

```
┌────────────────────────────────────────┐
│  ADMIN DASHBOARD                       │
├────────────────────────────────────────┤
│  📊 Overview                           │
│     • Total Users: 150                 │
│     • Total Projects: 45               │
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
└────────────────────────────────────────┘
```

---

## 🎨 UI/UX Features

### **Animations**

- ✅ **Page Transitions** - Smooth fade-in on route changes
- ✅ **Card Hover Effects** - Scale and shadow on hover
- ✅ **Status Badges** - Color-coded project/task states
- ✅ **Loading States** - Skeleton loaders for data fetching
- ✅ **Toast Notifications** - Success/error feedback
- ✅ **Modal Animations** - Slide-up effect for modals

### **Responsive Design**

```
Desktop (≥1024px)     Tablet (768-1023px)    Mobile (<768px)
┌─────────────────┐   ┌──────────────┐      ┌──────────┐
│  Sidebar + Main │   │ Collapsible  │      │ Mobile   │
│  Layout         │   │ Sidebar      │      │ Menu     │
│                 │   │              │      │          │
│  [Sidebar][Main]│   │ [≡][Main]    │      │ [≡]      │
│                 │   │              │      │ [Main]   │
│                 │   │              │      │          │
└─────────────────┘   └──────────────┘      └──────────┘
```

### **Color Coding**

| Status       | Color  | Badge Style     |
| ------------ | ------ | --------------- |
| DRAFT        | Gray   | `bg-gray-500`   |
| OPEN         | Blue   | `bg-blue-500`   |
| REQUESTED    | Yellow | `bg-yellow-500` |
| ASSIGNED     | Purple | `bg-purple-500` |
| IN_PROGRESS  | Orange | `bg-orange-500` |
| UNDER_REVIEW | Indigo | `bg-indigo-500` |
| COMPLETED    | Green  | `bg-green-500`  |
| REJECTED     | Red    | `bg-red-500`    |

---

## 🧪 Development Tips

### **Hot Reload**

Next.js automatically reloads on file changes. Edit any file in `src/` and see changes instantly.

### **Component Development**

Create reusable components in `src/components/` and import where needed:

```typescript
// src/components/cards/MyCard.tsx
export function MyCard({ title, description }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

// Use in page
import { MyCard } from '@/components/cards/MyCard';
```

### **API Calls**

Use the centralized API client:

```typescript
import { projectsApi } from "@/lib/api";

const projects = await projectsApi.getMyProjects();
```

### **State Management**

Use Zustand for global state:

```typescript
import { create } from "zustand";

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

---

## 🌍 Deployment (Vercel)

### **1. Connect to Vercel**

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel
```

### **2. Set Environment Variables**

In Vercel dashboard:

- Add `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api`

### **3. Auto-Deploy**

Vercel automatically deploys on:

- Every push to `main` branch (production)
- Every PR (preview deployment)

---

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🐛 Common Issues

### **CORS Errors**

Make sure backend `FRONTEND_URL` environment variable matches your frontend domain.

### **"Not Authorized" Errors**

Check if:

1. JWT token exists in localStorage
2. Token is valid (not expired)
3. User has correct role for the action

### **Images Not Loading**

Next.js requires images to be in `public/` folder or use `next/image` component.

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test thoroughly
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using Next.js, React, and Tailwind CSS**
