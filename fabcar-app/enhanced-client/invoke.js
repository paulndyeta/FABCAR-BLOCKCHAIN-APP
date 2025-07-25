/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const NetworkManager = require('./utils/network');
const logger = require('./utils/logger');
const config = require('./config');

class FabCarInvoke {
    constructor() {
        this.networkManager = new NetworkManager();
    }

    async createCar(carNumber, make, model, color, owner, year = '', mileage = '', price = '') {
        try {
            logger.info(`Creating car: ${carNumber}`);
            
            const args = [carNumber, make, model, color, owner];
            if (year) args.push(year);
            if (mileage) args.push(mileage);
            if (price) args.push(price);
            
            const result = await this.networkManager.submitTransaction('createCar', ...args);
            const car = JSON.parse(result);
            
            console.log(`\n✅ Car ${carNumber} created successfully!`);
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
            logger.error(`Failed to create car ${carNumber}:`, error);
            throw error;
        }
    }

    async changeCarOwner(carNumber, newOwner) {
        try {
            logger.info(`Changing owner of car ${carNumber} to ${newOwner}`);
            
            const result = await this.networkManager.submitTransaction('changeCarOwner', carNumber, newOwner);
            const car = JSON.parse(result);
            
            console.log(`\n✅ Car ownership changed successfully!`);
            console.log(`   Car: ${carNumber}`);
            console.log(`   New Owner: ${car.owner}`);
            console.log(`   Make: ${car.make}`);
            console.log(`   Model: ${car.model}`);
            console.log(`   Color: ${car.color}`);
            if (car.year) console.log(`   Year: ${car.year}`);
            if (car.lastModified) console.log(`   Last Modified: ${car.lastModified}`);
            
            return car;
        } catch (error) {
            logger.error(`Failed to change owner of car ${carNumber}:`, error);
            throw error;
        }
    }

    async updateCarDetails(carNumber, updates) {
        try {
            logger.info(`Updating car details for ${carNumber}`);
            
            const updatesJson = JSON.stringify(updates);
            const result = await this.networkManager.submitTransaction('updateCarDetails', carNumber, updatesJson);
            const car = JSON.parse(result);
            
            console.log(`\n✅ Car details updated successfully!`);
            console.log(`   Car: ${carNumber}`);
            console.log(`   Make: ${car.make}`);
            console.log(`   Model: ${car.model}`);
            console.log(`   Color: ${car.color}`);
            console.log(`   Owner: ${car.owner}`);
            if (car.year) console.log(`   Year: ${car.year}`);
            if (car.mileage) console.log(`   Mileage: ${car.mileage}`);
            if (car.price) console.log(`   Price: $${car.price}`);
            if (car.status) console.log(`   Status: ${car.status}`);
            if (car.lastModified) console.log(`   Last Modified: ${car.lastModified}`);
            
            return car;
        } catch (error) {
            logger.error(`Failed to update car details for ${carNumber}:`, error);
            throw error;
        }
    }

    async initLedger() {
        try {
            logger.info('Initializing ledger with sample data');
            
            await this.networkManager.submitTransaction('initLedger');
            
            console.log('\n✅ Ledger initialized successfully with sample cars!');
            console.log('   Sample cars CAR0 through CAR4 have been created.');
            
        } catch (error) {
            logger.error('Failed to initialize ledger:', error);
            throw error;
        }
    }

    async disconnect() {
        await this.networkManager.disconnect();
    }
}

async function main() {
    const invoke = new FabCarInvoke();
    
    try {
        logger.info('Starting invoke operations...');
        
        // Connect to network
        await invoke.networkManager.connect();
        
        // Parse command line arguments
        const operation = process.argv[2];
        const args = process.argv.slice(3);
        
        switch (operation) {
            case 'init':
                await invoke.initLedger();
                break;
                
            case 'create':
                if (args.length < 5) {
                    console.error('❌ Insufficient arguments for create operation');
                    console.error('Usage: node invoke.js create <carNumber> <make> <model> <color> <owner> [year] [mileage] [price]');
                    console.error('Example: node invoke.js create CAR10 Toyota Camry blue "John Doe" 2023 5000 30000');
                    process.exit(1);
                }
                await invoke.createCar(...args);
                break;
                
            case 'changeowner':
                if (args.length < 2) {
                    console.error('❌ Insufficient arguments for changeowner operation');
                    console.error('Usage: node invoke.js changeowner <carNumber> <newOwner>');
                    console.error('Example: node invoke.js changeowner CAR0 "Jane Smith"');
                    process.exit(1);
                }
                await invoke.changeCarOwner(args[0], args[1]);
                break;
                
            case 'update':
                if (args.length < 2) {
                    console.error('❌ Insufficient arguments for update operation');
                    console.error('Usage: node invoke.js update <carNumber> <updatesJson>');
                    console.error('Example: node invoke.js update CAR0 \'{"color":"red","mileage":15000,"price":28000}\'');
                    process.exit(1);
                }
                try {
                    const updates = JSON.parse(args[1]);
                    await invoke.updateCarDetails(args[0], updates);
                } catch (parseError) {
                    console.error('❌ Invalid JSON format for updates');
                    console.error('Example: \'{"color":"red","mileage":15000,"price":28000}\'');
                    process.exit(1);
                }
                break;
                
            default:
                console.log('\n🚀 FabCar Invoke Operations:');
                console.log('Usage: node invoke.js <operation> [parameters]');
                console.log('\nAvailable operations:');
                console.log('  init                                           - Initialize ledger with sample data');
                console.log('  create <carNumber> <make> <model> <color> <owner> [year] [mileage] [price]');
                console.log('                                                 - Create a new car');
                console.log('  changeowner <carNumber> <newOwner>             - Change car ownership');
                console.log('  update <carNumber> <updatesJson>               - Update car details');
                console.log('\nExamples:');
                console.log('  node invoke.js init');
                console.log('  node invoke.js create CAR10 Toyota Camry blue "John Doe" 2023 5000 30000');
                console.log('  node invoke.js changeowner CAR0 "Jane Smith"');
                console.log('  node invoke.js update CAR0 \'{"color":"red","mileage":15000,"price":28000}\'');
                
                // Default to creating a sample car
                console.log('\n🚗 Creating a sample car...');
                const timestamp = Date.now();
                await invoke.createCar(
                    `CAR${timestamp}`,
                    'Honda',
                    'Civic',
                    'silver',
                    'Sample User',
                    '2023',
                    '1000',
                    '25000'
                );
        }
        
        logger.info('Invoke operations completed successfully');
        
    } catch (error) {
        logger.error('Invoke operations failed:', error);
        console.error('❌ Invoke failed:', error.message);
        process.exit(1);
    } finally {
        await invoke.disconnect();
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = FabCarInvoke;
