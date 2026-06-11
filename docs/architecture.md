# Frontend Architecture & Context

## Overview

**Framework:** Next.js 16 (App Router)
**Language:** TypeScript
**Styling:** Tailwind CSS 4 + tw-animate-css
**UI Components:** shadcn/ui (Radix UI primitives)
**Icons:** Lucide React
**Animations:** Framer Motion
**Charts:** Recharts
**Toasts:** Sonner
**Themes:** next-themes (light/dark)
**Port:** 3000 (default Next.js)

---

## Project Structure

```
shadam-qr-frontend/
├── app/
│   ├── (admin)/dashboard/       # Admin panel (protected)
│   │   ├── components/          # Shared dashboard components (sidebar, etc.)
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── page.tsx             # Dashboard home / overview
│   │   ├── productos/           # Product catalog management (CRUD)
│   │   ├── menu/                # Menu management (add/remove products, toggle visibility)
│   │   ├── mesas/               # Table management
│   │   ├── pensionistas/        # Pensioner management
│   │   └── ventas/              # Sales history view
│   ├── (cliente)/menu/          # Public customer menu (QR scan destination)
│   ├── (staff)/
│   │   ├── portal/             # Staff portal (orders management: crear, editar, pagar pedidos)
│   │   └── recepcion/          # Reception view
│   ├── api/                     # Next.js API routes (proxy to backend)
│   │   ├── auth/               # Auth proxy (login, refresh, logout)
│   │   ├── products/           # Product CRUD proxy
│   │   ├── menus/              # Menu proxy
│   │   ├── orders/             # Orders proxy
│   │   ├── proxy/              # Universal catch-all proxy
│   │   ├── users/              # Users proxy
│   │   ├── pensionists/        # Pensionists proxy
│   │   ├── categories/         # Categories proxy
│   │   ├── consumptions/       # Consumptions proxy
│   │   ├── dashboard/          # Dashboard stats proxy
│   │   └── tables/             # Tables proxy
│   ├── login/                   # Login page
│   ├── pensionista/             # Pensioner self-service view
│   ├── layout.tsx               # Root layout (ThemeProvider, fonts)
│   ├── globals.css              # Global styles + Tailwind imports
│   ├── page.tsx                 # Landing / root redirect
│   ├── error.tsx                # Global error boundary
│   ├── loading.tsx              # Global loading state
│   └── not-found.tsx            # 404 page
├── components/
│   ├── ui/                      # shadcn/ui components (button, dialog, input, table, etc.)
│   ├── theme-provider.tsx       # next-themes wrapper
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── hooks/                       # Custom React hooks
├── lib/
│   ├── api.ts                   # Generic API client (apiRequest with auto-refresh)
│   ├── auth-context.tsx         # Auth context (user state, login/logout)
│   ├── cart-context.tsx         # Shopping cart context (for client menu)
│   ├── pedidos-api.ts           # Orders API functions (typed wrappers)
│   ├── mock-db.ts              # Mock data (legacy, being replaced)
│   └── utils.ts                 # Utility functions (cn for classnames)
├── middleware.ts                # Route protection (JWT decode, admin check)
├── public/                      # Static assets
└── package.json
```

---

## Route Groups & Access Control

| Route Group | Path Prefix | Auth Required | Role |
|-------------|-------------|---------------|------|
| `(admin)` | `/dashboard/*` | Yes | admin |
| `(staff)` | `/portal/*`, `/recepcion/*` | Yes | admin |
| `(cliente)` | `/menu/*` | No | public |
| Root | `/login` | No | public |
| Pensionista | `/pensionista/*` | Yes | pensioner (or admin) |
| Pensionista Login | `/pensionista/login` | No | public |

### Middleware (`middleware.ts`)
- Protects: `/portal/*`, `/dashboard/*`, `/recepcion/*`, `/pensionista/*` (except `/pensionista/login`)
- Reads `access_token` cookie, decodes JWT payload (no verification - backend handles real auth)
- Admin routes: requires role === "admin"
- Pensionista routes: requires role === "pensioner" or "admin"
- Redirects to `/login` (admin) or `/pensionista/login` (pensionista) if unauthorized

---

## API Communication Patterns

There are two patterns used to communicate with the backend:

### Pattern 1: Direct fetch to Next.js API routes
Used by: Products page, menus, auth

```tsx
// Component calls Next.js API route
const res = await fetch("/api/products");
// Next.js route proxies to backend
const backendRes = await fetch(`${BACKEND_URL}/productos`);
```

Mapping happens in the API route (backend uses Spanish field names, frontend uses English).

### Pattern 2: Generic `apiRequest` via proxy
Used by: Orders (pedidos), sales (ventas)

```tsx
// lib/api.ts - routes through /api/proxy?path=<endpoint>
const data = await apiRequest<Order[]>('/pedidos');
```

Features:
- Automatic 401 handling with token refresh retry
- Forwards cookies for auth
- Typed responses

---

## Field Name Mapping (Backend <-> Frontend)

The backend uses Spanish, the frontend uses English:

| Backend | Frontend | Type |
|---------|----------|------|
| `nombre` | `name` | string |
| `descripcion` | `description` | string |
| `precio` | `price` | number (backend returns Decimal as string) |
| `categoria` | `categoryId` | "entrada" / "menu" (lowercase in FE, UPPERCASE in BE) |
| `imagen` | `image` | URL string (backend returns relative path) |

Image URLs: Backend stores `/uploads/filename.jpg`, frontend maps to `${BACKEND_URL}/uploads/filename.jpg`.

---

## UI Component Library (shadcn/ui)

Located in `components/ui/`. Key components:

