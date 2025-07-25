# Enhanced FabCar Client Application

A modern, feature-rich client application for the FabCar blockchain network built with Node.js and Express.

## Features

### 🚀 Core Functionality
- **User Management**: Admin enrollment and user registration
- **Car Operations**: Create, query, update, and transfer car ownership
- **Advanced Queries**: Search by owner, manufacturer, or view transaction history
- **Web Interface**: Modern, responsive web UI for easy interaction
- **REST API**: Complete RESTful API for programmatic access
- **Logging**: Comprehensive logging with Winston

### 🛠 Technical Features
- **Modern Dependencies**: Uses latest Fabric SDK v2.x (compatible with v1.4 networks)
- **Error Handling**: Robust error handling and validation
- **Configuration**: Centralized configuration management
- **Modular Design**: Clean, maintainable code structure
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Project Structure

```
enhanced-client/
├── config.js              # Configuration settings
├── package.json           # Dependencies and scripts
├── app.js                 # Express web server and REST API
├── enrollAdmin.js         # Admin enrollment script
├── registerUser.js        # User registration script
├── query.js              # Query operations CLI
├── invoke.js             # Transaction operations CLI
├── utils/
│   ├── logger.js         # Winston logging configuration
│   └── network.js        # Network connection management
├── public/
│   └── index.html        # Web interface
└── logs/                 # Log files (created automatically)
```

## Prerequisites

- **Node.js** v14.0.0 or higher ✅ (v24.2.0 detected)
- **npm** v6.0.0 or higher ✅ (v11.3.0 detected)
- **Docker** and **Docker Compose** (for running Hyperledger Fabric network)
- **Hyperledger Fabric** v1.4 network running

## Installation

1. **Navigate to the enhanced client directory:**
   ```bash
   cd enhanced-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create logs directory:**
   ```bash
   mkdir logs
   ```

## Configuration

Edit `config.js` to match your network setup:

```javascript
const config = {
    connectionProfilePath: path.resolve(__dirname, '..', 'first-network', 'connection-org1.json'),
    walletPath: path.join(__dirname, 'wallet'),
    channelName: 'mychannel',
    chaincodeName: 'fabcar',
    // ... other settings
};
```

## Usage

### 1. Setup Blockchain Network

First, ensure your Hyperledger Fabric network is running:

```bash
# From the first-network directory
cd ../first-network
./byfn.sh generate
./byfn.sh up

# Start FabCar network
cd ../fabcar
./startFabric.sh javascript
```

### 2. Enroll Admin User

```bash
npm run enroll
# or
node enrollAdmin.js
```

### 3. Register Application User

```bash
npm run register
# or
node registerUser.js [username]
```

### 4. Command Line Interface

#### Query Operations
```bash
# Query all cars
npm run query
# or
node query.js all

# Query specific car
node query.js car CAR0

# Query by owner
node query.js owner "Tomoko"

# Query by manufacturer
node query.js make Toyota

# Get transaction history
node query.js history CAR0
```

#### Transaction Operations
```bash
# Initialize ledger with sample data
node invoke.js init

# Create a new car
node invoke.js create CAR10 Honda Civic blue "John Doe" 2023 5000 30000

# Change car ownership
node invoke.js changeowner CAR0 "Jane Smith"

# Update car details
node invoke.js update CAR0 '{"color":"red","mileage":15000,"price":28000}'
```

### 5. Web Interface

Start the web server:

```bash
npm start
# or
node app.js
```

Then open your browser to: http://localhost:3000

The web interface provides:
- 🔍 **Query Section**: Search and view cars
- ➕ **Create Section**: Add new cars to the blockchain
- 🔄 **Transfer Section**: Change car ownership
- 🚀 **Initialize Section**: Set up sample data

### 6. REST API

The application provides a complete REST API:

#### GET Endpoints
- `GET /api/health` - Health check
- `GET /api/cars` - Get all cars
- `GET /api/cars/:carNumber` - Get specific car
- `GET /api/cars/owner/:owner` - Get cars by owner
- `GET /api/cars/make/:make` - Get cars by manufacturer
- `GET /api/cars/:carNumber/history` - Get car transaction history

#### POST Endpoints
- `POST /api/cars` - Create new car
- `POST /api/init` - Initialize ledger

#### PUT Endpoints
- `PUT /api/cars/:carNumber/owner` - Change car owner
- `PUT /api/cars/:carNumber` - Update car details

#### Example API Usage
```bash
# Get all cars
curl http://localhost:3000/api/cars

# Create a new car
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "carNumber": "CAR10",
    "make": "Honda",
    "model": "Civic",
    "color": "blue",
    "owner": "John Doe",
    "year": 2023,
    "mileage": 5000,
    "price": 30000
  }'

# Change car owner
curl -X PUT http://localhost:3000/api/cars/CAR0/owner \
  -H "Content-Type: application/json" \
  -d '{"newOwner": "Jane Smith"}'
```

## Logging

Logs are automatically created in the `logs/` directory:
- `fabcar.log` - All application logs
- `error.log` - Error logs only

Log levels: error, warn, info, debug

## Troubleshooting

### Common Issues

1. **Connection Profile Not Found**
   - Ensure the `first-network` is running
   - Check the `connectionProfilePath` in `config.js`

2. **Admin Not Enrolled**
   - Run `node enrollAdmin.js` first
   - Check if `wallet/admin.id` exists

3. **User Not Registered**
   - Run `node registerUser.js` after enrolling admin
   - Check if `wallet/appUser.id` exists

4. **Network Connection Issues**
   - Verify Docker containers are running: `docker ps`
   - Check network connectivity to peers and orderers

5. **Chaincode Not Installed**
   - Ensure FabCar chaincode is installed and instantiated
   - Check chaincode name in `config.js`

### Dependency Issues

If you encounter issues with the original fabric-client dependencies, this enhanced client uses newer, more compatible versions:

- `fabric-network` v2.2.20 (instead of v1.4.x)
- `fabric-ca-client` v2.2.20 (instead of v1.4.x)

These newer versions are backward compatible with v1.4 networks.

## Development

### Adding New Features

1. **New Query Functions**: Add to `utils/network.js` and `query.js`
2. **New Transaction Functions**: Add to `utils/network.js` and `invoke.js`
3. **New API Endpoints**: Add to `app.js`
4. **New UI Features**: Modify `public/index.html`

### Testing

```bash
# Test network connection
node -e "const NetworkManager = require('./utils/network'); const nm = new NetworkManager(); nm.connect().then(() => console.log('Connected!')).catch(console.error);"

# Test API endpoints
curl http://localhost:3000/api/health
```

## License

Apache-2.0

## Support

For issues and questions:
1. Check the logs in `logs/fabcar.log`
2. Verify network connectivity
3. Ensure all prerequisites are met
4. Review the Hyperledger Fabric documentation
