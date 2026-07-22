# Trackmii Backend

Personal expense tracker REST API. Track spending, set budgets, receive alerts, and analyze financial habits.

## Overview

Trackmii is a production-ready backend service for manual expense tracking with intelligent budget management. Users log expenses, organize by categories, set monthly budgets, and receive automated threshold alerts at 80% (warning) and 100% (exceeded).

**Why it exists:** Manual expense tracking is tedious without actionable insights. Trackmii simplifies logging and provides real-time budget alerts to prevent overspending.

**Users:** Individuals seeking better financial awareness and control over personal spending.

## Architecture

Modular monolith with clear separation of concerns:

- **HTTP Layer:** NestJS controllers → ValidationPipe validates DTOs
- **Business Logic:** Services contain all domain logic (budget calculations, notifications, alerts)
- **Data Access:** Data Access: TypeORM repositories backed by PostgreSQL (Supabase) with TypeScript entities
- **Authentication:** JWT strategy validates tokens, JwtAuthGuard enforces protected routes
- **Response Handling:** TransformInterceptor wraps responses, HttpExceptionFilter catches errors

**Key Design Patterns:**

- DTOs separate request/response contracts from entities
- Service layer isolated from controllers
- Soft delete (is_deleted flag) for expense recovery
- Notification deduplication prevents duplicate budget alerts
- User-scoped queries ensure data isolation

## Features

- **Authentication:** Email/password registration, login, password reset
- **User Management:** Profile updates, currency/timezone/dark mode preferences
- **Expense Tracking:** Manual CRUD with soft delete, pagination (20/page), rich filtering (category, payment method, date range, amount, search), sorting
- **Categories:** 9 system defaults + custom categories with hex colors
- **Budgets:** Monthly overall + per-category budgets with auto-calculated spent amounts
- **Budget Alerts:** Notifications at 80% (warning) and 100% (exceeded), deduplicated
- **Analytics:** Dashboard stats, monthly/weekly trends, category breakdown
- **CSV Export:** Download filtered expenses
- **In-App Notifications:** Budget alerts with read/unread tracking
- **Rate Limiting:** 5 req/min auth, 100 req/min general
- **Global Error Handling:** Uniform error responses

## Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Language         | TypeScript                         |
| Framework        | NestJS 10+                         |
| Runtime          | Node.js 18+                        |
| Database         | PostgreSQL (Supabase)              |
| ORM              | TypeORM                            |
| Auth             | JWT + Passport                     |
| Validation       | class-validator, class-transformer |
| API Docs         | Swagger/OpenAPI                    |
| Hashing          | bcrypt (cost 12)                   |
| Package Manager  | pnpm 8+                            |
| Containerization | Docker, Docker Compose             |

## Project Structure

src/
├── main.ts
├── app.module.ts
├── config/
│ ├── database.config.ts
│ ├── jwt.config.ts
│ └── swagger.config.ts
├── common/
│ ├── decorators/ (current-user, public)
│ ├── guards/ (jwt-auth)
│ ├── filters/ (http-exception)
│ ├── interceptors/ (transform)
│ ├── pipes/ (validation)
│ ├── enums/ (currency, payment-method, notification-type)
│ └── utils/ (date calculations)
└── modules/
├── auth/ (register, login, reset password)
├── users/ (profile, preferences)
├── categories/ (CRUD, system defaults)
├── expenses/ (CRUD, filtering, pagination, budget checks)
├── budgets/ (CRUD, spent calculations, threshold alerts)
├── notifications/ (CRUD, deduplication)
├── analytics/ (dashboard, trends, breakdown)
└── export/ (CSV generation)

Each module contains: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.entity.ts`, `dto/`.

## Installation

```bash
# Clone
git clone https://github.com/yourusername/trackmii-backend.git
cd trackmii-backend

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# (Optional) Start PostgreSQL locally with Docker
docker compose up -d

# Start dev server
pnpm start:dev
```

API: `http://localhost:3000/api/v1`
Docs: `http://localhost:3000/api/v1/docs`

## Environment Variables

| Variable         | Purpose                      | Example                 |
| ---------------- | ---------------------------- | ----------------------- |
| `NODE_ENV`       | Runtime                      | `development`           |
| `PORT`           | Server port                  | `3000`                  |
| `DB_HOST`        | PostgreSQL host              | `localhost`             |
| `DB_PORT`        | PostgreSQL port              | `3306`                  |
| `DB_USERNAME`    | PostgreSQL user              | `root`                  |
| `DB_PASSWORD`    | PostgreSQL password          | `rootpassword`          |
| `DB_DATABASE`    | PostgreSQL database          | `trackmii`              |
| `JWT_SECRET`     | Token signing (min 32 chars) | `your-secret-key-here`  |
| `JWT_EXPIRATION` | Token lifetime               | `7d`                    |
| `FRONTEND_URL`   | CORS origin                  | `http://localhost:5173` |

