# FabCar Smart Contract Guide

## Overview

The FabCar smart contract is a Hyperledger Fabric chaincode written in JavaScript that manages car ownership and details on the blockchain. This contract demonstrates key blockchain concepts including asset creation, querying, and ownership transfer.

## Contract Versions

### 1. Original FabCar Contract (`lib/fabcar.js`)
The basic implementation with core functionality:
- `initLedger()` - Initialize with sample cars
- `queryCar(carNumber)` - Query a specific car
- `queryAllCars()` - Query all cars
- `createCar(carNumber, make, model, color, owner)` - Create a new car
- `changeCarOwner(carNumber, newOwner)` - Change car ownership

### 2. Enhanced FabCar Contract (`lib/fabcar-enhanced.js`)
Extended implementation with additional features:
- All original functions plus:
- `updateCarDetails(carNumber, updates)` - Update car information
- `queryCarsByOwner(owner)` - Find cars by owner
- `queryCarsByMake(make)` - Find cars by manufacturer
- `getCarHistory(carNumber)` - Get transaction history
- Enhanced data model with year, mileage, price, status
- Event emission for important transactions
- Input validation and error handling

## Data Model

### Car Object Structure (Enhanced Version)
```json
{
  "color": "blue",
  "make": "Toyota",
  "model": "Prius",
  "owner": "Tomoko",
  "year": 2020,
  "mileage": 15000,
  "price": 25000,
  "status": "available",
  "docType": "car",
  "createdAt": "2024-06-24T17:30:00.000Z",
  "lastModified": "2024-06-24T17:30:00.000Z"
}
```

## Function Reference

### Core Functions

#### `initLedger()`
Initializes the ledger with sample car data.
- **Parameters**: None
- **Returns**: None
- **Usage**: Called once during chaincode instantiation

#### `queryCar(carNumber)`
Retrieves a specific car by its key.
- **Parameters**: 
  - `carNumber` (string): Car identifier (e.g., "CAR0")
- **Returns**: JSON string of car object
- **Throws**: Error if car doesn't exist

#### `queryAllCars()`
Retrieves all cars in the ledger.
- **Parameters**: None
- **Returns**: JSON array of all cars
- **Usage**: For displaying car inventory

#### `createCar(carNumber, make, model, color, owner, [year], [mileage], [price])`
Creates a new car record.
- **Parameters**:
  - `carNumber` (string): Unique car identifier
  - `make` (string): Car manufacturer
  - `model` (string): Car model
  - `color` (string): Car color
  - `owner` (string): Owner name
  - `year` (number, optional): Manufacturing year
  - `mileage` (number, optional): Current mileage
  - `price` (number, optional): Car price
- **Returns**: JSON string of created car
- **Events**: Emits `CarCreated` event

#### `changeCarOwner(carNumber, newOwner)`
Transfers car ownership.
- **Parameters**:
  - `carNumber` (string): Car identifier
  - `newOwner` (string): New owner name
- **Returns**: JSON string of updated car
- **Events**: Emits `CarOwnerChanged` event

### Enhanced Functions (Enhanced Version Only)

#### `updateCarDetails(carNumber, updates)`
Updates car information.
- **Parameters**:
  - `carNumber` (string): Car identifier
  - `updates` (JSON string): Fields to update
- **Allowed Updates**: color, mileage, price, status
- **Returns**: JSON string of updated car

#### `queryCarsByOwner(owner)`
Finds all cars owned by a specific person.
- **Parameters**:
  - `owner` (string): Owner name
- **Returns**: JSON array of cars
- **Requires**: CouchDB state database

#### `queryCarsByMake(make)`
Finds all cars by manufacturer.
- **Parameters**:
  - `make` (string): Car manufacturer
- **Returns**: JSON array of cars
- **Requires**: CouchDB state database

#### `getCarHistory(carNumber)`
Retrieves transaction history for a car.
- **Parameters**:
  - `carNumber` (string): Car identifier
- **Returns**: JSON array of historical transactions

## Events

The enhanced contract emits the following events:

### CarCreated
Emitted when a new car is created.
```json
{
  "carNumber": "CAR10",
  "owner": "Alice",
  "make": "Honda",
  "model": "Civic"
}
```

### CarOwnerChanged
Emitted when car ownership changes.
```json
{
  "carNumber": "CAR0",
  "previousOwner": "Tomoko",
  "newOwner": "Bob",
  "timestamp": "2024-06-24T17:30:00.000Z"
}
```

## Error Handling

The contract includes comprehensive error handling:
- Input validation for required fields
- Existence checks for car operations
- Duplicate prevention for car creation
- Type validation for numeric fields

## Usage Examples

### Creating a Car
```javascript
// Basic creation
await contract.submitTransaction('createCar', 'CAR10', 'Honda', 'Civic', 'blue', 'Alice');

// Enhanced creation with all fields
await contract.submitTransaction('createCar', 'CAR10', 'Honda', 'Civic', 'blue', 'Alice', '2023', '5000', '30000');
```

### Querying Cars
```javascript
// Query specific car
const car = await contract.evaluateTransaction('queryCar', 'CAR0');

// Query all cars
const allCars = await contract.evaluateTransaction('queryAllCars');

// Query by owner (enhanced version)
const ownerCars = await contract.evaluateTransaction('queryCarsByOwner', 'Alice');
```

### Changing Ownership
```javascript
await contract.submitTransaction('changeCarOwner', 'CAR0', 'Bob');
```

## Deployment Notes

1. **State Database**: Enhanced features require CouchDB for rich queries
2. **Endorsement Policy**: Configure appropriate endorsement policies
3. **Events**: Client applications can listen for emitted events
4. **Upgrades**: Use chaincode upgrade process for contract updates

## Security Considerations

- Implement access control for sensitive operations
- Validate all inputs to prevent injection attacks
- Consider implementing role-based permissions
- Audit transaction history for compliance

## Testing

The contract includes comprehensive test coverage:
- Unit tests for all functions
- Integration tests with mock stub
- Error condition testing
- Performance testing for large datasets
