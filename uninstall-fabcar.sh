#!/bin/bash
# Bash script to uninstall FabCar Blockchain Project components
# This script removes ONLY project-specific files, Docker images, and dependencies
# It preserves your system Docker installation and other unrelated components

set -e

# Parse command line arguments
FORCE=false
KEEP_NODE_MODULES=false
KEEP_DOCKER_IMAGES=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --keep-node-modules)
            KEEP_NODE_MODULES=true
            shift
            ;;
        --keep-docker-images)
            KEEP_DOCKER_IMAGES=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --force                Remove without confirmation"
            echo "  --keep-node-modules    Don't remove node_modules directories"
            echo "  --keep-docker-images   Don't remove Docker images"
            echo "  --dry-run             Show what would be removed without doing it"
            echo "  -h, --help            Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🗑️  FabCar Blockchain Project Uninstaller"
echo "========================================="

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN MODE - No files will be deleted"
    echo ""
fi

# Function to safely remove items
remove_safely() {
    local path="$1"
    local description="$2"
    
    if [ "$DRY_RUN" = true ]; then
        echo "   [DRY RUN] Would remove: $description"
        return
    fi
    
    if [ -e "$path" ]; then
        if [ "$FORCE" = true ]; then
            response="y"
        else
            read -p "Remove $description? (y/N): " response
        fi
        
        if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
            if rm -rf "$path" 2>/dev/null; then
                echo "   ✅ Removed: $description"
            else
                echo "   ❌ Failed to remove: $description"
            fi
        else
            echo "   ⏭️  Skipped: $description"
        fi
    else
        echo "   ℹ️  Not found: $description"
    fi
}

# Function to remove Docker containers
remove_fabcar_containers() {
    echo "🐳 Stopping and removing FabCar Docker containers..."
    
    local containers=(
        "cli"
        "orderer.example.com"
        "peer0.org1.example.com"
        "peer1.org1.example.com"
        "peer0.org2.example.com"
        "peer1.org2.example.com"
        "couchdb0"
        "couchdb1"
        "couchdb2"
        "couchdb3"
    )
    
    for container in "${containers[@]}"; do
        if [ "$DRY_RUN" = true ]; then
            echo "   [DRY RUN] Would stop/remove container: $container"
        else
            if docker ps -a --format "table {{.Names}}" | grep -q "^$container$" 2>/dev/null; then
                docker stop "$container" 2>/dev/null || true
                docker rm "$container" 2>/dev/null || true
                echo "   ✅ Removed container: $container"
            else
                echo "   ℹ️  Container not found: $container"
            fi
        fi
    done
}

# Function to remove Docker images
remove_fabcar_docker_images() {
    if [ "$KEEP_DOCKER_IMAGES" = true ]; then
        echo "⏭️  Skipping Docker images removal (--keep-docker-images specified)"
        return
    fi
    
    echo "🐳 Removing FabCar-specific Docker images..."
    
    local image_patterns=(
        "hyperledger/fabric-peer"
        "hyperledger/fabric-orderer"
        "hyperledger/fabric-ccenv"
        "hyperledger/fabric-javaenv"
        "hyperledger/fabric-tools"
        "hyperledger/fabric-ca"
        "hyperledger/fabric-couchdb"
        "hyperledger/fabric-kafka"
        "hyperledger/fabric-zookeeper"
    )
    
    for pattern in "${image_patterns[@]}"; do
        if [ "$DRY_RUN" = true ]; then
            echo "   [DRY RUN] Would remove images matching: $pattern"
        else
            local images=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep "$pattern" 2>/dev/null || true)
            if [ -n "$images" ]; then
                echo "$images" | while read -r image; do
                    if [ -n "$image" ] && [ "$image" != "REPOSITORY:TAG" ]; then
                        docker rmi "$image" --force 2>/dev/null || true
                        echo "   ✅ Removed image: $image"
                    fi
                done
            else
                echo "   ℹ️  No images found matching: $pattern"
            fi
        fi
    done
    
    # Remove chaincode images
    if [ "$DRY_RUN" = false ]; then
        local chaincode_images=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep "dev-peer.*fabcar" 2>/dev/null || true)
        if [ -n "$chaincode_images" ]; then
            echo "$chaincode_images" | while read -r image; do
                if [ -n "$image" ] && [ "$image" != "REPOSITORY:TAG" ]; then
                    docker rmi "$image" --force 2>/dev/null || true
                    echo "   ✅ Removed chaincode image: $image"
                fi
            done
        fi
    fi
}

