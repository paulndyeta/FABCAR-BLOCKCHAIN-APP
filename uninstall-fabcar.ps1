# PowerShell script to uninstall FabCar Blockchain Project components
# This script removes ONLY project-specific files, Docker images, and dependencies
# It preserves your system Docker installation and other unrelated components

param(
    [switch]$Force,
    [switch]$KeepNodeModules,
    [switch]$KeepDockerImages,
    [switch]$DryRun
)

Write-Host "🗑️  FabCar Blockchain Project Uninstaller" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be deleted" -ForegroundColor Yellow
    Write-Host ""
}

# Function to safely remove items
function Remove-SafelyWithConfirmation {
    param(
        [string]$Path,
        [string]$Description,
        [switch]$IsContainer,
        [switch]$IsImage
    )
    
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would remove: $Description" -ForegroundColor Yellow
        return
    }
    
    if (Test-Path $Path -ErrorAction SilentlyContinue) {
        if ($Force -or (Read-Host "Remove $Description? (y/N)") -eq 'y') {
            try {
                Remove-Item $Path -Recurse -Force -ErrorAction Stop
                Write-Host "   ✅ Removed: $Description" -ForegroundColor Green
            } catch {
                Write-Host "   ❌ Failed to remove: $Description - $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "   ⏭️  Skipped: $Description" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ℹ️  Not found: $Description" -ForegroundColor Gray
    }
}

# Function to remove Docker containers
function Remove-FabCarContainers {
    Write-Host "🐳 Stopping and removing FabCar Docker containers..." -ForegroundColor Cyan
    
    $fabcarContainers = @(
        "cli",
        "orderer.example.com",
        "peer0.org1.example.com",
        "peer1.org1.example.com", 
        "peer0.org2.example.com",
        "peer1.org2.example.com",
        "couchdb0",
        "couchdb1",
        "couchdb2", 
        "couchdb3"
    )
    
    foreach ($container in $fabcarContainers) {
        if ($DryRun) {
            Write-Host "   [DRY RUN] Would stop/remove container: $container" -ForegroundColor Yellow
        } else {
            try {
                docker stop $container 2>$null
                docker rm $container 2>$null
                Write-Host "   ✅ Removed container: $container" -ForegroundColor Green
            } catch {
                Write-Host "   ℹ️  Container not found: $container" -ForegroundColor Gray
            }
        }
    }
}

# Function to remove Docker images
function Remove-FabCarDockerImages {
    if ($KeepDockerImages) {
        Write-Host "⏭️  Skipping Docker images removal (--KeepDockerImages specified)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🐳 Removing FabCar-specific Docker images..." -ForegroundColor Cyan
    
    $fabricImages = @(
        "hyperledger/fabric-peer:*",
        "hyperledger/fabric-orderer:*",
        "hyperledger/fabric-ccenv:*",
        "hyperledger/fabric-javaenv:*",
        "hyperledger/fabric-tools:*",
        "hyperledger/fabric-ca:*",
        "hyperledger/fabric-couchdb:*",
        "hyperledger/fabric-kafka:*",
        "hyperledger/fabric-zookeeper:*",
        "dev-peer*fabcar*"
    )
    
    foreach ($imagePattern in $fabricImages) {
        if ($DryRun) {
            Write-Host "   [DRY RUN] Would remove images matching: $imagePattern" -ForegroundColor Yellow
        } else {
            try {
                $images = docker images --format "table {{.Repository}}:{{.Tag}}" | Select-String $imagePattern.Replace("*", ".*")
                if ($images) {
                    $images | ForEach-Object {
                        $imageName = $_.ToString().Trim()
                        docker rmi $imageName --force 2>$null
                        Write-Host "   ✅ Removed image: $imageName" -ForegroundColor Green
                    }
                }
            } catch {
                Write-Host "   ℹ️  No images found matching: $imagePattern" -ForegroundColor Gray
            }
        }
    }
}

# Function to remove Node.js dependencies
function Remove-NodeModules {
    if ($KeepNodeModules) {
        Write-Host "⏭️  Skipping node_modules removal (--KeepNodeModules specified)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "📦 Removing Node.js dependencies..." -ForegroundColor Cyan
    
    $nodeModulesPaths = @(
        "fabcar-app/enhanced-client/node_modules",
        "fabcar-app/chaincode/fabcar/javascript/node_modules",
        "fabric-samples/fabcar/javascript/node_modules"
    )
    
    foreach ($path in $nodeModulesPaths) {
        Remove-SafelyWithConfirmation -Path $path -Description "Node modules: $path"
    }
}

# Main uninstall process
Write-Host ""
Write-Host "🔍 Scanning for FabCar components..." -ForegroundColor Cyan

# 1. Stop and remove Docker containers
Remove-FabCarContainers

# 2. Remove Docker images
Remove-FabCarDockerImages

# 3. Remove Node.js dependencies
Remove-NodeModules

# 4. Remove generated files and directories
Write-Host "🗂️  Removing generated files and directories..." -ForegroundColor Cyan

$generatedPaths = @(
    "fabcar-app/enhanced-client/wallet",
    "fabcar-app/enhanced-client/logs", 
    "fabcar-app/first-network/crypto-config",
    "fabcar-app/first-network/channel-artifacts",
    "fabcar-app/first-network/*.block",
    "fabcar-app/first-network/*.tx",
    "fabric-samples/first-network/crypto-config",
    "fabric-samples/first-network/channel-artifacts",
    "fabric-samples/balance-transfer/artifacts/channel/crypto-config"
)

foreach ($path in $generatedPaths) {
    if ($path -like "*.*") {
        # Handle file patterns
        $files = Get-ChildItem $path -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Remove-SafelyWithConfirmation -Path $file.FullName -Description "Generated file: $($file.Name)"
        }
    } else {
        Remove-SafelyWithConfirmation -Path $path -Description "Generated directory: $path"
    }
}

# 5. Clean Docker system (project-specific)
if (-not $DryRun) {
    Write-Host "🧹 Cleaning Docker system..." -ForegroundColor Cyan
    if ($Force -or (Read-Host "Clean unused Docker volumes and networks? (y/N)") -eq 'y') {
        docker volume prune -f 2>$null
        docker network prune -f 2>$null
        Write-Host "   ✅ Docker system cleaned" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📊 Uninstall Summary:" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "✅ FabCar Docker containers stopped and removed" -ForegroundColor White
if (-not $KeepDockerImages) {
    Write-Host "✅ Hyperledger Fabric Docker images removed" -ForegroundColor White
}
if (-not $KeepNodeModules) {
    Write-Host "✅ Project Node.js dependencies removed" -ForegroundColor White
}
Write-Host "✅ Generated crypto materials and artifacts removed" -ForegroundColor White
Write-Host "✅ Wallet and log files removed" -ForegroundColor White

Write-Host ""
Write-Host "ℹ️  What was NOT removed:" -ForegroundColor Blue
Write-Host "   • Docker Desktop installation" -ForegroundColor White
Write-Host "   • Node.js installation" -ForegroundColor White  
Write-Host "   • Git installation" -ForegroundColor White
Write-Host "   • Project source code files" -ForegroundColor White
Write-Host "   • Documentation and README files" -ForegroundColor White

if ($DryRun) {
    Write-Host ""
    Write-Host "🔍 This was a DRY RUN - no files were actually deleted" -ForegroundColor Yellow
    Write-Host "   Run without -DryRun to perform actual uninstall" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 FabCar project components uninstalled successfully!" -ForegroundColor Green
