/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const logger = require('./utils/logger');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Mock data for demonstration
const mockCars = [
    {
        Key: 'CAR0',
        Record: {
            make: 'Toyota',
            model: 'Prius',
            color: 'blue',
            owner: 'Tomoko',
            year: 2020,
            mileage: 15000,
            price: 25000,
            status: 'available',
            docType: 'car'
        }
    },
    {
        Key: 'CAR1',
        Record: {
            make: 'Ford',
            model: 'Mustang',
            color: 'red',
            owner: 'Brad',
            year: 2019,
            mileage: 8000,
            price: 35000,
            status: 'available',
            docType: 'car'
        }
    },
    {
        Key: 'CAR2',
        Record: {
            make: 'Hyundai',
            model: 'Tucson',
            color: 'green',
            owner: 'Jin Soo',
            year: 2021,
            mileage: 5000,
            price: 28000,
            status: 'available',
            docType: 'car'
        }
    },
    {
        Key: 'CAR3',
        Record: {
            make: 'Volkswagen',
            model: 'Passat',
            color: 'yellow',
            owner: 'Max',
            year: 2018,
            mileage: 25000,
            price: 22000,
            status: 'available',
            docType: 'car'
        }
    },
    {
        Key: 'CAR4',
        Record: {
            make: 'Tesla',
            model: 'Model S',
            color: 'black',
            owner: 'Adriana',
            year: 2022,
            mileage: 2000,
            price: 75000,
            status: 'available',
            docType: 'car'
        }
    }
];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK (Demo Mode)', 
        timestamp: new Date().toISOString(),
        service: 'FabCar API Demo',
        note: 'This is a demonstration version with mock data'
    });
});

// Get all cars
app.get('/api/cars', async (req, res) => {
    try {
        logger.info(`Demo: Retrieved ${mockCars.length} cars`);
        res.json({
            success: true,
            data: mockCars,
            count: mockCars.length,
            demo: true
        });
    } catch (error) {
        logger.error('Demo: Failed to get all cars:', error);
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
        const car = mockCars.find(c => c.Key === carNumber);
        
        if (!car) {
            return res.status(404).json({
                success: false,
                error: `Car ${carNumber} not found`
            });
        }
        
        logger.info(`Demo: Retrieved car: ${carNumber}`);
        res.json({
            success: true,
            data: car.Record,
            demo: true
        });
    } catch (error) {
        logger.error(`Demo: Failed to get car ${req.params.carNumber}:`, error);
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
        const cars = mockCars.filter(c => c.Record.owner.toLowerCase().includes(owner.toLowerCase()));
        
        logger.info(`Demo: Retrieved ${cars.length} cars for owner: ${owner}`);
        res.json({
            success: true,
            data: cars,
            count: cars.length,
            demo: true
        });
    } catch (error) {
        logger.error(`Demo: Failed to get cars for owner ${req.params.owner}:`, error);
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
        const cars = mockCars.filter(c => c.Record.make.toLowerCase().includes(make.toLowerCase()));
        
        logger.info(`Demo: Retrieved ${cars.length} cars for make: ${make}`);
        res.json({
            success: true,
            data: cars,
            count: cars.length,
            demo: true
        });
    } catch (error) {
        logger.error(`Demo: Failed to get cars for make ${req.params.make}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new car (demo)
app.post('/api/cars', async (req, res) => {
    try {
        const { carNumber, make, model, color, owner, year, mileage, price } = req.body;
        
        if (!carNumber || !make || !model || !color || !owner) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: carNumber, make, model, color, owner'
            });
        }
        
        // Check if car already exists
        if (mockCars.find(c => c.Key === carNumber)) {
            return res.status(400).json({
                success: false,
                error: `Car ${carNumber} already exists`
            });
        }
        
        const newCar = {
            Key: carNumber,
            Record: {
                make,
                model,
                color,
                owner,
                year: year || new Date().getFullYear(),
                mileage: mileage || 0,
                price: price || 0,
                status: 'available',
                docType: 'car',
                createdAt: new Date().toISOString()
            }
        };
        
        mockCars.push(newCar);
        
        logger.info(`Demo: Created car: ${carNumber}`);
        res.status(201).json({
            success: true,
            data: newCar.Record,
            message: `Car ${carNumber} created successfully (Demo Mode)`,
            demo: true
        });
    } catch (error) {
        logger.error('Demo: Failed to create car:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Change car owner (demo)
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
        
        const car = mockCars.find(c => c.Key === carNumber);
        if (!car) {
            return res.status(404).json({
                success: false,
                error: `Car ${carNumber} not found`
            });
        }
        
        const previousOwner = car.Record.owner;
        car.Record.owner = newOwner;
        car.Record.lastModified = new Date().toISOString();
        
        logger.info(`Demo: Changed owner of car ${carNumber} from ${previousOwner} to ${newOwner}`);
        res.json({
            success: true,
            data: car.Record,
            message: `Car ${carNumber} ownership changed to ${newOwner} (Demo Mode)`,
            demo: true
        });
    } catch (error) {
        logger.error(`Demo: Failed to change owner of car ${req.params.carNumber}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Initialize ledger (demo)
app.post('/api/init', async (req, res) => {
    try {
        logger.info('Demo: Ledger already initialized with sample data');
        res.json({
            success: true,
            message: 'Ledger initialized with sample cars (Demo Mode)',
            demo: true
        });
    } catch (error) {
        logger.error('Demo: Failed to initialize ledger:', error);
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
        // Start HTTP server
        const server = app.listen(config.serverPort, config.serverHost, () => {
            logger.info(`FabCar Demo API server running on http://${config.serverHost}:${config.serverPort}`);
            console.log(`🚀 FabCar Demo API server running on http://${config.serverHost}:${config.serverPort}`);
            console.log(`📖 Demo Mode: Using mock data to demonstrate functionality`);
            console.log(`🌐 Open your browser to see the web interface`);
            console.log(`📊 API Health Check: http://${config.serverHost}:${config.serverPort}/api/health`);
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            logger.info('Shutting down demo server...');
            console.log('\n🛑 Shutting down demo server...');
            
            server.close(() => {
                logger.info('Demo server shut down complete');
                console.log('✅ Demo server shut down complete');
                process.exit(0);
            });
        });
        
    } catch (error) {
        logger.error('Failed to start demo server:', error);
        console.error('❌ Failed to start demo server:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
