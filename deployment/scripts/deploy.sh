#!/bin/bash

# 🚀 ConstructFlow/PulseCRM Deployment Script
# Automated deployment for production environments

set -e  # Exit on any error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$DEPLOYMENT_DIR/logs/deploy_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Create logs directory
mkdir -p "$DEPLOYMENT_DIR/logs"

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║               ConstructFlow/PulseCRM Deployment              ║"
echo "║                     Production Deploy                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Parse command line arguments
DEPLOY_TYPE=${1:-"docker"}
ENVIRONMENT=${2:-"production"}

log "Starting deployment: Type=$DEPLOY_TYPE, Environment=$ENVIRONMENT"