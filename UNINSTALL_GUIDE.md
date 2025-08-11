# 🗑️ FabCar Blockchain Project Uninstaller

This guide helps you **safely remove only the FabCar project components** while preserving your system installations (Docker, Node.js, Git, etc.).

## 🎯 What Gets Removed

### ✅ **WILL BE REMOVED:**
- **Docker Containers**: FabCar-specific containers (peers, orderer, CouchDB, CLI)
- **Docker Images**: Hyperledger Fabric images (peer, orderer, tools, CA, etc.)
- **Node.js Dependencies**: `node_modules` directories in project folders
- **Generated Files**: Crypto materials, certificates, channel artifacts
- **Wallet Files**: User identities and admin credentials
- **Log Files**: Application logs and temporary files
- **Build Artifacts**: `.block`, `.tx` files, and other generated content

### ❌ **WILL NOT BE REMOVED:**
- **Docker Desktop**: Your Docker installation remains intact
- **Node.js**: Your Node.js installation remains intact
- **Git**: Your Git installation remains intact
- **Project Source Code**: All `.js`, `.md`, `.json` source files
- **Documentation**: README files and guides
- **Other Docker Images**: Non-Fabric related images
- **System Files**: No system-level changes

## 🚀 Quick Start

### Windows (PowerShell - Recommended)
```powershell
# Basic uninstall
.\uninstall-fabcar.ps1

# Force uninstall (no confirmations)
.\uninstall-fabcar.ps1 -Force

# Dry run (see what would be removed)
.\uninstall-fabcar.ps1 -DryRun
```

### Windows (Batch File)
```cmd
# Basic uninstall
uninstall-fabcar.bat

# With options
uninstall-fabcar.bat --force --dry-run
```

### Linux/macOS (Bash)
```bash
# Basic uninstall
./uninstall-fabcar.sh

# Force uninstall (no confirmations)
./uninstall-fabcar.sh --force

# Dry run (see what would be removed)
./uninstall-fabcar.sh --dry-run
```

## 📋 Available Options

| Option | PowerShell | Bash/Batch | Description |
|--------|------------|------------|-------------|
| **Force** | `-Force` | `--force` | Remove without confirmation prompts |
| **Keep Node Modules** | `-KeepNodeModules` | `--keep-node-modules` | Don't remove `node_modules` directories |
| **Keep Docker Images** | `-KeepDockerImages` | `--keep-docker-images` | Don't remove Docker images |
| **Dry Run** | `-DryRun` | `--dry-run` | Show what would be removed without doing it |
| **Help** | `-Help` | `--help` | Show usage information |

## 🔍 Detailed Removal Process

### 1. **Docker Containers Removed**
```
cli
orderer.example.com
peer0.org1.example.com
peer1.org1.example.com
peer0.org2.example.com
peer1.org2.example.com
couchdb0, couchdb1, couchdb2, couchdb3
```

### 2. **Docker Images Removed**
```
hyperledger/fabric-peer:*
hyperledger/fabric-orderer:*
hyperledger/fabric-ccenv:*
hyperledger/fabric-javaenv:*
hyperledger/fabric-tools:*
hyperledger/fabric-ca:*
hyperledger/fabric-couchdb:*
hyperledger/fabric-kafka:*
hyperledger/fabric-zookeeper:*
dev-peer*fabcar* (chaincode images)
```

### 3. **Directories Removed**
```
fabcar-app/enhanced-client/node_modules/
fabcar-app/enhanced-client/wallet/
fabcar-app/enhanced-client/logs/
fabcar-app/chaincode/fabcar/javascript/node_modules/
fabcar-app/first-network/crypto-config/
fabcar-app/first-network/channel-artifacts/
fabric-samples/first-network/crypto-config/
fabric-samples/first-network/channel-artifacts/
fabric-samples/balance-transfer/artifacts/channel/crypto-config/
```

### 4. **Files Removed**
```
*.block files (channel blocks)
*.tx files (transaction files)
Log files in logs/ directories
Identity files in wallet/ directories
```

## 🛡️ Safety Features

### **Confirmation Prompts**
- Each removal step asks for confirmation (unless `--force` is used)
- You can selectively skip items you want to keep

### **Dry Run Mode**
```bash
# See exactly what would be removed
./uninstall-fabcar.sh --dry-run
```

### **Selective Removal**
```bash
# Keep node_modules but remove everything else
./uninstall-fabcar.sh --keep-node-modules

# Keep Docker images but remove containers and files
./uninstall-fabcar.sh --keep-docker-images
```

## 📊 Storage Space Recovered

| Component | Typical Size |
|-----------|--------------|
| **Docker Images** | ~2GB |
| **Node Modules** | ~100MB |
| **Generated Files** | ~50MB |
| **Containers** | ~10MB |
| **Total Recovery** | **~2.2GB** |

## 🔧 Manual Cleanup (If Needed)

If the scripts don't work or you prefer manual cleanup:

### Remove Docker Components
```bash
# Stop all FabCar containers
docker stop $(docker ps -a -q --filter "name=peer*" --filter "name=orderer*" --filter "name=cli")

# Remove all FabCar containers
docker rm $(docker ps -a -q --filter "name=peer*" --filter "name=orderer*" --filter "name=cli")

# Remove Fabric images
docker rmi $(docker images "hyperledger/fabric-*" -q)

# Clean system
docker system prune -f
```

### Remove Node Dependencies
```bash
# Remove node_modules
find . -name "node_modules" -type d -exec rm -rf {} +

# Remove package-lock files
find . -name "package-lock.json" -delete
```

## 🚨 Troubleshooting

### **Permission Errors**
```bash
# Linux/macOS: Run with sudo if needed
sudo ./uninstall-fabcar.sh --force

# Windows: Run PowerShell as Administrator
```

### **Docker Errors**
```bash
# If Docker commands fail, ensure Docker is running
docker --version
docker ps
```

### **Script Not Found**
```bash
# Make sure you're in the project directory
cd /path/to/FABCAR_BLOCHAIN_APP

# Make script executable (Linux/macOS)
chmod +x uninstall-fabcar.sh
```

## 🔄 Reinstalling After Uninstall

After uninstalling, you can reinstall by running:

```bash
# Reinstall Node dependencies
cd fabcar-app/enhanced-client && npm install
cd ../chaincode/fabcar/javascript && npm install

# Reinstall Docker images and setup network
./bootstrap.sh
./setup-fabric.ps1
```

## ⚠️ Important Notes

1. **Backup First**: If you have custom configurations or data, back them up before uninstalling
2. **Docker Desktop**: The uninstaller will NOT remove Docker Desktop itself
3. **Other Projects**: This only affects FabCar - other blockchain projects remain untouched
4. **Reversible**: You can always reinstall the project components later

## 📞 Support

If you encounter issues:
1. Try running with `--dry-run` first to see what would be removed
2. Use `--force` to skip confirmation prompts
3. Check the troubleshooting section above
4. Manually remove components if scripts fail

---

**🎉 Safe and clean uninstallation of FabCar blockchain components!**
