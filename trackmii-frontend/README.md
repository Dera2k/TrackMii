# Trackmii

Smart expense tracker with budgets, analytics and insights.

## Features

- Track expenses by category and payment method
- Set monthly budgets and get alerts when you're close to limit
- View spending analytics with charts and trends
- Export data to XLSX
- Dark mode support
- Multi-currency support

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, MySQL, TypeORM
- **State**: React Query, Zustand

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL

### Frontend

```bash
cd trackmii-frontend
pnpm install
pnpm run dev
```

Frontend runs on `http://localhost:3001`

### Backend

```bash
cd trackmii-backend
pnpm install
pnpm dev
```

Backend runs on `http://localhost:3000`

### Database

Create a `.env` file in `trackmii-backend`:
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_DATABASE=trackmii
Then seed data:

```bash
pnpm run seed
```

## Environment Variables

**Frontend** (`trackmii-frontend/.env.local`):
NEXT_PUBLIC_API_URL=http://localhost:3000

**Backend** (`trackmii-backend/.env`):
NODE_ENV=development

PORT=3000

DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=rootpassword
DB_DATABASE=trackmii
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:3001

## Deploy

[aadd deployment links after deploying]
