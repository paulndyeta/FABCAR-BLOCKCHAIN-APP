/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const NetworkManager = require('./utils/network');
const logger = require('./utils/logger');

async function main() {
    const networkManager = new NetworkManager();
    
    try {
        logger.info('Starting admin enrollment process...');
        
        // Initialize wallet
        await networkManager.initializeWallet();
        
        // Enroll admin
        await networkManager.enrollAdmin();
        
        logger.info('Admin enrollment completed successfully');
        console.log('✅ Admin user enrolled successfully');
        
    } catch (error) {
        logger.error('Admin enrollment failed:', error);
        console.error('❌ Failed to enroll admin user:', error.message);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = main;