| Component | File | Usage |
|-----------|------|-------|
| Button | `button.tsx` | Action buttons (variants: default, ghost, outline, destructive) |
| Dialog | `dialog.tsx` | Modal dialogs (Radix-based) |
| Input | `input.tsx` | Form inputs |
| Label | `label.tsx` | Form labels |
| Table | `table.tsx` | Data tables (TableHeader, TableRow, TableCell) |
| Card | `card.tsx` | Content cards |
| Sheet | `sheet.tsx` | Slide-over panels |
| Sidebar | `sidebar.tsx` | Dashboard sidebar navigation |
| Skeleton | `skeleton.tsx` | Loading placeholders |

---

## Dashboard Pages (Admin)

### `/dashboard` - Overview
Stats cards, recent activity, charts (Recharts).

### `/dashboard/productos` - Product Management
- List all products (table on desktop, cards on mobile)
- Add product (dialog with image upload)
- Edit product (dialog with image upload)
- Delete product (confirm dialog -> cascade removes from menus)
- Search by name/description

### `/dashboard/menu` - Menu Management
- Create new daily menus
- Add products to menus
- Toggle product visibility in menus
- Activate/deactivate menus (only one active at a time)

### `/dashboard/mesas` - Table Management
- CRUD for restaurant tables

### `/dashboard/pensionistas` - Pensioner Management
- List pensioners (shows type badge, QR token, balance)
- Create new pensioners (name + DNI + type: ESTUDIANTE/TRABAJADOR)
- Auto-generates QR token and credentials from DNI
- Toggle active/inactive
- Recharge balance

### `/dashboard/configuracion` - Price Configuration
- Set prices for each meal type (DESAYUNO, ALMUERZO, CENA)
- These prices apply to TRABAJADOR pensionistas
- ESTUDIANTE pricing is fixed (S/ 16.66 per 3 consumptions)

### `/dashboard/ventas` - Sales History
- List finalized sales
- View sale details (items, payments)

---

## Staff Portal (`/portal`)

- Full order management (create, edit, confirm, pay, delete)
- Uses `lib/pedidos-api.ts` typed API functions
- Supports: table orders, takeaway orders, pensioner orders
- Payment flow: EFECTIVO, YAPE, or mixed

---

## Reception (`/recepcion`)

- **Pensionista flow**: Scan QR or enter code to identify pensionista
- **QR Scanner**: Uses BarcodeDetector API (Chrome/Edge) with camera access
- **Manual entry**: Text input for QR token code (PEN-XXXXX)
- **Consumption registration**: Auto-detects meal type by time, registers consumption
- **Meal schedule**: DESAYUNO (6-10h), ALMUERZO (11:30-15h), CENA (17:30-21h)
- Validates: duplicate meals, inactive accounts, insufficient balance

---

## Pensionista App (`/pensionista`)

Mobile-first app for pensionistas with dedicated context and bottom navigation.

### `/pensionista/login` - Pensionista Login
- DNI as email + password (default password = DNI)
- Only allows `role === "pensioner"` to proceed
- Redirects to onboarding if `first_login === true`

### `/pensionista/onboarding` - First Login Setup
- Optional email + password change
- "Omitir" (skip) button to proceed without changes
- Both paths set `first_login = false`

### `/pensionista` - Dashboard
- Welcome message, balance card
- Today's meal status (3 circles: consumed/pending)
- Quick links to QR and history

### `/pensionista/qr` - QR Code Display
- Shows `qr_token` prominently for scanning by receptionist
- Copy-to-clipboard functionality
- User info and type badge

### `/pensionista/consumo` - Consumption History
- Stats: total consumed, total charged
- Today's timeline
- History grouped by date with meal badges

### `/pensionista/profile` - Profile & Settings
- View/edit email and password
- View QR token, balance, type
- Dark mode toggle
- Logout

### Context: `app/pensionista/context.tsx`
- `PensionerProvider` wraps all pensionista pages
- Fetches user from `/api/proxy?path=/auth/me`
- Provides: `user`, `loading`, `refreshUser`, `logout`
- Redirects to login on 401

---

## Client Menu (`/menu`)

- Public-facing menu for customers (accessed via QR code)
- Shows only visible products from the active menu
- Cart system (cart-context.tsx)
- No authentication required

---

## State Management

- **No global state library** (no Redux, Zustand, etc.)
- Uses React Context for: Auth (`auth-context.tsx`), Cart (`cart-context.tsx`), Pensionista (`app/pensionista/context.tsx`)
- Page-level state with `useState` + `useEffect` for data fetching
- Pattern: fetch on mount, re-fetch after mutations (`fetchData()` pattern)

---

## Notification Pattern

All pages use `sonner` for toast notifications:
```tsx
import { toast } from "sonner";

toast.success("Producto agregado");
toast.error("Error al eliminar");
```

The `<Toaster>` component is placed in each page that uses toasts (top-right, richColors).

---

## Environment Variables

```env
BACKEND_URL=http://localhost:4000    # Backend API base URL (server-side only)
```

---

## Development Commands

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint check
npx tsc --noEmit   # Type check
```

---

## Key Patterns & Conventions

1. **"use client"** - All interactive pages use client components (state, effects, event handlers)
2. **Responsive design** - Mobile-first with `md:` breakpoint for desktop (cards on mobile, tables on desktop)
3. **Form handling** - Controlled inputs with `useState`, `FormData` for file uploads
4. **Loading states** - `useState(true)` initialized loading, skeleton/text placeholders
5. **Error handling** - try/catch with toast.error() for user feedback
6. **No SSR data fetching** - All data fetched client-side in `useEffect`
