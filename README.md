# Expense Tracker

A minimal full-stack expense tracking application built with Node.js, Express, SQLite, and React (Vite).

## Features
- **Add Expenses**: Record amount, category, description, and date.
- **View List**: See all expenses sorted by date or time added.
- **Filter**: Filter expenses by category.
- **Total**: Real-time total calculation of visible expenses.
- **Resilience**: API handles duplicate requests (network retries) via idempotency keys.

## Getting Started

### Prerequisites
- Node.js (v14.17.3+ or v16+)
- npm

### 1. Backend
Runs on Port `3001`.
```bash
cd server
npm install
node index.js
```

### 2. Frontend
Runs on Port `5173`.
```bash
cd client
npm install
npm run dev
```

## api Design
- **GET /expenses**: Returns JSON list. Supports `?category=Food` and `?sort=date_desc`.
- **POST /expenses**: Expects JSON body with `amount`, `category`, `description`, `date`, and `idempotencyKey`. Returns `201 Created` or `200 OK` (if idempotent retry).

## Design Decisions
- **Persistence**: **SQLite** was chosen for zero-configuration persistence. It's file-based (`expenses.db`), verifying the "real-world" requirement without needing a separate DB process.
- **Idempotency**: The client generates a UUID `idempotencyKey` for every new form entry. If the request fails (network error) and the client (or user) retries, the server checks this key. If it exists, it returns the existing record instead of creating a duplicate. This satisfies the resilience requirement.
- **Frontend Stack**: Used **React** with **Vite** for a fast development loop. Downgraded to Vite 2.x to support Node.js v14 environment constraints.
- **Styling**: **Vanilla CSS** with a robust variable system (`index.css`) for consistent dark-mode aesthetics without the overhead of Tailwind/Sass for this scope.

## Trade-offs & Limitations
- **Validation**: Basic server-side validation exists, but comprehensive schema validation (e.g., Zod/Joi) was skipped for speed.
- **Tests**: A custom script `scripts/verify-idempotency.js` verifies the core resilience requirement, but full unit/integration test coverage (Jest/Cypress) is omitted.
- **UI State**: Form state is local. In a larger app, React Query or Context would act as a global store.

## Future Improvements
- Pagination for the expense list.
- User authentication.
- Monthly/Weekly summary charts.