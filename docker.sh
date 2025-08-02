#!/bin/bash

# PulseCRM Docker Management Script
# Provides easy commands to manage the Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}🐳 PulseCRM Docker Management${NC}"
    echo -e "${BLUE}==============================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Command functions
cmd_up() {
    print_header
    print_info "Starting PulseCRM development environment..."
    
    check_docker
    docker-compose up -d
    
    print_success "Services started successfully!"
    print_info "Services available at:"
    echo "  📊 PostgreSQL: localhost:5432"
    echo "  🔴 Redis: localhost:6379" 
    echo "  🎛️  pgAdmin: http://localhost:5050"
    echo "     Email: admin@pulsecrm.local"
    echo "     Password: admin123"
    
    print_info "Waiting for services to be ready..."
    sleep 5
    cmd_status
}

cmd_down() {
    print_header
    print_info "Stopping PulseCRM development environment..."
    
    docker-compose down
    print_success "Services stopped successfully!"
}

cmd_restart() {
    print_header
    print_info "Restarting PulseCRM development environment..."
    
    docker-compose restart
    print_success "Services restarted successfully!"
}

cmd_logs() {
    service=${2:-""}
    if [ -n "$service" ]; then
        print_info "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_info "Showing logs for all services..."
        docker-compose logs -f
    fi
}

cmd_status() {
    print_header
    print_info "Checking service status..."
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_success "PostgreSQL: Running"
    else
        print_error "PostgreSQL: Not ready"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis: Running"
    else
        print_error "Redis: Not ready"
    fi
    
    # Show container status
    echo ""
    print_info "Container status:"
    docker-compose ps
}

cmd_backup() {
    print_header
    print_info "Creating database backup..."
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="./backups/manual_backup_${timestamp}.sql"
    
    mkdir -p ./backups
    
    docker-compose exec -T postgres pg_dump -U postgres -d pulsecrm > "$backup_file"
    gzip "$backup_file"
    
    print_success "Backup created: ${backup_file}.gz"
}

cmd_restore() {
    backup_file=$2
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup file to restore"
        print_info "Usage: ./docker.sh restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_header
    print_warning "This will replace the current database with the backup!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restoring database from $backup_file..."
        
        # Handle compressed files
        if [[ "$backup_file" == *.gz ]]; then
            gunzip -c "$backup_file" | docker-compose exec -T postgres psql -U postgres -d pulsecrm
        else
            docker-compose exec -T postgres psql -U postgres -d pulsecrm < "$backup_file"
        fi
        
        print_success "Database restored successfully!"
    else
        print_info "Restore cancelled"
    fi
}

cmd_shell() {
    service=${2:-"postgres"}
    print_info "Opening shell in $service container..."
    
    case $service in
        postgres|db)
            docker-compose exec postgres psql -U postgres -d pulsecrm
            ;;
        redis)
            docker-compose exec redis redis-cli
            ;;
        *)
            docker-compose exec "$service" /bin/bash
            ;;
    esac
}

cmd_clean() {
    print_header
    print_warning "This will remove all containers and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up Docker resources..."
        docker-compose down -v --remove-orphans
        docker-compose rm -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

cmd_init() {
    print_header
    print_info "Initializing PulseCRM database..."
    
    # Start services if not running
    docker-compose up -d postgres redis
    
    # Wait for PostgreSQL to be ready
    print_info "Waiting for PostgreSQL to be ready..."
    timeout=60
    while ! docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_error "PostgreSQL failed to start within 60 seconds"
            exit 1
        fi
    done
    
    # Run migrations and seed data
    print_info "Running database migrations..."
    cd packages/db && npm run db:migrate
    
    print_info "Seeding database with sample data..."
    cd packages/db && npm run db:seed
    
    print_success "Database initialization completed!"
    cmd_status
}

cmd_help() {
    print_header
    cat << EOF

Available commands:
  up        - Start all services
  down      - Stop all services  
  restart   - Restart all services
  status    - Check service health
  logs      - Show service logs (optional: specify service name)
  backup    - Create database backup
  restore   - Restore database from backup file
  shell     - Open database shell (postgres) or redis-cli
  clean     - Remove all containers and volumes
  init      - Initialize database with migrations and seed data
  help      - Show this help message

Examples:
  ./docker.sh up
  ./docker.sh init
  ./docker.sh logs postgres
  ./docker.sh backup
  ./docker.sh restore ./backups/backup_20240101_120000.sql.gz
  ./docker.sh shell postgres
  ./docker.sh shell redis

EOF
}

# Main command dispatcher
case "${1:-help}" in
    up)
        cmd_up
        ;;
    down)
        cmd_down
        ;;
    restart)
        cmd_restart
        ;;
    logs)
        cmd_logs "$@"
        ;;
    status)
        cmd_status
        ;;
    backup)
        cmd_backup
        ;;
    restore)
        cmd_restore "$@"
        ;;
    shell)
        cmd_shell "$@"
        ;;
    clean)
        cmd_clean
        ;;
    init)
        cmd_init
        ;;
    help|*)
        cmd_help
        ;;
esac