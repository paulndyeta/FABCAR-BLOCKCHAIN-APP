/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const NetworkManager = require('./utils/network');
const logger = require('./utils/logger');
const config = require('./config');

class FabCarQuery {
    constructor() {
        this.networkManager = new NetworkManager();
    }

    async queryCar(carNumber) {
        try {
            const result = await this.networkManager.evaluateTransaction('queryCar', carNumber);
            const car = JSON.parse(result);
            
            console.log(`\n🚗 Car Details for ${carNumber}:`);
            console.log(`   Make: ${car.make}`);
            console.log(`   Model: ${car.model}`);
            console.log(`   Color: ${car.color}`);
            console.log(`   Owner: ${car.owner}`);
            if (car.year) console.log(`   Year: ${car.year}`);
            if (car.mileage) console.log(`   Mileage: ${car.mileage}`);
            if (car.price) console.log(`   Price: $${car.price}`);
            if (car.status) console.log(`   Status: ${car.status}`);
            
            return car;
        } catch (error) {
            logger.error(`Failed to query car ${carNumber}:`, error);
            throw error;
        }
    }

    async queryAllCars() {
        try {
            const result = await this.networkManager.evaluateTransaction('queryAllCars');
            const cars = JSON.parse(result);
            
            console.log('\n🚗 All Cars in the Ledger:');
            console.log('='.repeat(50));
            
            cars.forEach((carData, index) => {
                const car = carData.Record;
                console.log(`\n${index + 1}. Car ID: ${carData.Key}`);
                console.log(`   Make: ${car.make}`);
                console.log(`   Model: ${car.model}`);
                console.log(`   Color: ${car.color}`);
                console.log(`   Owner: ${car.owner}`);
                if (car.year) console.log(`   Year: ${car.year}`);
                if (car.mileage) console.log(`   Mileage: ${car.mileage}`);
                if (car.price) console.log(`   Price: $${car.price}`);
                if (car.status) console.log(`   Status: ${car.status}`);
            });
            
            console.log(`\n📊 Total cars found: ${cars.length}`);
            return cars;
        } catch (error) {
            logger.error('Failed to query all cars:', error);
            throw error;
        }
    }

    async queryCarsByOwner(owner) {
        try {
            const result = await this.networkManager.evaluateTransaction('queryCarsByOwner', owner);
            const cars = JSON.parse(result);
            
            console.log(`\n🚗 Cars owned by ${owner}:`);
            console.log('='.repeat(40));

            if (cars.length === 0) {
                console.log(`   No cars found for owner: ${owner}`);
                return cars;
            }
            
            cars.forEach((carData, index) => {
                const car = carData.Record;
                console.log(`\n${index + 1}. Car ID: ${carData.Key}`);
                console.log(`   Make: ${car.make}`);
                console.log(`   Model: ${car.model}`);
                console.log(`   Color: ${car.color}`);
                if (car.year) console.log(`   Year: ${car.year}`);
                if (car.mileage) console.log(`   Mileage: ${car.mileage}`);
                if (car.price) console.log(`   Price: $${car.price}`);
                if (car.status) console.log(`   Status: ${car.status}`);
            });
            
            console.log(`\n📊 Total cars found: ${cars.length}`);
            return cars;
        } catch (error) {
            logger.error(`Failed to query cars by owner ${owner}:`, error);
            throw error;
        }
    }

    async queryCarsByMake(make) {
        try {
            const result = await this.networkManager.evaluateTransaction('queryCarsByMake', make);
            const cars = JSON.parse(result);
            
            console.log(`\n🚗 Cars made by ${make}:`);
            console.log('='.repeat(40));

            if (cars.length === 0) {
                console.log(`   No cars found for make: ${make}`);
                return cars;
            }
            
            cars.forEach((carData, index) => {
                const car = carData.Record;
                console.log(`\n${index + 1}. Car ID: ${carData.Key}`);
                console.log(`   Model: ${car.model}`);
                console.log(`   Color: ${car.color}`);
                console.log(`   Owner: ${car.owner}`);
                if (car.year) console.log(`   Year: ${car.year}`);
                if (car.mileage) console.log(`   Mileage: ${car.mileage}`);
                if (car.price) console.log(`   Price: $${car.price}`);
                if (car.status) console.log(`   Status: ${car.status}`);
            });
            
            console.log(`\n📊 Total cars found: ${cars.length}`);
            return cars;
        } catch (error) {
            logger.error(`Failed to query cars by make ${make}:`, error);
            throw error;
        }
    }

