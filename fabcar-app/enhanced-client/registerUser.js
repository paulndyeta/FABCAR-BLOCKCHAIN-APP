/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const NetworkManager = require('./utils/network');
const logger = require('./utils/logger');
const config = require('./config');

async function main() {
    const networkManager = new NetworkManager();
    
    try {
        logger.info('Starting user registration process...');
        
        // Initialize wallet
        await networkManager.initializeWallet();
        
        // Register user
        const userId = process.argv[2] || config.appUserId;
        await networkManager.registerUser(userId);
        
        logger.info(`User registration completed successfully for: ${userId}`);
        console.log(`✅ User '${userId}' registered successfully`);
        
    } catch (error) {
        logger.error('User registration failed:', error);
        console.error('❌ Failed to register user:', error.message);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = main;
