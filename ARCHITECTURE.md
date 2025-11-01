# 🏗️ Architecture - Media Enhancer

## System Overview

Media Enhancer is a full-stack web application for video and audio editing powered by AI.

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         React Frontend (Port 5173)               │   │
│  │  - Clerk Auth UI                                 │   │
│  │  - Video Editor                                  │   │
│  │  - Dashboard                                     │   │
│  └──────────────────┬───────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────┘
                      │ HTTP/REST
                      │
┌─────────────────────▼───────────────────────────────────┐
│         Express Backend API (Port 3001)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Routes: /api/auth, /api/users, /api/media, etc. │   │
│  │ Middleware: Clerk Auth, Error Handling          │   │
│  └──────────┬──────────────────────┬─────────────────┘  │
└─────────────┼──────────────────────┼─────────────────────┘
              │                      │
    ┌─────────▼──────────┐  ┌────────▼─────────┐
    │  PostgreSQL (DB)    │  │ Cloudflare R2    │
    │  (Supabase)         │  │  (File Storage)  │
    │                     │  │                  │
    │ - Users             │  │ - Videos         │
    │ - Projects          │  │ - Audio          │
    │ - Media Files       │  │ - Images         │
    │ - Subscriptions     │  │ - Exports        │
    └─────────────────────┘  └──────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router v6
- **State Management:** Zustand (planned)
- **HTTP Client:** Axios + TanStack Query
- **Authentication:** Clerk React

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js + TypeScript
- **Authentication:** Clerk Express SDK
- **Payments:** Stripe
- **Database:** PostgreSQL (Supabase)
- **File Storage:** Cloudflare R2
- **Job Queue:** BullMQ + Redis (planned)
- **AI:** Google Gemini 2.0

### Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudflare R2
- **Auth:** Clerk
- **Payments:** Stripe
- **Deployment:** TBD (Vercel/Railway recommended)

---

## Database Schema

### Core Tables

#### `users`
```sql
id              UUID PRIMARY KEY
clerk_user_id   VARCHAR(255) UNIQUE NOT NULL
email           VARCHAR(255) NOT NULL
username        VARCHAR(100)
avatar_url      TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `subscription_plans`
```sql
id              VARCHAR(50) PRIMARY KEY
name            VARCHAR(100) NOT NULL
price           INTEGER NOT NULL (cents)
interval        VARCHAR(20) NOT NULL
stripe_price_id VARCHAR(255)
features        JSONB NOT NULL
```

Plans:
- **Starter** ($0/month): 5GB, 10 projects, 50 exports/month
- **Creator** ($14.99/month): 50GB, 100 projects, 500 exports/month
- **Professional** ($49.99/month): 500GB, unlimited projects/exports

#### `user_subscriptions`
```sql
id                    UUID PRIMARY KEY
user_id               UUID → users(id)
plan_id               VARCHAR(50) → subscription_plans(id)
stripe_subscription_id VARCHAR(255)
stripe_customer_id    VARCHAR(255)
status                VARCHAR(50)
current_period_start  TIMESTAMP
current_period_end    TIMESTAMP
cancel_at_period_end  BOOLEAN
```

#### `media_files`
```sql
id                UUID PRIMARY KEY
user_id           UUID → users(id)
filename          VARCHAR(255)
original_filename VARCHAR(255)
file_type         VARCHAR(50) (video/audio/image)
mime_type         VARCHAR(100)
file_size         BIGINT (bytes)
duration          INTEGER (seconds)
r2_key            TEXT
r2_url            TEXT
status            VARCHAR(50)
metadata          JSONB
```

#### `projects`
```sql
id            UUID PRIMARY KEY
user_id       UUID → users(id)
name          VARCHAR(255)
description   TEXT
thumbnail_url TEXT
duration      INTEGER
status        VARCHAR(50)
settings      JSONB
```

#### `exports`
```sql
id          UUID PRIMARY KEY
user_id     UUID → users(id)
project_id  UUID → projects(id)
filename    VARCHAR(255)
format      VARCHAR(50)
resolution  VARCHAR(20)
r2_url      TEXT
status      VARCHAR(50)
progress    INTEGER (0-100)
```

---

## API Routes

### Authentication Routes
```
GET  /api/auth/me          - Get current user info
GET  /api/auth/verify      - Verify auth token
```

### User Routes
```
GET  /api/users/profile    - Get user profile
PUT  /api/users/profile    - Update user profile
GET  /api/users/usage      - Get usage statistics
```

### Subscription Routes
```
GET  /api/subscriptions/plans      - List available plans
GET  /api/subscriptions/current    - Get current subscription
POST /api/subscriptions/checkout   - Create Stripe checkout session
POST /api/subscriptions/cancel     - Cancel subscription
```

### Media Routes
```
POST   /api/media/upload           - Upload media file
GET    /api/media                  - List user's media files
GET    /api/media/:id              - Get media file details
DELETE /api/media/:id              - Delete media file
POST   /api/media/:id/enhance      - Queue AI enhancement
```

### Webhook Routes
```
POST /api/webhooks/stripe          - Stripe webhook handler
```

---

## Authentication Flow

```
1. User clicks "Sign Up" in frontend
   ↓
2. Clerk modal opens
   ↓
3. User enters email/password
   ↓
4. Clerk creates user account
   ↓
5. Clerk sends webhook to backend (optional)
   ↓
6. Backend creates user record in database
   ↓
7. Frontend receives auth token
   ↓
8. Frontend redirects to /dashboard
   ↓
9. All subsequent API calls include auth token
   ↓
