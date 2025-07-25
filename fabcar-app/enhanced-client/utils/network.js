/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

class NetworkManager {
    constructor() {
        this.gateway = null;
        this.wallet = null;
        this.contract = null;
        this.network = null;
    }

    async initializeWallet() {
        try {
            // Create wallet instance
            this.wallet = await Wallets.newFileSystemWallet(config.walletPath);
            logger.info(`Wallet initialized at: ${config.walletPath}`);
            return this.wallet;
        } catch (error) {
            logger.error('Failed to initialize wallet:', error);
            throw error;
        }
    }

    async enrollAdmin() {
        try {
            if (!this.wallet) {
                await this.initializeWallet();
            }

            // Check if admin already exists
            const adminIdentity = await this.wallet.get(config.adminUserId);
            if (adminIdentity) {
                logger.info('Admin identity already exists in wallet');
                return;
            }

            // Read connection profile
            const ccpPath = config.connectionProfilePath;
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create CA client
            const caInfo = ccp.certificateAuthorities[config.caName];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { 
                trustedRoots: caTLSCACerts, 
                verify: false 
            }, caInfo.caName);

            // Enroll admin
            const enrollment = await ca.enroll({
                enrollmentID: config.adminEnrollmentId,
                enrollmentSecret: config.adminEnrollmentSecret
            });

            // Create identity
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: config.mspId,
                type: 'X.509',
            };

            // Import identity to wallet
            await this.wallet.put(config.adminUserId, x509Identity);
            logger.info('Successfully enrolled admin user and imported to wallet');

        } catch (error) {
            logger.error('Failed to enroll admin:', error);
            throw error;
        }
    }

    async registerUser(userId = config.appUserId) {
        try {
            if (!this.wallet) {
                await this.initializeWallet();
            }

            // Check if user already exists
            const userIdentity = await this.wallet.get(userId);
            if (userIdentity) {
                logger.info(`User ${userId} already exists in wallet`);
                return;
            }

            // Check if admin exists
            const adminIdentity = await this.wallet.get(config.adminUserId);
            if (!adminIdentity) {
                logger.error('Admin identity not found. Please enroll admin first.');
                throw new Error('Admin identity not found');
            }

            // Read connection profile
            const ccpPath = config.connectionProfilePath;
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create CA client
            const caInfo = ccp.certificateAuthorities[config.caName];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { 
                trustedRoots: caTLSCACerts, 
                verify: false 
            }, caInfo.caName);

            // Create gateway and connect
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet: this.wallet,
                identity: config.adminUserId,
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get CA client from gateway
            const caClient = gateway.getClient().getCertificateAuthority();
            const adminUser = await this.wallet.get(config.adminUserId);

            // Register user
            const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: userId,
                role: 'client'
            }, adminUser);

            // Enroll user
            const enrollment = await ca.enroll({
                enrollmentID: userId,
                enrollmentSecret: secret
            });

            // Create identity
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: config.mspId,
                type: 'X.509',
            };

            // Import identity to wallet
            await this.wallet.put(userId, x509Identity);
            logger.info(`Successfully registered and enrolled user ${userId}`);

            await gateway.disconnect();

        } catch (error) {
            logger.error(`Failed to register user ${userId}:`, error);
            throw error;
        }
    }

    async connect(userId = config.appUserId) {
        try {
            if (!this.wallet) {
                await this.initializeWallet();
            }

            // Check if user exists
            const userIdentity = await this.wallet.get(userId);
            if (!userIdentity) {
                throw new Error(`User ${userId} not found in wallet`);
            }

            // Read connection profile
            const ccpPath = config.connectionProfilePath;
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create gateway and connect
            this.gateway = new Gateway();
            await this.gateway.connect(ccp, {
                wallet: this.wallet,
                identity: userId,
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get network and contract
            this.network = await this.gateway.getNetwork(config.channelName);
            this.contract = this.network.getContract(config.chaincodeName);

            logger.info(`Successfully connected to network as ${userId}`);
            return this.contract;

        } catch (error) {
            logger.error('Failed to connect to network:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.gateway) {
                await this.gateway.disconnect();
                this.gateway = null;
                this.network = null;
                this.contract = null;
                logger.info('Disconnected from network');
            }
        } catch (error) {
            logger.error('Error disconnecting from network:', error);
            throw error;
        }
    }

    getContract() {
        if (!this.contract) {
            throw new Error('Not connected to network. Call connect() first.');
        }
        return this.contract;
    }

    async submitTransaction(functionName, ...args) {
        try {
            const contract = this.getContract();
            logger.info(`Submitting transaction: ${functionName} with args: ${args.join(', ')}`);
            
            const result = await contract.submitTransaction(functionName, ...args);
            logger.info(`Transaction ${functionName} submitted successfully`);
            
            return result.toString();
        } catch (error) {
            logger.error(`Failed to submit transaction ${functionName}:`, error);
            throw error;
        }
    }

    async evaluateTransaction(functionName, ...args) {
        try {
            const contract = this.getContract();
            logger.info(`Evaluating transaction: ${functionName} with args: ${args.join(', ')}`);
            
            const result = await contract.evaluateTransaction(functionName, ...args);
            logger.info(`Transaction ${functionName} evaluated successfully`);
            
            return result.toString();
        } catch (error) {
            logger.error(`Failed to evaluate transaction ${functionName}:`, error);
            throw error;
        }
    }
}

module.exports = NetworkManager;
