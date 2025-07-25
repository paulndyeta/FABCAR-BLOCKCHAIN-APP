# FabCar Blockchain Application

A Hyperledger Fabric v1.4 blockchain application for managing car ownership using smart contracts.

## Overview

This project demonstrates a complete blockchain application built on Hyperledger Fabric v1.4 that allows users to:
- Query existing cars in the ledger
- Create new cars
- Change car ownership
- Query all cars

## Project Structure

```
fabcar-app/
├── first-network/          # Blockchain network configuration
│   ├── byfn.sh             # Build Your First Network script
│   ├── configtx.yaml       # Channel configuration
│   ├── crypto-config.yaml  # Cryptographic material configuration
│   └── docker-compose-*.yaml # Docker compose files
├── chaincode/              # Smart contracts
│   └── fabcar/
│       └── javascript/     # FabCar smart contract in JavaScript
├── fabcar/                 # Client applications
│   ├── javascript/         # JavaScript client application
│   ├── startFabric.sh      # Script to start the network
│   └── stopFabric.sh       # Script to stop the network
└── README.md              # This file
```

## Prerequisites

### Required Software
1. **Docker** (v17.06.2-ce or higher)
2. **Docker Compose** (v1.14.0 or higher)
3. **Node.js** (v8.9.0 or higher) ✅ Installed (v24.2.0)
4. **npm** (v5.x or higher) ✅ Installed (v11.3.0)
5. **Git** ✅ Installed (v2.49.0)

### Installation Status
- ✅ Node.js v24.2.0 - Installed
- ✅ npm v11.3.0 - Installed  
- ✅ Git v2.49.0 - Installed
- ❌ Docker - **REQUIRED: Please install Docker Desktop**
- ❌ Docker Compose - **REQUIRED: Comes with Docker Desktop**

### Installing Docker Desktop (Windows)
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Run the installer and follow the setup wizard
3. Restart your computer if prompted
4. Verify installation: `docker --version` and `docker-compose --version`

## Quick Start

### Step 1: Install Dependencies
```bash
cd fabcar/javascript
npm install
```

### Step 2: Start the Blockchain Network
```bash
cd first-network
./byfn.sh generate
./byfn.sh up
```

### Step 3: Start FabCar Network
```bash
cd ../fabcar
./startFabric.sh javascript
```

### Step 4: Install Application Dependencies
```bash
cd javascript
npm install
```

### Step 5: Enroll Admin User
```bash
node enrollAdmin.js
```

### Step 6: Register Application User
```bash
node registerUser.js
```

### Step 7: Query All Cars
```bash
node query.js
```

### Step 8: Create a New Car
```bash
node invoke.js
```

## Smart Contract Functions

The FabCar smart contract provides the following functions:

### `initLedger()`
Initializes the ledger with 10 sample cars (CAR0 through CAR9).

### `queryCar(carNumber)`
Queries a specific car by its key (e.g., "CAR0").

### `queryAllCars()`
Returns all cars in the ledger.

### `createCar(carNumber, make, model, color, owner)`
Creates a new car with the specified attributes.

### `changeCarOwner(carNumber, newOwner)`
Changes the owner of an existing car.

## Application Files

### Client Application (`fabcar/javascript/`)
- `enrollAdmin.js` - Enrolls the admin user with the CA
- `registerUser.js` - Registers and enrolls a new user
- `query.js` - Queries cars from the ledger
- `invoke.js` - Invokes transactions to create cars or change ownership

### Smart Contract (`chaincode/fabcar/javascript/`)
- `lib/fabcar.js` - Main smart contract implementation
- `index.js` - Contract entry point
- `package.json` - Contract dependencies

## Network Configuration

### Organizations
- **Org1** - First organization with 2 peers
- **Org2** - Second organization with 2 peers
- **Orderer** - Ordering service (Solo consensus)

### Channels
- **mychannel** - Main application channel

## Troubleshooting

### Common Issues

1. **Docker not found**
   - Install Docker Desktop and ensure it's running
   - Add Docker to your system PATH

2. **Permission denied on scripts**
   ```bash
   chmod +x *.sh
   ```

3. **Port conflicts**
   - Ensure ports 7050-7054, 8050-8054, 9050-9054 are available
   - Stop any conflicting services

4. **Network cleanup**
   ```bash
   ./byfn.sh down
   docker system prune -a
   ```

## Next Steps

1. Install Docker Desktop
2. Run the quick start guide
3. Experiment with the smart contract functions
4. Modify the application to add new features

## References

- [Hyperledger Fabric Documentation v1.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4/)
- [Writing Your First Application](https://hyperledger-fabric.readthedocs.io/en/release-1.4/write_first_app.html)
- [Building Your First Network](https://hyperledger-fabric.readthedocs.io/en/release-1.4/build_network.html)