10. Backend middleware validates token with Clerk
```

---

## File Upload Flow

```
1. User drags file to upload area
   ↓
2. Frontend validates file (size, type)
   ↓
3. Frontend sends POST /api/media/upload
   ↓
4. Backend receives file via Multer
   ↓
5. Backend uploads to Cloudflare R2
   ↓
6. Backend creates media_files record in DB
   ↓
7. Backend returns file metadata to frontend
   ↓
8. Frontend displays file in media library
```

---

## Subscription Flow

```
1. User clicks "Upgrade" on pricing page
   ↓
2. Frontend calls POST /api/subscriptions/checkout
   ↓
3. Backend creates Stripe checkout session
   ↓
4. Backend returns checkout URL
   ↓
5. Frontend redirects to Stripe checkout
   ↓
6. User enters payment info on Stripe
   ↓
7. Stripe processes payment
   ↓
8. Stripe sends webhook to backend
   ↓
9. Backend updates user_subscriptions table
   ↓
10. User redirected back to app
   ↓
11. Dashboard shows new plan limits
```

---

## AI Enhancement Flow (Planned)

```
1. User uploads video
   ↓
2. User clicks "Enhance with AI"
   ↓
3. Frontend sends POST /api/media/:id/enhance
   ↓
4. Backend creates job in BullMQ queue
   ↓
5. Worker picks up job
   ↓
6. Worker calls Gemini API for analysis
   ↓
7. Worker applies enhancements with FFmpeg
   ↓
8. Worker uploads enhanced file to R2
   ↓
9. Worker updates media_files record
   ↓
10. Frontend polls for completion
   ↓
11. User sees enhanced video
```

---

## Security Considerations

### Authentication
- Clerk handles all auth logic
- JWT tokens validated on every request
- Tokens stored securely in HTTP-only cookies

### API Security
- Helmet.js for security headers
- CORS configured for frontend domain only
- Rate limiting on all routes (planned)
- Input validation with express-validator

### File Upload
- File size limits enforced
- MIME type validation
- Virus scanning (planned)
- Signed URLs for downloads

### Payments
- Stripe handles all payment processing
- Webhook signatures verified
- Never store credit card info

### Database
- Prepared statements (SQL injection prevention)
- Row-level security (Supabase)
- Encrypted backups

---

## Environment Variables

### Backend (.env)
```bash
PORT=3001
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
DATABASE_URL=postgresql://xxx
STRIPE_SECRET_KEY=sk_test_xxx
GEMINI_API_KEY=xxx
R2_ACCESS_KEY_ID=xxx
```

### Frontend (.env.local)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## Deployment Strategy (Future)

### Frontend (Vercel)
- Automatic deployments from Git
- Environment variables configured in dashboard
- CDN distribution globally
- Preview deployments for PRs

### Backend (Railway/Render)
- Docker container
- Auto-scaling based on load
- Environment variables in dashboard
- Health checks enabled

### Database (Supabase)
- Managed PostgreSQL
- Automatic backups
- Connection pooling
- Read replicas (paid tier)

### Storage (Cloudflare R2)
- Global edge network
- S3-compatible API
- No egress fees
- CDN integration

---

## Monitoring & Logging

### Backend Logs
- Winston logger
- Log levels: debug, info, warn, error
- Structured JSON logs
- Log rotation

### Error Tracking
- Sentry integration (planned)
- Automatic error reporting
- Source maps for stack traces

### Performance
- Response time monitoring
- Database query performance
- File upload/download speeds
- API endpoint metrics

---

## Testing Strategy (Future)

### Unit Tests
- Jest for both frontend and backend
- Component testing with React Testing Library
- API route testing with Supertest

### Integration Tests
- End-to-end with Playwright
- Database migrations
- Stripe webhook testing
- File upload/download

### Load Testing
- Artillery for API load testing
- Simulate concurrent users
- Test file upload limits
- Subscription flow under load

---

## Performance Optimization

### Frontend
- Code splitting by route
- Lazy loading components
- Image optimization
- Service worker for offline support (planned)

### Backend
- Database connection pooling
- Query optimization with indexes
- Caching with Redis (planned)
- CDN for static assets

### File Processing
- Job queue for async processing
- Multiple workers for parallelization
- Progress tracking
- Retry logic for failed jobs

---

## Scalability Plan

### Phase 1 (0-1000 users)
- Single backend instance
- Supabase free tier
- Cloudflare R2
- No caching needed

### Phase 2 (1000-10,000 users)
- Multiple backend instances
- Redis for caching
- Database read replicas
- CDN for media delivery

### Phase 3 (10,000+ users)
- Microservices architecture
- Separate video processing service
- Kubernetes orchestration
- Multi-region deployment

---

## Cost Estimation

### Monthly Costs (Development)
- Clerk: Free (up to 10,000 users)
- Supabase: Free (500MB DB, 1GB storage)
- Cloudflare R2: ~$0 (10GB free)
- Stripe: Free (pay per transaction)
- **Total: $0/month**

### Monthly Costs (Production - 1000 users)
- Clerk: Free
- Supabase: $25 (Pro plan)
- Cloudflare R2: ~$15 (100GB storage)
- Backend hosting: ~$20 (Railway/Render)
- Frontend: $0 (Vercel free tier)
- **Total: ~$60/month**

---

## Future Features

- [ ] Collaborative editing (real-time)
- [ ] AI voiceover generation
- [ ] Auto-subtitles with transcription
- [ ] Video templates library
- [ ] Mobile app (React Native)
- [ ] Webhook API for integrations
- [ ] White-label solution for agencies

---

**Last Updated:** 2024-11-01
