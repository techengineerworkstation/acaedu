# Acadion - Developer Setup Guide

This guide helps developers set up a local development environment for Acadion.

## Prerequisites

- **Node.js** >= 18.0.0 (recommended: 20.x LTS)
- **pnpm** >= 10.33.0 (or npm/yarn)
- **Git** for version control
- **Supabase CLI** (optional, for local development)
- A **Supabase project** (cloud or local)

---

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd acadion
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Seed sample data** (optional, for testing)
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key pnpm db:seed
   ```

6. **Start development servers**
   ```bash
   pnpm start:dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Configuration

Create a `.env.local` file in the project root with these variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Analytics, error tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## Database Migrations

### Applying Migrations
```bash
cd supabase
supabase db push
```

Or using the npm script:
```bash
pnpm db:push
```

This applies all SQL files in `supabase/migrations/` to your database.

### Creating a New Migration

1. Write your SQL in a new file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. The timestamp prefix ensures correct order
3. Include both `UP` and `DOWN` operations if needed (or just forward migrations)
4. Commit the file

### Rolling Back
Supabase CLI supports:
```bash
supabase db reset  # WARNING: drops all data
```

For production, use Supabase dashboard migrations or versioned rollback scripts.

---

## Seeding Sample Data

The seed script populates your database with demo users, courses, schedules, and other sample records.

### Running the Seed
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key_here node packages/web/scripts/seed.js
```

Or if you have pnpm:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key_here pnpm db:seed
```

### What Gets Seeded?
- **Institution Settings**: Default branding and currency (NGN)
- **Users**: 5 sample users (admin, 2 lecturers, 2 students)
- **Courses**: 4 sample courses (CS101, CS201, MATH101, MATH201)
- **Schedules**: Weekly recurring lecture slots
- **Announcements**: Welcome and exam schedule messages
- **Events**: Career fair, hackathon, workshop
- **Subscription Plans**: Free, Pro, International Pro, Premium (multi-currency)
- **Course Materials**: Sample syllabi, slides, videos (using placeholder URLs)
- **Enrollments**: Students enrolled in courses

### Resetting to Clean State
1. Delete sample data from the **Admin Settings** page (see ADMIN_USER_GUIDE.md)
2. Or manually truncate tables (be careful with FK constraints):
   ```sql
   -- Disable RLS temporarily if needed
   SET session_replication_role = 'replica';
   -- Truncate in order respecting FKs
   TRUNCATE enrollments CASCADE;
   TRUNCATE schedules CASCADE;
   TRUNCATE courses CASCADE;
   TRUNCATE users CASCADE;
   -- ... other tables
   SET session_replication_role = 'default';
   ```
3. Re-run the seed script

---

## Project Structure

```
acadion/
├── packages/
│   ├── web/              # Next.js frontend + API routes
│   │   ├── app/          # App Router pages
│   │   │   ├── (dashboard)/  # Authenticated dashboards (student, lecturer, admin)
│   │   │   ├── (auth)/       # Login, register pages
│   │   │   ├── api/          # API endpoints
│   │   │   └── billing/      # Billing callbacks
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (ThemeContext)
│   │   ├── lib/          # Utilities, Supabase clients
│   │   └── scripts/      # seed.js
│   └── shared/           # Shared TypeScript types and constants
├── supabase/
│   └── migrations/       # SQL migration files
├── .env.local            # Your environment variables (gitignored)
├── .env.local.example    # Example env file
├── DEPLOYMENT_GUIDE.md   # Deployment instructions
├── ADMIN_USER_GUIDE.md   # Admin documentation
└── DEVELOPER_SETUP.md    # This file
```

---

## Development Workflow

### Code Style
- Uses **TypeScript** with strict mode
- Format with Prettier: `pnpm format`
- Lint with ESLint: `pnpm lint`

### Feature Development
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes, commit often with clear messages
3. Test locally (frontend and API routes)
4. Open a pull request for review
5. Merge to main after approval

### Database Schema Changes
1. Write a migration SQL file in `supabase/migrations/`
2. Update shared types in `packages/shared/src/types/index.ts`
3. Regenerate `packages/web/src/lib/supabase/database.types.ts`:
   ```bash
   supabase gen types typescript --project-id your_project_ref > packages/web/src/lib/supabase/database.types.ts
   ```
   Or use the local CLI with linked project.

---

## Running in Production

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment steps on Vercel or custom server.

### Checklist Before Deploy
- [ ] All environment variables set in hosting platform
- [ ] Database migrations applied (`supabase db push`)
- [ ] Sample data deleted if not needed
- [ ] Custom domain and SSL configured
- [ ] Email provider configured (Resend, SendGrid, etc.)
- [ ] Monitoring/error tracking (Sentry) enabled
- [ ] Backup strategy in place

---

## Mobile App (Expo)

The mobile app lives in `packages/mobile/` (if initialized). To set up:

```bash
cd packages/mobile
npm install  # or pnpm install
cp .env.example .env
# Edit .env with your Supabase and API URLs
npx expo start
```

Follow Expo documentation for building and deploying to app stores.

---

## Troubleshooting

### Supabase Connection Errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check that your Supabase project is active
- Ensure Row Level Security (RLS) policies are correctly set on tables

### Type Errors After Migration
Regenerate the database types file as described above.

### Seed Script Fails
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set and has admin privileges
- Check that the database has been pushed with all migrations
- Look at error message - often duplicate key conflicts if data already exists (the seed is idempotent, but some constraints may differ)

### Port 3000 Already in Use
Kill the existing process: `lsof -ti:3000 | xargs kill -9` (Linux/Mac) or change the port in package.json dev script.

### Cannot Find Module Errors
Ensure all dependencies are installed: `pnpm install`
Clear Next.js cache: `rm -rf packages/web/.next`

---

## Contributing

Follow the project's code of conduct and PR template when contributing.

---

## License

Proprietary - All rights reserved.

---

*Acadion v0.1.0 | Last Updated: 2025-04-07*