## Running

```bash
pnpm start:dev        # Development (hot reload)
pnpm build            # Build
pnpm start:prod       # Production
pnpm start:debug      # Debug mode
pnpm lint             # Lint
pnpm format           # Format code
```

## API Endpoints

All protected endpoints require `Authorization: Bearer <token>` header.

### Auth

POST /api/v1/auth/register → Register user, get JWT
POST /api/v1/auth/login → Login, get JWT
POST /api/v1/auth/forgot-password → Request password reset
POST /api/v1/auth/reset-password → Reset password with token

### Users

GET /api/v1/users/profile → Get profile
PUT /api/v1/users/profile → Update name/email
PUT /api/v1/users/preferences → Update currency/timezone/dark_mode

### Categories

POST /api/v1/categories → Create custom category
GET /api/v1/categories → Get all (system + custom)
GET /api/v1/categories/:id → Get single
PUT /api/v1/categories/:id → Update (blocks system defaults)
DELETE /api/v1/categories/:id → Delete (blocks if has expenses)

### Expenses

POST /api/v1/expenses → Create expense
GET /api/v1/expenses → Get all (paginated, filterable)
GET /api/v1/expenses/:id → Get single
PUT /api/v1/expenses/:id → Update expense
DELETE /api/v1/expenses/:id → Soft delete
DELETE /api/v1/expenses/bulk → Bulk soft delete

**Query params:** `page`, `limit`, `category_id`, `payment_method`, `start_date`, `end_date`, `min_amount`, `max_amount`, `search`, `sort_by` (date/amount), `sort_order` (ASC/DESC)

### Budgets

POST /api/v1/budgets → Create budget
GET /api/v1/budgets → Get all (filterable)
GET /api/v1/budgets/current-month → Get current month
GET /api/v1/budgets/:id → Get single
PUT /api/v1/budgets/:id → Update
DELETE /api/v1/budgets/:id → Delete

### Analytics

GET /api/v1/analytics/dashboard → Dashboard stats
GET /api/v1/analytics/monthly?months=6 → Monthly trends
GET /api/v1/analytics/weekly?weeks=8 → Weekly trends
GET /api/v1/analytics/category-breakdown → Category breakdown (filterable by date)

### Notifications

GET /api/v1/notifications → Get notifications (filterable by is_read)
GET /api/v1/notifications/unread-count → Get unread count
PUT /api/v1/notifications/mark-read → Mark as read

### Export

GET /api/v1/export/csv → Download CSV (filterable by all expense filters)

## Request/Response Examples

**Register**

```json
POST /api/v1/auth/register
{
  "name": "Deran",
  "email": "deran@example.com",
  "password": "SecurePass123"
}

Response 201:
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "access_token": "eyJhbGc...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Deran",
      "email": "deran@example.com",
      "currency": "NGN",
      "timezone": "Africa/Lagos",
      "dark_mode": false
    }
  }
}
```

**Create Expense**

```json
POST /api/v1/expenses
Authorization: Bearer <token>
{
  "title": "Lunch",
  "amount": 5000,
  "currency": "NGN",
  "category_id": "550e8400-...",
  "payment_method": "CARD",
  "expense_date": "2026-04-20",
  "note": "Groceries"
}

Response 201:
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "550e8400-...",
    "title": "Lunch",
    "amount": 5000,
    "currency": "NGN",
    "payment_method": "CARD",
    "expense_date": "2026-04-20",
    "category": {
      "id": "550e8400-...",
      "name": "Food & Dining",
      "color": "#FF5733"
    },
    "note": "Groceries",
    "created_at": "2026-04-20T10:00:00.000Z",
    "updated_at": "2026-04-20T10:00:00.000Z"
  }
}
```

**Get Expenses (Paginated)**

```json
GET /api/v1/expenses?page=1&limit=20&category_id=<id>&sort_by=date&sort_order=DESC
Authorization: Bearer <token>

Response 200:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "data": [...],
    "meta": {
      "total": 47,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Dashboard Stats**

```json
GET /api/v1/analytics/dashboard
Authorization: Bearer <token>

