# Docker Database Integration Guide

This guide explains how to set up and use the Docker-based database infrastructure for PulseCRM.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- pnpm package manager

### 1. Start Database Services
```bash
# Start PostgreSQL and Redis containers
./docker.sh up

# Initialize database with schema and sample data
./docker.sh init
```

### 2. Verify Setup
```bash
# Check service status
./docker.sh status

# View logs
./docker.sh logs
```

Your development environment is now ready! 🎉

## 📊 Available Services

| Service | Port | Description | Admin URL |
|---------|------|-------------|-----------|
| PostgreSQL | 5432 | Main database | - |
| Redis | 6379 | Cache & pub/sub | - |
| pgAdmin | 5050 | Database admin UI | http://localhost:5050 |

### pgAdmin Access
- **URL**: http://localhost:5050
- **Email**: admin@pulsecrm.local  
- **Password**: admin123

## 🐳 Docker Commands

### Service Management
```bash
./docker.sh up        # Start all services
./docker.sh down      # Stop all services
./docker.sh restart   # Restart services
./docker.sh status    # Check health status
./docker.sh logs      # View logs (all services)
./docker.sh logs postgres  # View specific service logs
```

### Database Operations
```bash
./docker.sh init      # Setup database schema and seed data
./docker.sh backup    # Create database backup
./docker.sh restore backup.sql.gz  # Restore from backup
./docker.sh shell postgres  # Open PostgreSQL shell
./docker.sh shell redis     # Open Redis CLI
```

### Maintenance
```bash
./docker.sh clean     # Remove containers and volumes (⚠️ destructive)
```

## 💾 Database Schema

The database includes these main tables:

### Core Tables
- **users** - Authentication and user management
- **companies** - Client companies
- **contacts** - Individual contacts within companies
- **jobs** - Main project/job management
- **tasks** - Individual tasks within jobs

### Supporting Tables
- **documents** - File management
- **time_entries** - Time tracking
- **invoices** - Billing and invoicing
- **activity_log** - Audit trail

### Sample Data
The seed script creates:
- 4 users (admin, manager, 2 crew members)
- 3 companies with contacts
- 3 jobs with various statuses
- Multiple tasks and time entries

## 🔧 Database Management

### Direct Database Access
```bash
# Connect to PostgreSQL
./docker.sh shell postgres

# Example queries
SELECT * FROM users;
SELECT * FROM jobs WHERE status = 'in_progress';
```

### Using Drizzle Studio
```bash
cd packages/db
npm run db:studio
```
Opens a web-based database explorer at http://localhost:4983

### Schema Migrations
```bash
cd packages/db

# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Reset and reseed database
npm run db:reset-seed
```

## 🔄 Development Workflow

### 1. Schema Changes
1. Modify schema in `packages/db/src/schema/index.ts`
2. Generate migration: `npm run db:generate`
3. Apply changes: `npm run db:migrate`

### 2. Seed Data Updates
1. Modify `packages/db/src/seeds/index.ts`
2. Reset and reseed: `npm run db:reset-seed`

### 3. Backup Before Major Changes
```bash
# Create backup before risky operations
./docker.sh backup

# If something goes wrong, restore
./docker.sh restore ./backups/backup_YYYYMMDD_HHMMSS.sql.gz
```

## 🌍 Environment Variables

The following environment variables control database behavior:

```bash
# Database connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/pulsecrm
DB_CONNECTION_LIMIT=10

# Redis connection  
REDIS_URL=redis://localhost:6379

# Development settings
NODE_ENV=development
ENABLE_DB_LOGGING=true
```

## 🔒 Security Notes

### Development Environment
- Default passwords are used for convenience
- Database logs are enabled for debugging
- All services are accessible without authentication

### Production Considerations
- Change all default passwords
- Use proper SSL certificates
- Implement connection pooling
- Enable proper logging and monitoring
- Use secrets management

## 📁 File Structure

```
docker/
├── postgres/
│   └── init.sql          # Database initialization
├── redis/
│   └── redis.conf        # Redis configuration
└── backup/
    └── backup.sh         # Backup script

packages/db/
├── src/
│   ├── schema/
│   │   └── index.ts      # Database schema
│   ├── seeds/
│   │   └── index.ts      # Sample data
│   └── utils/
│       └── auth.ts       # Authentication utilities
└── scripts/
    └── migrate.js        # Migration management

docker-compose.yml        # Service definitions
docker.sh                 # Management script
```

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using port 5432
lsof -i :5432

# Stop conflicting services
brew services stop postgresql  # If using Homebrew PostgreSQL
```

### Container Issues
```bash
# View container logs
./docker.sh logs postgres

# Restart specific service
docker-compose restart postgres

# Clean start
./docker.sh clean
./docker.sh up
```

### Database Connection Issues
```bash
# Check if PostgreSQL is ready
./docker.sh status

# Manual connection test
docker-compose exec postgres pg_isready -U postgres
```

### Schema Sync Issues
```bash
# Reset to clean state
cd packages/db
npm run db:reset-seed
```

## 📈 Performance Tips

### PostgreSQL Optimization
- Connection pooling is configured for 10 concurrent connections
- Indexes are created on frequently queried columns
- EXPLAIN ANALYZE your queries for optimization

### Redis Configuration
- Configured for development with persistence enabled
- Memory limit set to 256MB
- Pub/sub enabled for real-time features

## 🚀 Next Steps

1. **Connect Application**: Update your app to use the new database
2. **Add Authentication**: Implement JWT-based auth using the users table
3. **Real-time Features**: Use Redis pub/sub for live updates
4. **File Uploads**: Implement document storage using the documents table
5. **API Development**: Create tRPC procedures for CRUD operations

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `./docker.sh logs`
2. Verify service status: `./docker.sh status`
3. Review the troubleshooting section above
4. Check Docker Desktop is running and has sufficient resources

---

**Happy coding! 🎉**
