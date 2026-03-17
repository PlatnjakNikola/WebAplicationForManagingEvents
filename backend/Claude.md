# Backend

# Theatrum Backend — CLAUDE.md

-----

## STACK

Express.js + TypeScript + Prisma + SQL Server (Azure SQL Edge Docker) + Zod + JWT + Argon2id + Pino

-----

## PROJECT STRUCTURE

```
backend/
├── CLAUDE.md                     ← THIS FILE
├── src/
│   ├── app.ts                    # Express app (middleware chain, route mounting)
│   ├── server.ts                 # Entry: dotenv → app.listen
│   ├── config/
│   │   └── env.ts                # Zod-validated env vars
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   ├── theater.routes.ts
│   │   ├── reservation.routes.ts
│   │   └── review.routes.ts
│   ├── controllers/              # Parse request → call service → send response
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── theater.controller.ts
│   │   ├── reservation.controller.ts
│   │   └── review.controller.ts
│   ├── services/                 # Business logic → Prisma calls → return data
│   │   ├── auth.service.ts
│   │   ├── event.service.ts
│   │   ├── theater.service.ts
│   │   ├── reservation.service.ts
│   │   └── review.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verify → attach user to req
│   │   ├── role.middleware.ts     # requireRole("admin") factory
│   │   ├── validate.middleware.ts # validate(zodSchema) factory
│   │   ├── error.middleware.ts    # Global error handler (LAST middleware)
│   │   └── rateLimiter.ts        # express-rate-limit configs
│   ├── validators/               # Zod schemas for request bodies/queries
│   │   ├── auth.schema.ts
│   │   ├── event.schema.ts
│   │   ├── theater.schema.ts
│   │   ├── reservation.schema.ts
│   │   ├── review.schema.ts
│   │   └── query.schema.ts       # Shared pagination/filter schemas
│   ├── mappers/                  # DB shape → Frontend-expected JSON shape
│   │   ├── event.mapper.ts
│   │   ├── theater.mapper.ts
│   │   ├── reservation.mapper.ts
│   │   ├── review.mapper.ts
│   │   └── user.mapper.ts
│   ├── types/
│   │   ├── express.d.ts          # Extend Express Request with user: { sub, role }
│   │   └── api.types.ts          # Response types matching frontend/src/types/index.ts
│   └── utils/
│       ├── logger.ts             # Pino structured logger
│       ├── AppError.ts           # Custom error class with statusCode + code
│       └── pagination.ts         # buildPaginatedResponse() helper
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # Seeds DB from frontend mock data
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── .env.example
├── tsconfig.json
└── package.json
```

-----

## ARCHITECTURE FLOW

```
Request
  → cors(CORS_ORIGIN)
  → helmet()
  → rateLimiter (global: 100/15min)
  → express.json({ limit: "1mb" })
  → pinoHttp(logger)
  → /api/v1/health → { status: "ok", timestamp }
  → /api/v1/auth   → authRateLimiter (10/15min) → authRoutes
  → /api/v1/*      → authMiddleware → routes
  → errorMiddleware (global catch-all, LAST)
```

-----

## CRITICAL: FRONTEND CONTRACT

The frontend (`frontend/src/types/index.ts`) defines these exact types. The backend MUST return data matching these shapes. All IDs are **strings**. All field names are **English camelCase**.

```typescript
// Frontend expects these EXACT shapes

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
}

interface Theater {
  id: string
  name: string
  address: string
  description: string
  capacity: number
  contact: string
  workingHours: string
  latitude: number
  longitude: number
}

interface Event {
  id: string
  title: string
  description: string
  date: string           // "2026-03-20" (YYYY-MM-DD)
  time: string           // "19:30" (HH:mm)
  theaterId: string      // Theater ID (NOT hall ID)
  theaterName: string    // Theater name (resolved via hall→theater join)
  pricePerTicket: number
  totalSeats: number
  availableSeats: number // COMPUTED: totalSeats - confirmed reservations
  imageUrl: string
  duration: string       // "2h 30min" (formatted from minutes)
}

interface Reservation {
  id: string
  userId: string
  eventId: string
  eventTitle: string     // JOIN: event.title
  theaterName: string    // JOIN: event→hall→theater.name
  date: string           // JOIN: event.dateTime → "YYYY-MM-DD"
  time: string           // JOIN: event.dateTime → "HH:mm"
  numberOfTickets: number
  totalPrice: number
  status: 'confirmed' | 'cancelled'
  createdAt: string      // ISO datetime
}

interface Review {
  id: string
  userId: string
  userName: string       // COMPUTED: user.firstName + " " + user.lastName
  userEmail: string      // JOIN: user.email
  eventId: string
  eventTitle: string     // JOIN: event.title
  theaterName: string    // JOIN: event→hall→theater.name
  rating: number         // 1-5
  comment?: string
  createdAt: string      // ISO datetime
}
```

