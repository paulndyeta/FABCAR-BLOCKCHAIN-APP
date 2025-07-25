/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const path = require('path');

// Network configuration
const config = {
    // Connection profile path
    connectionProfilePath: path.resolve(__dirname, '..', 'first-network', 'connection-org1.json'),
    
    // Wallet configuration
    walletPath: path.join(__dirname, 'wallet'),
    
    // User identities
    adminUserId: 'admin',
    appUserId: 'appUser',
    
    // Channel and chaincode configuration
    channelName: 'mychannel',
    chaincodeName: 'fabcar',
    
    // CA configuration
    caName: 'ca.org1.example.com',
    mspId: 'Org1MSP',
    
    // Admin credentials
    adminEnrollmentId: 'admin',
    adminEnrollmentSecret: 'adminpw',
    
    // Application server configuration
    serverPort: 3000,
    serverHost: 'localhost',
    
    // Logging configuration
    logLevel: 'info',
    logFile: path.join(__dirname, 'logs', 'fabcar.log'),
    
    // Retry configuration
    retryAttempts: 3,
    retryDelay: 1000, // milliseconds
    
    // Transaction timeout
    transactionTimeout: 30000, // 30 seconds
    
    // Query timeout
    queryTimeout: 10000 // 10 seconds
};

module.exports = config;