Response 200:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "total_spent_all_time": 850000,
    "current_month_spent": 125000,
    "current_month_budget": 200000,
    "budget_usage_percentage": 62.50,
    "top_category": {
      "name": "Food & Dining",
      "color": "#FF5733",
      "amount": 45500
    }
  }
}
```

## Authentication Flow

**Register:**

1. Submit email, password, name
2. Backend hashes password (bcrypt cost 12)
3. User created with defaults (NGN, Africa/Lagos, dark_mode=false)
4. JWT generated (7-day expiration)
5. Token + user returned

**Login:**

1. Submit email, password
2. Backend validates credentials
3. JWT generated
4. Token + user returned

**Token Usage:**

- Store in localStorage or HTTP-only cookie
- Include in `Authorization: Bearer <token>` header
- JwtAuthGuard validates signature and expiration on every request
- JwtStrategy decodes and fetches fresh user from database

## Database Design

### Entities

**User:** id (UUID), name, email (unique), hashed password, currency, timezone, dark_mode, verification tokens, reset tokens, timestamps

**Category:** id, user_id (null = system default), name, color, is_default, created_at

**Expense:** id, user_id, category_id (nullable), title, amount, currency, payment_method, expense_date (DATE only), note, is_deleted (soft delete), timestamps. Indexes: (user_id, expense_date), (user_id, category_id)

**Budget:** id, user_id, category_id (nullable), amount, currency, month (1-12), year. Unique: (user_id, category_id, month, year)

**Notification:** id, user_id, type (enum), title, message, is_read, created_at. Index: (user_id, is_read)

### Key Constraints

- Soft delete: Expenses marked is_deleted=true, never hard deleted
- Currency isolation: Each expense stores own currency; user default doesn't affect history
- Budget deduplication: Unique constraint prevents duplicate monthly budgets per category
- Timezone awareness: Expense dates are user-local (DATE type); timezone stored per user
- Notification deduplication: Checked before creation to prevent duplicate alerts

## Error Handling

All errors return JSON format:

```json
{
  "statusCode": 400,
  "message": "error message",
  "error": "ExceptionName"
}
```

**Common Status Codes:**

- 400: Invalid request (validation failed)
- 401: Unauthorized (missing/invalid JWT)
- 403: Forbidden (insufficient permissions, e.g., delete system category)
- 404: Not found (resource doesn't exist)
- 409: Conflict (duplicate email, budget already exists)
- 500: Internal server error

**Validation Errors:**

```json
{
  "statusCode": 400,
  "message": ["amount must be positive", "currency must be NGN, USD, or GBP"],
  "error": "BadRequestException"
}
```

## Postman Testing

1. **Import Collection:**
   - Postman → Import → Select `ProjectAPI.postman_collection.json`

2. **Configure Environment:**
   - Postman → Environments → Import → Select `Local.postman_environment.json`
   - Edit → Set `base_url = http://localhost:3000/api/v1`

3. **Authenticate:**
   - Run POST `/auth/register` or `/auth/login`
   - Copy `access_token` from response
   - Environments → Add variable `token` with token value
   - Collection Authorization → Type: Bearer Token → `{{token}}`

4. **Test Order:**
   - Auth (register/login)
   - Users (profile, preferences)
   - Categories (create, get)
   - Expenses (create, filter, paginate)
   - Budgets (create, get current month)
   - Analytics (dashboard, trends)
   - Export (CSV)

## Security

- **Input Validation:** class-validator on all DTOs; unknown properties rejected
- **Password Security:** Bcrypt cost 12; never logged
- **JWT:** Secret from environment; signature verified every request
- **SQL Injection:** TypeORM parameterized queries
- **User Isolation:** user_id checked on all queries
- **Rate Limiting:** 5 req/min auth, 100 req/min general
- **CORS:** Restricted to FRONTEND_URL env variable
- **Error Messages:** Stack traces hidden in production

## Deployment

### Docker

```bash
docker build -t trackmii-backend:1.0 .
docker run -p 3000:3000 -e DB_HOST=mysql trackmii-backend:1.0
```

### Docker Compose

```bash
docker compose up -d
docker compose logs -f app
docker compose down
```

### Deployed

Backend: Render
Frontend: Vercel
Database: Supabase PostgreSQL

## Known Limitations

- No recurring expenses
- No receipt uploads
- No OAuth (email/password only)
- No admin panel
- No PDF export
- Weekly/monthly summary emails deferred

## Testing

```bash
pnpm test              # Unit tests
pnpm test:e2e          # Integration tests
pnpm test:cov          # Coverage
```

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/name`
5. Open pull request

## License

MIT License - See LICENSE file for details.

Permits: Commercial use, private use, distribution, modification.
Requires: License and copyright notice included.

## Author

**Chidera Nwogu**

- GitHub: [Dera2k](https://github.com/Dera2k)
- Email: dera_nwogu@yahoo.com

---

Built with ❤️ using NestJS and TypeScript