-----

## FRONTEND AXIOS CONFIG

The frontend uses `src/lib/axios.ts`:

- Base URL: `http://localhost:3000/api` (from VITE_API_URL env or default)
- Auto-attaches `Authorization: Bearer <token>` from localStorage
- On 401 response: clears token, redirects to /login

The backend must serve on port 3000, prefix all routes with `/api/v1`.

-----

## DATABASE SCHEMA (Prisma)

The SQL Server database uses Croatian column/table names. Use `@@map` / `@map` to expose English names in Prisma while keeping DB unchanged.

**IMPORTANT**: The DB has a Hall (Dvorana) table between Theater and Event. But the frontend only knows about `theaterId` on events — it does NOT know about halls. The mapper must resolve `event.hall.theater.id` → `theaterId` and `event.hall.theater.name` → `theaterName`.

For MVP: each theater has ONE default hall. The admin creates events with `theaterId`, and the service auto-resolves it to the hall.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

model User {
  id           Int           @id @default(autoincrement()) @map("Id")
  email        String        @unique @map("Email")
  password     String        @map("Lozinka")
  firstName    String        @map("Ime")
  lastName     String        @map("Prezime")
  role         String        @default("user") @map("Uloga")
  createdAt    DateTime      @default(now()) @map("KreiranoU")
  reservations Reservation[]
  reviews      Review[]

  @@map("Korisnik")
}

model Theater {
  id           Int      @id @default(autoincrement()) @map("Id")
  name         String   @map("Naziv")
  address      String   @map("Adresa")
  description  String   @map("Opis")
  capacity     Int      @map("Kapacitet")
  contact      String   @map("Kontakt")
  workingHours String   @map("RadnoVrijeme")
  latitude     Float    @default(0) @map("Lat")
  longitude    Float    @default(0) @map("Lng")
  halls        Hall[]

  @@map("Kazaliste")
}

model Hall {
  id        Int     @id @default(autoincrement()) @map("Id")
  name      String  @map("Naziv")
  seats     Int     @map("BrojMjesta")
  theaterId Int     @map("KazalisteId")
  theater   Theater @relation(fields: [theaterId], references: [id])
  events    Event[]

  @@map("Dvorana")
}

model Event {
  id           Int           @id @default(autoincrement()) @map("Id")
  title        String        @map("Naziv")
  description  String?       @map("Opis")
  dateTime     DateTime      @map("DatumVrijeme")
  duration     Int           @map("Trajanje")
  price        Float         @map("Cijena")
  totalSeats   Int           @map("UkupnoMjesta")
  imageUrl     String?       @map("SlikaUrl")
  hallId       Int           @map("DvoranaId")
  hall         Hall          @relation(fields: [hallId], references: [id])
  reservations Reservation[]
  reviews      Review[]

  @@map("Dogadaj")
}

model Reservation {
  id              Int      @id @default(autoincrement()) @map("Id")
  numberOfTickets Int      @map("BrojKarata")
  totalPrice      Float    @map("UkupnaCijena")
  status          String   @default("confirmed") @map("Status")
  createdAt       DateTime @default(now()) @map("KreiranoU")
  userId          Int      @map("KorisnikId")
  eventId         Int      @map("DogadajId")
  user            User     @relation(fields: [userId], references: [id])
  event           Event    @relation(fields: [eventId], references: [id])

  @@map("Rezervacija")
}

model Review {
  id        Int      @id @default(autoincrement()) @map("Id")
  rating    Int      @map("Ocjena")
  comment   String?  @map("Komentar")
  createdAt DateTime @default(now()) @map("KreiranoU")
  userId    Int      @map("KorisnikId")
  eventId   Int      @map("DogadajId")
  user      User     @relation(fields: [userId], references: [id])
  event     Event    @relation(fields: [eventId], references: [id])

  @@map("Recenzija")
}
```

-----

## API ENDPOINTS

Base: `/api/v1`

### Error format (all errors)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

Error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`