# Function to remove Node.js dependencies
remove_node_modules() {
    if [ "$KEEP_NODE_MODULES" = true ]; then
        echo "⏭️  Skipping node_modules removal (--keep-node-modules specified)"
        return
    fi
    
    echo "📦 Removing Node.js dependencies..."
    
    local node_paths=(
        "fabcar-app/enhanced-client/node_modules"
        "fabcar-app/chaincode/fabcar/javascript/node_modules"
        "fabric-samples/fabcar/javascript/node_modules"
    )
    
    for path in "${node_paths[@]}"; do
        remove_safely "$path" "Node modules: $path"
    done
}

# Main uninstall process
echo ""
echo "🔍 Scanning for FabCar components..."

# 1. Stop and remove Docker containers
remove_fabcar_containers

# 2. Remove Docker images
remove_fabcar_docker_images

# 3. Remove Node.js dependencies
remove_node_modules

# 4. Remove generated files and directories
echo "🗂️  Removing generated files and directories..."

declare -a generated_paths=(
    "fabcar-app/enhanced-client/wallet"
    "fabcar-app/enhanced-client/logs"
    "fabcar-app/first-network/crypto-config"
    "fabcar-app/first-network/channel-artifacts"
    "fabric-samples/first-network/crypto-config"
    "fabric-samples/first-network/channel-artifacts"
    "fabric-samples/balance-transfer/artifacts/channel/crypto-config"
)

for path in "${generated_paths[@]}"; do
    remove_safely "$path" "Generated directory: $path"
done

# Remove specific file patterns
if [ "$DRY_RUN" = false ]; then
    find fabcar-app/first-network/ -name "*.block" -delete 2>/dev/null || true
    find fabcar-app/first-network/ -name "*.tx" -delete 2>/dev/null || true
    echo "   ✅ Removed .block and .tx files"
fi

# 5. Clean Docker system (project-specific)
if [ "$DRY_RUN" = false ]; then
    echo "🧹 Cleaning Docker system..."
    if [ "$FORCE" = true ]; then
        response="y"
    else
        read -p "Clean unused Docker volumes and networks? (y/N): " response
    fi
    
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        docker volume prune -f 2>/dev/null || true
        docker network prune -f 2>/dev/null || true
        echo "   ✅ Docker system cleaned"
    fi
fi

echo ""
echo "📊 Uninstall Summary:"
echo "====================="
echo "✅ FabCar Docker containers stopped and removed"
if [ "$KEEP_DOCKER_IMAGES" = false ]; then
    echo "✅ Hyperledger Fabric Docker images removed"
fi
if [ "$KEEP_NODE_MODULES" = false ]; then
    echo "✅ Project Node.js dependencies removed"
fi
echo "✅ Generated crypto materials and artifacts removed"
echo "✅ Wallet and log files removed"

echo ""
echo "ℹ️  What was NOT removed:"
echo "   • Docker installation"
echo "   • Node.js installation"
echo "   • Git installation"
echo "   • Project source code files"
echo "   • Documentation and README files"

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🔍 This was a DRY RUN - no files were actually deleted"
    echo "   Run without --dry-run to perform actual uninstall"
fi

echo ""
echo "🎉 FabCar project components uninstalled successfully!"
