#!/bin/bash

# Unset npm prefix to avoid conflicts
unset npm_config_prefix

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node 20 and use it
nvm install 20
nvm use 20
nvm alias default 20

# Verify the version
echo "Node version:"
node --version

echo "NPM version:"
npm --version

# Install pnpm if needed
npm install -g pnpm

echo "Setup complete! Now run: pnpm install && pnpm dev"