### Paginated response format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 57,
    "totalPages": 5
  }
}
```

-----

### AUTH

|Method|Path            |Auth  |Rate Limit|
|------|----------------|------|----------|
|POST  |`/auth/register`|Public|10/15min  |
|POST  |`/auth/login`   |Public|10/15min  |
|GET   |`/auth/me`      |Token |Global    |

**POST /auth/register**

```
Request:  { email, password, firstName, lastName }
Response: 201 { message: "Registration successful" }
```

Validation: email (valid, lowercase, trimmed), password (min 8, 1 upper, 1 lower, 1 digit), firstName (min 2, trimmed), lastName (min 2, trimmed).
Service: Check unique email → Argon2id hash → create user with role “user”.

**POST /auth/login**

```
Request:  { email, password }
Response: 200 { token: "eyJ...", user: { id, email, firstName, lastName, role } }
```

Service: Find by email → Argon2id verify → JWT sign (sub: userId, role) → return token + user object.
JWT config: HS256, 24h expiry (MVP — 15min + refresh later), secret from env.

**GET /auth/me**

```
Response: 200 { id, email, firstName, lastName, role }
```

Returns current user from JWT payload + DB lookup.

-----

### EVENTS

|Method|Path         |Auth |
|------|-------------|-----|
|GET   |`/events`    |Token|
|GET   |`/events/:id`|Token|
|POST  |`/events`    |Admin|
|PUT   |`/events/:id`|Admin|
|DELETE|`/events/:id`|Admin|

**GET /events**

```
Query: ?page=1&limit=12&search=hamlet&theaterId=1&sort=date_asc&dateFrom=2026-03-01&dateTo=2026-04-30
Response: Paginated<Event[]>
```

- `search`: LIKE on title and description
- `theaterId`: filter via event→hall→theater.id
- `sort`: date_asc (default), date_desc, price_asc, price_desc
- `limit`: default 12, max 50
- Each event includes computed `availableSeats`

**GET /events/:id**

```
Response: Event (single object, same shape as list item)
```

**POST /events** (Admin)

```
Request: {
  title: string,
  description?: string,
  date: "YYYY-MM-DD",
  time: "HH:mm",
  theaterId: number,       // Frontend sends theaterId, service resolves to hallId
  pricePerTicket: number,
  totalSeats: number,
  duration: number,        // Minutes (integer)
  imageUrl?: string
}
Response: 201 Event
```

Service: find first hall for theaterId → combine date+time into dateTime → create event with hallId.

**PUT /events/:id** (Admin)
Same request body as POST. Service: same theaterId→hallId resolution.

**DELETE /events/:id** (Admin)
Response: 204 No Content.

-----

### THEATERS

|Method|Path           |Auth |
|------|---------------|-----|
|GET   |`/theaters`    |Token|
|GET   |`/theaters/:id`|Token|
|POST  |`/theaters`    |Admin|
|PUT   |`/theaters/:id`|Admin|
|DELETE|`/theaters/:id`|Admin|

**GET /theaters**

```
Response: Theater[] (NOT paginated — small dataset)
```

**GET /theaters/:id**

```
Response: { ...Theater, events: Event[] }  // Upcoming events at this theater
```

Events filtered to dateTime > now, sorted by dateTime ascending.

**POST /theaters** (Admin)

```
Request: { name, address, description, capacity, contact, workingHours }
Response: 201 Theater
```

NOTE: Frontend AdminTheaters form does NOT have latitude/longitude fields. Default to 0, 0.
Service: create theater → also create one default Hall (name: “Glavna dvorana”, seats: theater.capacity).

**PUT /theaters/:id** (Admin)
Same as POST. Also updates default hall seats if capacity changed.

**DELETE /theaters/:id** (Admin)
Response: 204. Cascade delete halls, or reject if events exist.

-----

### RESERVATIONS

|Method|Path                            |Auth |
|------|--------------------------------|-----|
|GET   |`/reservations`                 |Token|
|POST  |`/reservations`                 |Token|
|PATCH |`/reservations/:id/cancel`      |Token|
|GET   |`/admin/reservations`           |Admin|
|PATCH |`/admin/reservations/:id/cancel`|Admin|

**GET /reservations**

```
Response: Reservation[] (current user only, sorted by createdAt DESC)
```

Service: where userId = req.user.sub. Joins event→hall→theater for eventTitle, theaterName, date, time.

**POST /reservations**

```
Request: { eventId: number, numberOfTickets: number }
Response: 201 Reservation
```

Validation: numberOfTickets 1-10 integer.
Service (in transaction):

1. Find event (check exists, dateTime > now)
1. Count confirmed reservations → compute availableSeats
1. Check availableSeats >= numberOfTickets
1. Calculate totalPrice = numberOfTickets × event.price
1. Create reservation (status: “confirmed”)

**PATCH /reservations/:id/cancel**

```
Response: 200 Reservation (updated)
```

Service: find reservation → check userId matches req.user.sub → check status is “confirmed” → update status to “cancelled”.

**GET /admin/reservations**

```
Response: Reservation[] (all, sorted by createdAt DESC)
```

**PATCH /admin/reservations/:id/cancel**
Same as user cancel but without ownership check.

-----

### REVIEWS

|Method|Path            |Auth |
|------|----------------|-----|
|GET   |`/reviews`      |Token|
|POST  |`/reviews`      |Token|
|DELETE|`/reviews/:id`  |Token|
|GET   |`/admin/reviews`|Admin|

**GET /reviews**

```
Response: Review[] (current user only, sorted by createdAt DESC)
```

**POST /reviews**

```
Request: { eventId: number, rating: number, comment?: string }
Response: 201 Review
```

Validation: rating 1-5 integer, comment max 1000 chars optional.
Service: check no existing review by this user for this event (→ 409 CONFLICT if exists) → create.

**DELETE /reviews/:id**

```
Response: 204
```

Service: check userId matches req.user.sub → delete.

**GET /admin/reviews**

```
Query: ?eventTitle=Hamlet&sort=date_desc
Response: Review[] (all reviews, filterable/sortable)
```

NOTE: AdminReviews page is READ-ONLY (no delete button in the frontend). This endpoint just lists.

-----

## MAPPER IMPLEMENTATION GUIDE

### event.mapper.ts

```typescript
export function toEventResponse(event: EventWithRelations): EventResponse {
  const confirmedTickets = event.reservations
    .filter(r => r.status === "confirmed")
    .reduce((sum, r) => sum + r.numberOfTickets, 0);

  const dt = event.dateTime;

  return {
    id: String(event.id),
    title: event.title,
    description: event.description ?? "",
    date: dt.toISOString().split("T")[0],         // "2026-03-20"
    time: dt.toTimeString().slice(0, 5),           // "19:30"
    theaterId: String(event.hall.theater.id),
    theaterName: event.hall.theater.name,
    pricePerTicket: event.price,
    totalSeats: event.totalSeats,
    availableSeats: event.totalSeats - confirmedTickets,
    imageUrl: event.imageUrl ?? "",
    duration: formatDuration(event.duration),       // 150 → "2h 30min"
  };
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}
```

### reservation.mapper.ts

```typescript
export function toReservationResponse(r: ReservationWithRelations): ReservationResponse {
  const dt = r.event.dateTime;
  return {
    id: String(r.id),
    userId: String(r.userId),
    eventId: String(r.eventId),
    eventTitle: r.event.title,
    theaterName: r.event.hall.theater.name,
    date: dt.toISOString().split("T")[0],
    time: dt.toTimeString().slice(0, 5),
    numberOfTickets: r.numberOfTickets,
    totalPrice: r.totalPrice,
    status: r.status as "confirmed" | "cancelled",
    createdAt: r.createdAt.toISOString(),
  };
}
```

### review.mapper.ts

```typescript
export function toReviewResponse(r: ReviewWithRelations): ReviewResponse {
  return {
    id: String(r.id),
    userId: String(r.userId),
    userName: `${r.user.firstName} ${r.user.lastName}`,
    userEmail: r.user.email,
    eventId: String(r.eventId),
    eventTitle: r.event.title,
    theaterName: r.event.hall.theater.name,
    rating: r.rating,
    comment: r.comment ?? undefined,
    createdAt: r.createdAt.toISOString(),
  };
}
```

-----

## MIDDLEWARE DETAILS

### auth.middleware.ts

- Extract token from `Authorization: Bearer <token>`
- Verify with jsonwebtoken + JWT_SECRET
- Attach `req.user = { sub: number, role: string }`
- On failure: 401 `{ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }`

### role.middleware.ts

- Factory: `requireRole(...roles: string[])`
- Check `req.user.role` is in allowed roles
- On failure: 403 `{ error: { code: "FORBIDDEN", message: "Insufficient permissions" } }`

### validate.middleware.ts

- Factory: `validate(schema: ZodSchema, source: "body" | "query" = "body")`
- Parse req[source] through schema
- On ZodError: 400 with field-level error details

### error.middleware.ts

- `AppError` → use its statusCode + code + message
- `ZodError` → 400 VALIDATION_ERROR + formatted details
- Prisma `P2002` (unique constraint) → 409 CONFLICT
- Prisma `P2025` (record not found) → 404 NOT_FOUND
- Everything else → 500, log full error via Pino, return generic message
- NEVER leak stack traces in production

-----

## SECURITY

- Argon2id: memoryCost 65536, timeCost 3, parallelism 4
- helmet() with defaults
- CORS: explicit origin from env (dev: http://localhost:5173)
- Rate limit: 100/15min global, 10/15min on /auth/*
- All input validated with Zod (server-side)
- Prisma = parameterized queries (SQL injection safe)
- JWT secret min 32 chars, from env
- Error responses never leak internals
- .env in .gitignore

-----

## SEED DATA

`prisma/seed.ts` must create:

1. **Users**:
- user@theatrum.hr / User1234 (role: user)
- admin@theatrum.hr / Admin1234 (role: admin)
1. **Theaters** (4): HNK Zagreb, Gavella, Kerempuh, Teatar &TD
- Each with one default Hall
1. **Events** (9): Hamlet, Čekajući Godota, Tko se boji Virginije Woolf?, Revizor, Medeja, Kiklop, Dundo Maroje, Postolar i vrag, Tri sestre
- Use exact data from `frontend/src/lib/mockData.ts`
1. **Reservations** (6) and **Reviews** (6) matching mockData

-----

## BUILD ORDER

### Phase 0: Setup

1. npm init, install all deps
1. tsconfig.json (strict, ESM or CJS — match Prisma)
1. .env + .env.example + docker-compose.yml
1. src/app.ts: cors + helmet + json + pino-http + health route
1. src/server.ts: dotenv + app.listen(PORT)
1. prisma/schema.prisma (above schema)
1. `docker compose up -d` → `npx prisma db push` → `npx prisma generate`
1. **VERIFY**: `curl localhost:3000/api/v1/health` returns 200

### Phase 1: Auth

1. validators/auth.schema.ts (registerSchema, loginSchema)
1. services/auth.service.ts (register, login, getMe)
1. controllers/auth.controller.ts
1. routes/auth.routes.ts
1. middleware/auth.middleware.ts + role.middleware.ts
1. middleware/rateLimiter.ts (authLimiter)
1. **VERIFY**: register → login → GET /auth/me with token

### Phase 2: Theaters

1. mappers/theater.mapper.ts
1. services/theater.service.ts
1. controllers/theater.controller.ts
1. routes/theater.routes.ts (GET public-ish, POST/PUT/DELETE admin)
1. **VERIFY**: GET /theaters, GET /theaters/:id, admin CRUD

### Phase 3: Events

1. mappers/event.mapper.ts (most complex — joins, computed fields)
1. validators/event.schema.ts + query.schema.ts (pagination)
1. services/event.service.ts (list with search/filter/sort/pagination)
1. controllers/event.controller.ts
1. routes/event.routes.ts
1. **VERIFY**: GET /events?search=hamlet&theaterId=1&sort=date_desc&page=1

### Phase 4: Reservations

1. mappers/reservation.mapper.ts
1. validators/reservation.schema.ts
1. services/reservation.service.ts (transactional create, ownership cancel)
1. controllers/reservation.controller.ts
1. routes/reservation.routes.ts
1. **VERIFY**: POST /reservations, GET /reservations, PATCH cancel, verify seat count

### Phase 5: Reviews

1. mappers/review.mapper.ts
1. validators/review.schema.ts
1. services/review.service.ts (unique per user-event, ownership delete)
1. controllers/review.controller.ts
1. routes/review.routes.ts
1. **VERIFY**: POST /reviews, duplicate blocked, GET /reviews

### Phase 6: Seed + Polish

1. prisma/seed.ts
1. error.middleware.ts final pass
1. compression middleware
1. Test all endpoints end-to-end
1. **VERIFY**: `npx prisma db seed` populates all data

-----

## FRONTEND MIGRATION GUIDE

After backend is running, the frontend must replace mock imports with API calls.

### Files to modify:

|File                               |Remove import                     |Replace with                                                          |
|-----------------------------------|----------------------------------|----------------------------------------------------------------------|
|`store/authStore.ts`               |Mock MOCK_USERS array + setTimeout|`api.post("/api/v1/auth/login")`, `api.post("/api/v1/auth/register")` |
|`pages/Events.tsx`                 |`mockEvents, mockTheaters`        |`api.get("/api/v1/events", { params })`, `api.get("/api/v1/theaters")`|
|`pages/Theaters.tsx`               |`mockTheaters`                    |`api.get("/api/v1/theaters")`                                         |
|`pages/TheaterDetail.tsx`          |`mockTheaters, mockEvents`        |`api.get("/api/v1/theaters/${id}")` (includes events)                 |
|`pages/Reservations.tsx`           |`mockReservations`                |`api.get("/api/v1/reservations")`                                     |
|`pages/Reviews.tsx`                |`mockReviews, mockEvents`         |`api.get("/api/v1/reviews")`, `api.get("/api/v1/events")` for dropdown|
|`components/ReservationModal.tsx`  |`setTimeout` mock                 |`api.post("/api/v1/reservations", { eventId, numberOfTickets })`      |
|`pages/admin/AdminEvents.tsx`      |`mockEvents, mockTheaters`        |`api.get/post/put/delete("/api/v1/events")`                           |
|`pages/admin/AdminTheaters.tsx`    |`mockTheaters`                    |`api.get/post/put/delete("/api/v1/theaters")`                         |
|`pages/admin/AdminReservations.tsx`|`mockReservations`                |`api.get("/api/v1/admin/reservations")`, cancel via PATCH             |
|`pages/admin/AdminReviews.tsx`     |`mockReviews`                     |`api.get("/api/v1/admin/reviews")` (read-only, no delete)             |

### After all pages migrated:

- Delete `src/lib/mockData.ts`
- Update `src/lib/axios.ts` baseURL if needed (already defaults to `http://localhost:3000/api`)

