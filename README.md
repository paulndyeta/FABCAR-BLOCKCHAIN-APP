# FabCar Blockchain Application

A **100% blockchain-based** car ownership management system built on Hyperledger Fabric v1.4. All data is stored on the distributed ledger - no traditional databases.

## Overview

- **Decentralized Car Registry**: Immutable car records on blockchain
- **Smart Contracts**: Automated ownership transfers and validation
- **Multi-Organization Network**: Distributed consensus (Org1, Org2, Orderer)
- **REST API**: Modern web interface for blockchain operations

## Architecture

```
Hyperledger Fabric Network
├── Organizations: Org1, Org2 (2 peers each + CouchDB)
├── Channel: mychannel
├── Smart Contract: FabCar chaincode
├── Consensus: Solo orderer
└── Client: REST API (Node.js/Express)
```

## Prerequisites

| Software | Required Version |
|----------|------------------|
| **Node.js** | v12.22.12 |
| **Docker Desktop** | v20.10+ |
| **Git** | v2.30+ |

**Important**: Use Node.js v12.x (not newer versions)

```bash
# Install Node Version Manager and switch to v12
nvm install 12.22.12
nvm use 12.22.12
```

## Quick Start

```bash
# 1. Setup
git clone <repository-url>
cd FABCAR_BLOCHAIN_APP
nvm use 12.22.12

# 2. Install dependencies
cd fabcar-app/enhanced-client && npm install
cd ../chaincode/fabcar/javascript && npm install

# 3. Start blockchain network
cd ../first-network
./byfn.sh generate
./byfn.sh up -c mychannel -s couchdb

# 4. Deploy chaincode
cd ../fabcar
./startFabric.sh javascript

# 5. Setup client
cd ../enhanced-client
node enrollAdmin.js
node registerUser.js
node app.js  # Starts REST API on port 3000
```

## Usage

### Command Line
```bash
cd fabcar-app/enhanced-client

# Query all cars
node query.js all

# Query specific car
node query.js CAR0

# Create new car
node invoke.js createCar CAR10 Honda Civic Red Alice

# Change ownership
node invoke.js changeCarOwner CAR0 Bob
```

### REST API (http://localhost:3000)
```bash
# Get all cars
curl http://localhost:3000/api/cars

# Create car
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{"carId":"CAR11","make":"BMW","model":"X5","color":"black","owner":"Charlie"}'

# Change ownership
curl -X PUT http://localhost:3000/api/cars/CAR0/owner \
  -H "Content-Type: application/json" \
  -d '{"newOwner":"David"}'
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/cars` | Get all cars |
| GET | `/api/cars/{carId}` | Get specific car |
| POST | `/api/cars` | Create new car |
| PUT | `/api/cars/{carId}/owner` | Change ownership |

## Smart Contract Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `initLedger()` | None | Initialize with 10 sample cars |
| `queryCar(carId)` | carId | Get specific car |
| `queryAllCars()` | None | Get all cars |
| `createCar(carId, make, model, color, owner)` | Car details | Create new car |
| `changeCarOwner(carId, newOwner)` | carId, newOwner | Change ownership |

## Network Configuration

| Component | Details |
|-----------|---------|
| **Organizations** | Org1, Org2 (2 peers each) |
| **Channel** | mychannel |
| **Consensus** | Solo orderer |
| **State DB** | CouchDB |
| **Ports** | Orderer:7050, Peers:7051/9051, API:3000 |

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| **Docker not running** | Start Docker Desktop |
| **Port conflicts** | `docker-compose down && docker system prune -f` |
| **Node.js version** | `nvm use 12.22.12` and reinstall dependencies |
| **Network startup fails** | `./byfn.sh down && ./byfn.sh generate && ./byfn.sh up` |
| **User not enrolled** | Re-run `node enrollAdmin.js && node registerUser.js` |

### Debug Commands
```bash
# Check containers
docker ps

# View logs
docker logs peer0.org1.example.com

# Clean restart
./byfn.sh down && docker system prune -f
```

## Testing

### Quick Tests
```bash
cd fabcar-app/enhanced-client

# 1. Check network health
docker ps | grep hyperledger

# 2. Query all cars (should show CAR0-CAR9)
node query.js all

# 3. Create test car
node invoke.js createCar TEST_CAR Honda Civic blue TestOwner

# 4. Change ownership
node invoke.js changeCarOwner TEST_CAR NewOwner

# 5. Test API
node app.js &
curl http://localhost:3000/api/health
```

### Expected Results
- ✅ 7+ Docker containers running
- ✅ 10 initial cars (CAR0-CAR9) in ledger
- ✅ Car creation and ownership changes work
- ✅ API responds with health status

---

## 📚 Resources

- [Hyperledger Fabric Docs](https://hyperledger-fabric.readthedocs.io/en/release-1.4/)
- [Fabric SDK for Node.js](https://fabric-sdk-node.github.io/)

**🎉 You now have a fully operational blockchain-based car ownership system!**
