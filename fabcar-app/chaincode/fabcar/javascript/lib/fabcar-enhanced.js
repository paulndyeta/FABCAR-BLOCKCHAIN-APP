/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCarEnhanced extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const cars = [
            {
                color: 'blue',
                make: 'Toyota',
                model: 'Prius',
                owner: 'Tomoko',
                year: 2020,
                mileage: 15000,
                price: 25000,
                status: 'available',
                docType: 'car'
            },
            {
                color: 'red',
                make: 'Ford',
                model: 'Mustang',
                owner: 'Brad',
                year: 2019,
                mileage: 8000,
                price: 35000,
                status: 'available',
                docType: 'car'
            },
            {
                color: 'green',
                make: 'Hyundai',
                model: 'Tucson',
                owner: 'Jin Soo',
                year: 2021,
                mileage: 5000,
                price: 28000,
                status: 'available',
                docType: 'car'
            },
            {
                color: 'yellow',
                make: 'Volkswagen',
                model: 'Passat',
                owner: 'Max',
                year: 2018,
                mileage: 25000,
                price: 22000,
                status: 'available',
                docType: 'car'
            },
            {
                color: 'black',
                make: 'Tesla',
                model: 'S',
                owner: 'Adriana',
                year: 2022,
                mileage: 2000,
                price: 75000,
                status: 'available',
                docType: 'car'
            }
        ];

        for (let i = 0; i < cars.length; i++) {
            await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
            console.info('Added <--> ', cars[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCar(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber);
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }

    async createCar(ctx, carNumber, make, model, color, owner, year, mileage, price) {
        console.info('============= START : Create Car ===========');

        // Validate inputs
        if (!carNumber || !make || !model || !color || !owner) {
            throw new Error('Missing required car information');
        }

        // Check if car already exists
        const existingCar = await ctx.stub.getState(carNumber);
        if (existingCar && existingCar.length > 0) {
            throw new Error(`Car ${carNumber} already exists`);
        }

        const car = {
            color,
            docType: 'car',
            make,
            model,
            owner,
            year: parseInt(year) || new Date().getFullYear(),
            mileage: parseInt(mileage) || 0,
            price: parseFloat(price) || 0,
            status: 'available',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Create Car ===========');
        
        // Emit event
        ctx.stub.setEvent('CarCreated', Buffer.from(JSON.stringify({
            carNumber,
            owner,
            make,
            model
        })));
        
        return JSON.stringify(car);
    }

    async queryAllCars(ctx) {
        const startKey = 'CAR0';
        const endKey = 'CAR999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async changeCarOwner(ctx, carNumber, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        if (!carNumber || !newOwner) {
            throw new Error('Car number and new owner are required');
        }

        const carAsBytes = await ctx.stub.getState(carNumber);
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        
        const car = JSON.parse(carAsBytes.toString());
        const previousOwner = car.owner;
        
        car.owner = newOwner;
        car.lastModified = new Date().toISOString();

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
        
        // Emit event
        ctx.stub.setEvent('CarOwnerChanged', Buffer.from(JSON.stringify({
            carNumber,
            previousOwner,
            newOwner,
            timestamp: car.lastModified
        })));
        
        return JSON.stringify(car);
    }

    async updateCarDetails(ctx, carNumber, updates) {
        console.info('============= START : updateCarDetails ===========');

        const carAsBytes = await ctx.stub.getState(carNumber);
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }

        const car = JSON.parse(carAsBytes.toString());
        const updatesObj = JSON.parse(updates);

        // Update allowed fields
        const allowedFields = ['color', 'mileage', 'price', 'status'];
        for (const field of allowedFields) {
            if (updatesObj[field] !== undefined) {
                car[field] = updatesObj[field];
            }
        }

        car.lastModified = new Date().toISOString();

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : updateCarDetails ===========');
        
        return JSON.stringify(car);
    }

    async queryCarsByOwner(ctx, owner) {
        console.info('============= START : queryCarsByOwner ===========');

        const queryString = {
            selector: {
                docType: 'car',
                owner: owner
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);

        console.info('============= END : queryCarsByOwner ===========');
        return JSON.stringify(results);
    }

    async queryCarsByMake(ctx, make) {
        console.info('============= START : queryCarsByMake ===========');

        const queryString = {
            selector: {
                docType: 'car',
                make: make
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = await this._getAllResults(iterator);

        console.info('============= END : queryCarsByMake ===========');
        return JSON.stringify(results);
    }

    async getCarHistory(ctx, carNumber) {
        console.info('============= START : getCarHistory ===========');

        const iterator = await ctx.stub.getHistoryForKey(carNumber);
        const results = await this._getAllHistoryResults(iterator);

        console.info('============= END : getCarHistory ===========');
        return JSON.stringify(results);
    }

    // Helper function to get all results from iterator
    async _getAllResults(iterator) {
        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return allResults;
    }

    // Helper function to get all history results
    async _getAllHistoryResults(iterator) {
        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                const obj = {
                    TxId: res.value.tx_id,
                    Timestamp: res.value.timestamp,
                    IsDelete: res.value.is_delete.toString()
                };
                try {
                    obj.Value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    obj.Value = res.value.value.toString('utf8');
                }
                allResults.push(obj);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return allResults;
    }
}

module.exports = FabCarEnhanced;