**IMPORTANT**: The axios baseURL is `/api` but routes are `/api/v1/*`. Either:

- Change axios baseURL to `http://localhost:3000/api/v1`, OR
- Mount all routes under `/api` in Express (no /v1 prefix for MVP)

**Recommended**: Use `/api` without version prefix for MVP simplicity. The frontend axios already points to `/api`.

-----

## DEPENDENCIES

```json
{
  "dependencies": {
    "express": "^4",
    "@prisma/client": "^6",
    "zod": "^3",
    "jsonwebtoken": "^9",
    "argon2": "^0.41",
    "cors": "^2",
    "helmet": "^8",
    "express-rate-limit": "^7",
    "pino": "^9",
    "pino-http": "^10",
    "compression": "^1",
    "dotenv": "^16"
  },
  "devDependencies": {
    "typescript": "^5",
    "tsx": "^4",
    "@types/express": "^5",
    "@types/jsonwebtoken": "^9",
    "@types/cors": "^2",
    "@types/compression": "^1",
    "prisma": "^6",
    "vitest": "^3",
    "supertest": "^7",
    "@types/supertest": "^6",
    "pino-pretty": "^13"
  }
}
```

Scripts:

```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "seed": "tsx prisma/seed.ts",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

-----

## DOCKER COMPOSE

```yaml
version: "3.8"
services:
  db:
    image: mcr.microsoft.com/azure-sql-edge
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "YourStrong!Password123"
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql
volumes:
  sqldata:
```

-----

## .env.example

```
NODE_ENV=development
PORT=3000
DATABASE_URL="sqlserver://localhost:1433;database=TheatrumDB;user=sa;password=YourStrong!Password123;trustServerCertificate=true"
JWT_SECRET="change-this-to-a-random-32-char-string-minimum"
CORS_ORIGIN="http://localhost:5173"
```