# Project Structure

This project follows a **scalable, domain-oriented React architecture** designed for
**React + TypeScript + Vite** applications.

The goal is to keep **routing, UI, business logic, and infrastructure concerns clearly separated**.

---

## `src/` Directory Layout

src/
├── app/
│ ├── App.tsx
│ ├── main.tsx
│ ├── router.tsx
│ └── providers.tsx
│
├── pages/
│ ├── Home/
│ │ ├── Home.tsx
│ │ └── index.ts
│ ├── Login/
│ │ ├── Login.tsx
│ │ └── index.ts
│ └── NotFound/
│ ├── NotFound.tsx
│ └── index.ts
│
├── components/
│ ├── ui/
│ │ ├── Button/
│ │ │ ├── Button.tsx
│ │ │ └── index.ts
│ │ └── Modal/
│ ├── layout/
│ │ ├── Header.tsx
│ │ └── Footer.tsx
│ └── common/
│
├── features/
│ ├── auth/
│ │ ├── api.ts
│ │ ├── hooks.ts
│ │ ├── types.ts
│ │ └── index.ts
│ └── cart/
│
├── hooks/
│ ├── useAuth.ts
│ └── useDebounce.ts
│
├── services/
│ ├── http.ts
│ └── auth.service.ts
│
├── store/
│ ├── index.ts
│ └── auth.store.ts
│
├── styles/
│ ├── globals.css
│ └── variables.css
│
├── assets/
│ ├── images/
│ ├── icons/
│ └── fonts/
│
├── utils/
│ ├── formatDate.ts
│ └── constants.ts
│
├── types/
│ └── api.ts
│
└── tests/
├── setup.ts
└── mocks.ts

---

## Folder Responsibilities

### `app/`

Application bootstrapping and global wiring.

- **`main.tsx`** – React entry point
- **`App.tsx`** – Application shell
- **`router.tsx`** – Route definitions
- **`providers.tsx`** – Global providers (Context, QueryClient, Theme, etc.)

This folder should contain **no business logic**.

---

### `pages/`

Route-level components.

- Each folder represents a **single route**
- Pages compose features and components
- Pages are the **only place aware of routing**

Example:

- `/login` → `pages/Login/Login.tsx`

---

### `components/`

Reusable UI components.

- **`ui/`** – Design system components (Button, Modal, Input)
- **`layout/`** – Structural components (Header, Footer, Sidebar)
- **`common/`** – App-specific reusable components

Components should be **stateless or minimally stateful**.

---

### `features/`

Domain-driven business logic.

Each feature contains everything related to a domain:

- API calls
- Hooks
- Types
- Feature-specific logic

Example:

- `features/auth` handles authentication logic only
- Promotes isolation and testability

---

### `hooks/`

Generic reusable hooks not tied to a single feature.

Examples:

- `useDebounce`
- `useLocalStorage`

---

### `services/`

Infrastructure and external integrations.

- HTTP clients
- API service wrappers
- Third-party SDK configuration

These should be **framework-agnostic** where possible.

---

### `store/`

Global state management.

- Zustand / Redux / Jotai stores
- Split by domain for scalability

---

### `styles/`

Global styles only.

- CSS variables
- Resets
- Global theming

Component-specific styles live **next to components**.

---

### `assets/`

Static assets.

- Images
- Icons
- Fonts

---

### `utils/`

Pure utility functions and constants.

- Formatting helpers
- Constants
- Non-React logic

---

### `types/`

Shared TypeScript types.

- API contracts
- Shared interfaces and enums

---

### `tests/`

Test configuration and utilities.

- Global test setup
- Mocks
- Shared test helpers

---

## Architecture Principles

- **Separation of concerns**
- **Domain-driven structure**
- **Scales without becoming messy**
- **Easy to test**
- **Easy to reason about**

---

## Notes

- Pages must be registered in `router.tsx`
- Business logic belongs in `features/`
- UI logic belongs in `components/`
- Global wiring belongs in `app/`

---
