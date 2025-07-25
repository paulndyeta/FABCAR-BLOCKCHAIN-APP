#!/bin/bash

# FabCar Blockchain Application Setup Script
# This script helps set up the FabCar application environment

set -e

echo "=========================================="
echo "FabCar Blockchain Application Setup"
echo "=========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check version
check_version() {
    local cmd=$1
    local min_version=$2
    local current_version=$($cmd --version 2>/dev/null | head -n1)
    echo "✓ $cmd: $current_version"
}

echo "Checking prerequisites..."

# Check Node.js
if command_exists node; then
    check_version "node" "8.9.0"
else
    echo "❌ Node.js is not installed. Please install Node.js v8.9.0 or higher."
    exit 1
fi

# Check npm
if command_exists npm; then
    check_version "npm" "5.0.0"
else
    echo "❌ npm is not installed. Please install npm v5.0.0 or higher."
    exit 1
fi

# Check Git
if command_exists git; then
    check_version "git" "2.0.0"
else
    echo "❌ Git is not installed. Please install Git."
    exit 1
fi

# Check Docker
if command_exists docker; then
    check_version "docker" "17.06.2"
    DOCKER_AVAILABLE=true
else
    echo "❌ Docker is not installed."
    echo "   Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    DOCKER_AVAILABLE=false
fi

# Check Docker Compose
if command_exists docker-compose; then
    check_version "docker-compose" "1.14.0"
    DOCKER_COMPOSE_AVAILABLE=true
else
    echo "❌ Docker Compose is not installed."
    echo "   Docker Compose comes with Docker Desktop."
    DOCKER_COMPOSE_AVAILABLE=false
fi

echo ""
echo "=========================================="
echo "Setting up FabCar Application..."
echo "=========================================="

# Install JavaScript client dependencies
echo "Installing JavaScript client dependencies..."
cd fabcar/javascript
npm install
echo "✓ JavaScript client dependencies installed"

cd ../..

# Install chaincode dependencies
echo "Installing chaincode dependencies..."
cd chaincode/fabcar/javascript
npm install
echo "✓ Chaincode dependencies installed"

cd ../../..

echo ""
echo "=========================================="
echo "Setup Summary"
echo "=========================================="

if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
    echo "✅ All prerequisites are installed!"
    echo ""
    echo "Next steps:"
    echo "1. Start the blockchain network:"
    echo "   cd first-network"
    echo "   ./byfn.sh generate"
    echo "   ./byfn.sh up"
    echo ""
    echo "2. Start the FabCar network:"
    echo "   cd ../fabcar"
    echo "   ./startFabric.sh javascript"
    echo ""
    echo "3. Run the application:"
    echo "   cd javascript"
    echo "   node enrollAdmin.js"
    echo "   node registerUser.js"
    echo "   node query.js"
    echo "   node invoke.js"
else
    echo "⚠️  Setup incomplete - Docker is required"
    echo ""
    echo "Please install Docker Desktop and run this script again."
    echo "Download from: https://www.docker.com/products/docker-desktop"
    echo ""
    echo "After installing Docker, you can:"
    echo "1. Run this setup script again: ./setup.sh"
    echo "2. Follow the steps in README.md"
fi

echo ""
echo "For detailed instructions, see README.md"
echo "=========================================="
