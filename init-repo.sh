#!/bin/bash
# init-repo.sh - Initialize the PulseCRM-Rebuild Git repository
# This script sets up the monorepo structure and initializes Git

set -e  # Exit on error

# Print with color
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PulseCRM-Rebuild Repository Initialization ===${NC}"
echo "This script will set up the monorepo structure for PulseCRM-Rebuild."

# Check if the directory is already a git repository
if [ -d ".git" ]; then
  echo -e "${RED}This directory is already a Git repository.${NC}"
  echo "Please run this script in a fresh directory."
  exit 1
fi

# Create directory structure
echo -e "\n${GREEN}Creating directory structure...${NC}"

# Create main directories
mkdir -p apps/web/{app,components,public,styles,trpc}
mkdir -p apps/web/app/{api,dashboard,auth}
mkdir -p packages/{api,db,ui,config}
mkdir -p packages/api/{src/router,dist}
mkdir -p packages/db/{src/schema,dist}
mkdir -p packages/ui/{src/components/ui,dist}
mkdir -p docker

# Create placeholder files to ensure directories are committed
touch apps/web/app/.gitkeep
touch apps/web/components/.gitkeep
touch apps/web/public/.gitkeep
touch apps/web/styles/.gitkeep
touch apps/web/trpc/.gitkeep
touch packages/api/src/.gitkeep
touch packages/db/src/.gitkeep
touch packages/ui/src/.gitkeep
touch packages/config/.gitkeep
touch docker/.gitkeep

# Create basic .gitignore
echo -e "\n${GREEN}Creating .gitignore...${NC}"
cat > .gitignore << EOL
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build
dist

# Misc
.DS_Store
*.pem
.vscode
.idea

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Turbo
.turbo

# Vercel
.vercel

# Build outputs
dist/
build/
storybook-static/
EOL

# Create basic README if it doesn't exist
if [ ! -f "README.md" ]; then
  echo -e "\n${GREEN}Creating README.md...${NC}"
  cat > README.md << EOL
# PulseCRM Rebuild

A modern React-based CRM dashboard for crew management with intelligent interfaces and advanced collaboration tools.

## Getting Started

1. Install dependencies: \`pnpm install\`
2. Set up environment: \`cp .env.example .env\`
3. Start development server: \`pnpm dev\`

See full documentation for more details.
EOL
fi

# Create .env.example
echo -e "\n${GREEN}Creating .env.example...${NC}"
cat > .env.example << EOL
# PulseCRM Environment Variables
# Copy this file to .env and fill in the values for your environment

# Node environment: development, test, or production
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/pulsecrm
DB_CONNECTION_LIMIT=10
IS_SERVERLESS=false

# Redis Configuration (for caching, pub/sub, and rate limiting)
REDIS_URL=redis://localhost:6379

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOL

# Initialize git repository
echo -e "\n${GREEN}Initializing Git repository...${NC}"
git init

# Create initial commit
echo -e "\n${GREEN}Creating initial commit...${NC}"
git add .
git commit -m "Initial commit: PulseCRM-Rebuild monorepo structure"

echo -e "\n${BLUE}=== Repository initialization complete ===${NC}"
echo -e "Next steps:"
echo -e "1. Run ${GREEN}pnpm install${NC} to install dependencies"
echo -e "2. Copy .env.example to .env and configure your environment"
echo -e "3. Run ${GREEN}pnpm dev${NC} to start the development server"
echo -e "\nHappy coding! 🚀"
