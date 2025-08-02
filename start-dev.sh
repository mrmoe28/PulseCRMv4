#!/bin/bash

# Start the development server with environment variables
export NODE_OPTIONS="--max-old-space-size=8192"
export NEXT_TELEMETRY_DISABLED=1

# Navigate to project directory
# Use the directory where this script is located
cd "$(dirname "$0")"

# Kill any existing processes on port 3010
lsof -ti:3010 | xargs kill -9 2>/dev/null || true

# Clear Next.js cache
rm -rf apps/web/.next

# Start the development server
pnpm dev
