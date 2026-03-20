# Task Management System

A full-stack task management application built with **Node.js + TypeScript** (backend) and **Next.js 14 + TypeScript** (frontend).

## Tech Stack

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM with SQLite (PostgreSQL-ready)
- JWT Authentication (Access + Refresh tokens)
- bcrypt password hashing
- express-validator for input validation

**Frontend**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- React Hook Form + Zod validation
- Axios with automatic token refresh interceptor
- react-hot-toast for notifications

---

## Project Structure

```
task-management/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── task.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── task.routes.ts
│   │   ├── lib/
│   │   │   ├── jwt.ts
│   │   │   └── prisma.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   └── (dashboard)/
    │   │       └── dashboard/page.tsx
    │   ├── components/
    │   │   ├── AuthGuard.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── TaskCard.tsx
    │   │   └── TaskModal.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── lib/
    │   │   └── api.ts
    │   ├── services/
    │   │   ├── auth.service.ts
    │   │   └── task.service.ts
    │   └── types/
    │       └── index.ts
    ├── package.json
    └── tsconfig.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Server runs at `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

## Environment Variables

### Backend `.env`

```env
DATABASE_URL="file:./dev.db"
PORT=4000
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and receive tokens | No |
| POST | `/auth/refresh` | Rotate access + refresh tokens | No |
| POST | `/auth/logout` | Invalidate refresh token | No |
| GET | `/auth/me` | Get current user profile | Yes |

#### Register — `POST /auth/register`

Request:
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "password123"
}
```

Response `201`:
```json
{
  "user": { "id": "...", "name": "Alex Johnson", "email": "alex@example.com" },
  "accessToken": "eyJ...",
  "refreshToken": "a3f9..."
}
```

#### Login — `POST /auth/login`

Request:
```json
{
  "email": "alex@example.com",
  "password": "password123"
}
```

Response `200`:
```json
{
  "user": { "id": "...", "name": "Alex Johnson", "email": "alex@example.com" },
  "accessToken": "eyJ...",
  "refreshToken": "a3f9..."
}
```

#### Refresh — `POST /auth/refresh`

Request:
```json
{ "refreshToken": "a3f9..." }
```

Response `200`:
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "b7c2..."
}
```

---

### Tasks

All task endpoints require `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (paginated, filterable, searchable) |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/:id` | Get a single task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/toggle` | Toggle task completion |

#### GET /tasks — Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `status` | string | Filter: `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `priority` | string | Filter: `LOW`, `MEDIUM`, `HIGH` |
| `search` | string | Search by title or description |
| `sortBy` | string | Sort field: `createdAt`, `title`, `dueDate` |
| `sortOrder` | string | `asc` or `desc` |

Response `200`:
```json
{
  "tasks": [
    {
      "id": "...",
      "title": "Design the homepage",
      "description": "Create wireframes first",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2024-12-31T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z",
      "userId": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /tasks — Create Task

Request:
```json
{
  "title": "Design the homepage",
  "description": "Create wireframes first",
  "priority": "HIGH",
  "dueDate": "2024-12-31"
}
```

Response `201`:
```json
{
  "task": { "id": "...", "title": "Design the homepage", "status": "PENDING" }
}
```

#### PATCH /tasks/:id — Update Task

All fields optional:
```json
{
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "dueDate": "2024-12-31"
}
```

#### PATCH /tasks/:id/toggle

Toggles status between `PENDING` and `COMPLETED`.

Response `200`:
```json
{
  "task": { "id": "...", "status": "COMPLETED" }
}
```

---

## Features

### Backend
- JWT auth with short-lived access tokens (15min) and long-lived refresh tokens (7d)
- Refresh token rotation — each use issues a new token and invalidates the old one
- Passwords hashed with bcrypt (12 salt rounds)
- Task ownership enforcement — users can only access their own tasks
- Pagination, filtering by status/priority, and full-text search on all task list requests
- Input validation with descriptive error messages on every endpoint
- Global error handler with consistent HTTP status codes

### Frontend
- Login and registration with client-side Zod validation
- Axios interceptor silently refreshes the access token on 401 and retries the original request
- Dashboard with live stats (total, pending, in-progress, completed)
- Create, edit, delete, and toggle tasks via modal UI
- Debounced search, status filter, and priority filter
- Pagination with page controls
- Responsive layout — collapsible sidebar on mobile
- Toast notifications on every operation
- Skeleton loading states

---

## Database Schema

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  passwordHash  String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  tasks         Task[]
  refreshTokens RefreshToken[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      String    @default("PENDING")
  priority    String    @default("MEDIUM")
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{ "error": "Description of what went wrong" }
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error — missing or invalid fields |
| 401 | Unauthorized — invalid or expired token |
| 404 | Resource not found |
| 409 | Conflict — e.g. email already registered |
| 500 | Internal server error |