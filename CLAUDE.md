# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install dependencies
pnpm install

# Start development server (port 3010)
pnpm dev
# or use the script for proper environment setup
./start-dev.sh

# Build for production
pnpm build

# Run linting
pnpm lint
pnpm lint:fix  # Auto-fix linting issues

# Type checking
pnpm typecheck

# Format code
pnpm format

# Clean build artifacts
pnpm clean

# Bundle analysis
cd apps/web && pnpm analyze
```

### Database Commands
```bash
# Run database migrations
pnpm db:push

# Open database studio
pnpm db:studio

# Seed database with initial data
pnpm db:seed

# Generate database types
pnpm db:generate
```

### Testing
```bash
# Note: Testing infrastructure is not yet implemented
# Tests can be run manually through development server
pnpm dev  # Then manually test features
```

### Deployment
```bash
# Build for Vercel
pnpm vercel-build

# Deploy to Vercel (requires Vercel CLI)
vercel
```

## Architecture Overview

This is a monorepo using Turborepo with a Next.js web application for a CRM system called PulseCRM (formerly ConstructFlow).

### Key Technologies
- **Framework**: Next.js 15.3.3 with App Router
- **Styling**: Tailwind CSS with custom component library
- **Database**: PostgreSQL (Vercel Postgres in production) with Drizzle ORM
- **Authentication**: NextAuth.js with credentials and OAuth providers
- **API**: tRPC for type-safe API routes
- **State Management**: React Query (via tRPC)
- **File Storage**: Configurable (Vercel Blob, AWS S3, or local)
- **Email**: Configurable (SendGrid, Gmail, Resend)
- **Package Manager**: pnpm with workspaces

### Project Structure
```
/
├── apps/
│   └── web/                 # Main Next.js application
│       ├── app/             # App Router pages and API routes
│       ├── components/      # React components
│       ├── lib/            # Utilities, database, and configuration
│       ├── providers/      # React context providers
│       └── types/          # TypeScript type definitions
├── packages/               # Shared packages (if any)
├── turbo.json             # Turborepo configuration
└── pnpm-workspace.yaml    # PNPM workspace configuration
```

### Core Features
1. **Authentication System**: Multi-tenant authentication with organization support
2. **Document Management**: PDF viewing, signing, and storage
3. **Contractor Management**: CRUD operations for contractors (formerly crew members)
4. **Job Tracking**: Job creation and management
5. **Real-time Features**: WebSocket support for live updates
6. **Email Integration**: Transactional emails for auth and notifications

### Database Schema
The application uses a multi-tenant architecture with the following main tables:
- `users`: User accounts with organization association
- `organizations`: Tenant organizations
- `contractors`: Contractor records (migrated from crew_members)
- `jobs`: Job/project records
- `documents`: Document metadata and signatures

### API Structure
- `/api/auth/*`: Authentication endpoints (NextAuth)
- `/api/documents/*`: Document upload and signature endpoints
- `/api/files/*`: File serving and upload endpoints
- `/api/trpc/*`: tRPC API routes
- `/api/simple-auth/*`: Simplified auth endpoints for password reset

### Environment Configuration
The app requires several environment variables:
- Database connection strings (POSTGRES_URL, etc.)
- Authentication secrets (NEXTAUTH_SECRET, NEXTAUTH_URL)
- Email service credentials (varies by provider)
- File storage configuration (Vercel Blob or S3)

### Development Workflow
1. The application runs on port 3010 by default
2. Uses Turbo for build orchestration
3. Hot reload enabled in development
4. TypeScript strict mode is disabled for rapid development
5. ESLint is configured but can be ignored during builds

### Deployment
- Optimized for Vercel deployment
- Supports both file-based (development) and PostgreSQL (production) databases
- Automatic deployments on git push
- Environment variables managed through Vercel dashboard

### Important Notes
- The codebase is transitioning from "crew" to "contractor" terminology
- Some features are in demo mode and need production configuration
- Authentication includes test credentials for development: `test@example.com` / `password`
- File uploads are configurable between local, Vercel Blob, and S3
- Currently using in-memory storage for development (will not persist between restarts)

### Common Development Tasks

#### Running Database Migrations
```bash
# Ensure PostgreSQL is running, then:
pnpm db:generate  # Generate types from schema
pnpm db:push     # Apply migrations
```

#### Working with tRPC
- API routes are defined in `apps/web/lib/trpc/routers/`
- Client-side usage via hooks in components
- Type-safe end-to-end with automatic TypeScript inference

#### Adding New Features
1. Create database schema in `apps/web/lib/db/schema/`
2. Generate types: `pnpm db:generate`
3. Create tRPC router in `apps/web/lib/trpc/routers/`
4. Add to main router in `apps/web/lib/trpc/root.ts`
5. Create UI components in `apps/web/components/`
6. Add pages in `apps/web/app/` following App Router conventions

#### Environment Setup
Required environment variables are defined in `apps/web/.env.example`. Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Authentication secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Application URL (http://localhost:3010 for dev)
- Email provider credentials (SendGrid, Gmail, or Resend)
- File storage configuration (local, Vercel Blob, or S3)