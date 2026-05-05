# Trackmii Backend

REST API for tracking personal expenses. Built with NestJS and MySQL.

## What it does

Track your spending, set budgets and get insights on where your money goes. Pretty straightforward expense tracker with categories, monthly budgets, and notifications when you're about to blow past your limits.

## Stack

- NestJS + TypeScript
- MySQL 8.0
- TypeORM for database stuff
- JWT authentication
- Swagger docs

## Setup

You'll need Node 18+ and pnpm installed.

```bash
# Install dependencies
pnpm install

# Copy the env file and fill in your details
cp .env.example .env
```

## Environment Setup

Edit `.env` with your config:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=rootpassword
DB_DATABASE=trackmii

JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d

FRONTEND_URL=http://localhost:5173
```

**Important**: Use a real secret for `JWT_SECRET` in production (32+ characters).

## Running It

Start the database:

```bash
docker compose up -d
```

Run the app:

```bash
# Development mode with hot reload
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

The API runs on `http://localhost:3000` and docs are at `http://localhost:3000/api/v1/docs`.

## How It Works

All routes are versioned under `/api/v1/`. Here's what you can do:

- **Auth** - Register, login, password reset
- **Expenses** - Add/edit/delete expenses with pagination and filters
- **Categories** - 9 built-in categories + create your own with custom colors
- **Budgets** - Set monthly spending limits (overall or per-category)
- **Analytics** - Dashboard stats, spending trends, category breakdown
- **Notifications** - Get warned at 80% budget, alerted at 100%
- **Export** - Download your expenses as CSV

## Project Layout

src/
├── config/ # DB, JWT, Swagger config
├── common/ # Shared stuff (guards, enums, decorators)
└── modules/ # Feature modules
├── auth/
├── users/
├── categories/
├── expenses/
├── budgets/
├── analytics/
├── notifications/
└── export/

## Notes

- Expenses are soft-deleted (can be recovered later)
- Each expense stores its own currency - changing your default won't mess up old records
- Budgets are monthly and don't roll over
- System categories can't be deleted (but you can add your own)
- Dates are stored in your timezone, so "today" means today for you

## Scripts

```bash
pnpm start:dev    # Development server
pnpm build        # Production build
pnpm lint         # Check code
pnpm format       # Format code
```

## License

MIT
