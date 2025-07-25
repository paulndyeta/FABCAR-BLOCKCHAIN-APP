/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const NetworkManager = require('./utils/network');
const logger = require('./utils/logger');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Global network manager instance
let networkManager = null;

// Initialize network connection
async function initializeNetwork() {
    try {
        networkManager = new NetworkManager();
        await networkManager.initializeWallet();
        await networkManager.connect();
        logger.info('Network initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize network:', error);
        throw error;
    }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'FabCar API'
    });
});

// Get all cars
app.get('/api/cars', async (req, res) => {
    try {
        const result = await networkManager.evaluateTransaction('queryAllCars');
        const cars = JSON.parse(result);
        
        logger.info(`Retrieved ${cars.length} cars`);
        res.json({
            success: true,
            data: cars,
            count: cars.length
        });
    } catch (error) {
        logger.error('Failed to get all cars:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get specific car
app.get('/api/cars/:carNumber', async (req, res) => {
    try {
        const { carNumber } = req.params;
        const result = await networkManager.evaluateTransaction('queryCar', carNumber);
        const car = JSON.parse(result);
        
        logger.info(`Retrieved car: ${carNumber}`);
        res.json({
            success: true,
            data: car
        });
    } catch (error) {
        logger.error(`Failed to get car ${req.params.carNumber}:`, error);
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

// Get cars by owner
app.get('/api/cars/owner/:owner', async (req, res) => {
    try {
        const { owner } = req.params;
        const result = await networkManager.evaluateTransaction('queryCarsByOwner', owner);
        const cars = JSON.parse(result);
        
        logger.info(`Retrieved ${cars.length} cars for owner: ${owner}`);
        res.json({
            success: true,
            data: cars,
            count: cars.length
        });
    } catch (error) {
        logger.error(`Failed to get cars for owner ${req.params.owner}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get cars by make
app.get('/api/cars/make/:make', async (req, res) => {
    try {
        const { make } = req.params;
        const result = await networkManager.evaluateTransaction('queryCarsByMake', make);
        const cars = JSON.parse(result);
        
        logger.info(`Retrieved ${cars.length} cars for make: ${make}`);
        res.json({
            success: true,
            data: cars,
            count: cars.length
        });
    } catch (error) {
        logger.error(`Failed to get cars for make ${req.params.make}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get car history
app.get('/api/cars/:carNumber/history', async (req, res) => {
    try {
        const { carNumber } = req.params;
        const result = await networkManager.evaluateTransaction('getCarHistory', carNumber);
        const history = JSON.parse(result);
        
        logger.info(`Retrieved history for car: ${carNumber}`);
        res.json({
            success: true,
            data: history,
            count: history.length
        });
    } catch (error) {
        logger.error(`Failed to get history for car ${req.params.carNumber}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new car
app.post('/api/cars', async (req, res) => {
    try {
        const { carNumber, make, model, color, owner, year, mileage, price } = req.body;
        
        if (!carNumber || !make || !model || !color || !owner) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: carNumber, make, model, color, owner'
            });
        }
        
        const args = [carNumber, make, model, color, owner];
        if (year) args.push(year.toString());
        if (mileage) args.push(mileage.toString());
        if (price) args.push(price.toString());
        
        const result = await networkManager.submitTransaction('createCar', ...args);
        const car = JSON.parse(result);
        
        logger.info(`Created car: ${carNumber}`);
        res.status(201).json({
            success: true,
            data: car,
            message: `Car ${carNumber} created successfully`
        });
    } catch (error) {
        logger.error('Failed to create car:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Change car owner
app.put('/api/cars/:carNumber/owner', async (req, res) => {
    try {
        const { carNumber } = req.params;
        const { newOwner } = req.body;
        
        if (!newOwner) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: newOwner'
            });
        }
        
        const result = await networkManager.submitTransaction('changeCarOwner', carNumber, newOwner);
        const car = JSON.parse(result);
        
        logger.info(`Changed owner of car ${carNumber} to ${newOwner}`);
        res.json({
            success: true,
            data: car,
            message: `Car ${carNumber} ownership changed to ${newOwner}`
        });
    } catch (error) {
        logger.error(`Failed to change owner of car ${req.params.carNumber}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update car details
app.put('/api/cars/:carNumber', async (req, res) => {
    try {
        const { carNumber } = req.params;
        const updates = req.body;
        
        const result = await networkManager.submitTransaction('updateCarDetails', carNumber, JSON.stringify(updates));
        const car = JSON.parse(result);
        
        logger.info(`Updated car details for: ${carNumber}`);
        res.json({
            success: true,
            data: car,
            message: `Car ${carNumber} updated successfully`
        });
    } catch (error) {
        logger.error(`Failed to update car ${req.params.carNumber}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Initialize ledger
app.post('/api/init', async (req, res) => {
    try {
        await networkManager.submitTransaction('initLedger');
        
        logger.info('Ledger initialized with sample data');
        res.json({
            success: true,
            message: 'Ledger initialized with sample cars'
        });
    } catch (error) {
        logger.error('Failed to initialize ledger:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
async function startServer() {
    try {
        // Initialize network connection
        await initializeNetwork();
        
        // Start HTTP server
        const server = app.listen(config.serverPort, config.serverHost, () => {
            logger.info(`FabCar API server running on http://${config.serverHost}:${config.serverPort}`);
            console.log(`🚀 FabCar API server running on http://${config.serverHost}:${config.serverPort}`);
            console.log(`📖 API Documentation available at http://${config.serverHost}:${config.serverPort}/api/health`);
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            logger.info('Shutting down server...');
            console.log('\n🛑 Shutting down server...');
            
            server.close(async () => {
                if (networkManager) {
                    await networkManager.disconnect();
                }
                logger.info('Server shut down complete');
                console.log('✅ Server shut down complete');
                process.exit(0);
            });
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = app;