    async getCarHistory(carNumber) {
        try {
            const result = await this.networkManager.evaluateTransaction('getCarHistory', carNumber);
            const history = JSON.parse(result);
            
            console.log(`\n📜 Transaction History for ${carNumber}:`);
            console.log('='.repeat(50));
            
            history.forEach((transaction, index) => {
                console.log(`\n${index + 1}. Transaction ID: ${transaction.TxId}`);
                console.log(`   Timestamp: ${new Date(transaction.Timestamp.seconds * 1000).toLocaleString()}`);
                console.log(`   Is Delete: ${transaction.IsDelete}`);
                if (transaction.Value && typeof transaction.Value === 'object') {
                    console.log(`   Car Data:`);
                    console.log(`     Make: ${transaction.Value.make}`);
                    console.log(`     Model: ${transaction.Value.model}`);
                    console.log(`     Color: ${transaction.Value.color}`);
                    console.log(`     Owner: ${transaction.Value.owner}`);
                }
            });
            
            console.log(`\n📊 Total transactions found: ${history.length}`);
            return history;
        } catch (error) {
            logger.error(`Failed to get car history for ${carNumber}:`, error);
            throw error;
        }
    }

    async disconnect() {
        await this.networkManager.disconnect();
    }
}

async function main() {
    const query = new FabCarQuery();
    
    try {
        logger.info('Starting query operations...');
        
        // Connect to network
        await query.networkManager.connect();
        
        // Parse command line arguments
        const operation = process.argv[2];
        const param1 = process.argv[3];
        const param2 = process.argv[4];
        
        switch (operation) {
            case 'car':
                if (!param1) {
                    console.error('❌ Please provide car number. Usage: node query.js car CAR0');
                    process.exit(1);
                }
                await query.queryCar(param1);
                break;
                
            case 'all':
                await query.queryAllCars();
                break;
                
            case 'owner':
                if (!param1) {
                    console.error('❌ Please provide owner name. Usage: node query.js owner "John Doe"');
                    process.exit(1);
                }
                await query.queryCarsByOwner(param1);
                break;
                
            case 'make':
                if (!param1) {
                    console.error('❌ Please provide car make. Usage: node query.js make Toyota');
                    process.exit(1);
                }
                await query.queryCarsByMake(param1);
                break;
                
            case 'history':
                if (!param1) {
                    console.error('❌ Please provide car number. Usage: node query.js history CAR0');
                    process.exit(1);
                }
                await query.getCarHistory(param1);
                break;
                
            default:
                console.log('\n🔍 FabCar Query Operations:');
                console.log('Usage: node query.js <operation> [parameters]');
                console.log('\nAvailable operations:');
                console.log('  all                    - Query all cars');
                console.log('  car <carNumber>        - Query specific car (e.g., CAR0)');
                console.log('  owner <ownerName>      - Query cars by owner');
                console.log('  make <carMake>         - Query cars by manufacturer');
                console.log('  history <carNumber>    - Get transaction history for a car');
                console.log('\nExamples:');
                console.log('  node query.js all');
                console.log('  node query.js car CAR0');
                console.log('  node query.js owner "Tomoko"');
                console.log('  node query.js make Toyota');
                console.log('  node query.js history CAR0');
                
                // Default to showing all cars
                await query.queryAllCars();
        }
        
        logger.info('Query operations completed successfully');
        
    } catch (error) {
        logger.error('Query operations failed:', error);
        console.error('❌ Query failed:', error.message);
        process.exit(1);
    } finally {
        await query.disconnect();
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = FabCarQuery;
