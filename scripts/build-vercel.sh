#!/bin/bash

# Vercel Deployment Build Script for ConstructFlow/PulseCRM
# This script ensures proper build process for monorepo deployment

set -e

echo "🚀 Starting ConstructFlow build process..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 pnpm version: $(pnpm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the web application
echo "🔧 Building web application..."
cd apps/web

# Ensure clean build
rm -rf .next

# Run the build
pnpm run build

echo "✅ Build completed successfully!"

# Verify build output
if [ -d ".next" ]; then
    echo "✅ Next.js build output found"
else
    echo "❌ Next.js build output missing"
    exit 1
fi

# Check for static files
if [ -f ".next/BUILD_ID" ]; then
    echo "✅ Build ID file found"
else
    echo "❌ Build ID file missing"
    exit 1
fi

echo "🎉 Deployment build ready!"
