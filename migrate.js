const pool = require('./src/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Rentals table
        const [rentalsCols] = await pool.execute('DESCRIBE Rentals');
        const rCols = rentalsCols.map(c => c.Field);

        if (rCols.includes('customer_id') && !rCols.includes('customerId')) {
            await pool.execute('ALTER TABLE Rentals CHANGE customer_id customerId INT NOT NULL');
            console.log('Renamed Rentals.customer_id to customerId');
        }
        if (rCols.includes('vehicle_id') && !rCols.includes('vehicleId')) {
            await pool.execute('ALTER TABLE Rentals CHANGE vehicle_id vehicleId INT NOT NULL');
            console.log('Renamed Rentals.vehicle_id to vehicleId');
        }
        if (rCols.includes('start_date') && !rCols.includes('startDate')) {
            await pool.execute('ALTER TABLE Rentals CHANGE start_date startDate DATE NOT NULL');
            console.log('Renamed Rentals.start_date to startDate');
        }
        if (rCols.includes('end_date') && !rCols.includes('endDate')) {
            await pool.execute('ALTER TABLE Rentals CHANGE end_date endDate DATE NOT NULL');
            console.log('Renamed Rentals.end_date to endDate');
        }
        if (rCols.includes('total_price') && !rCols.includes('totalAmount')) {
            await pool.execute('ALTER TABLE Rentals CHANGE total_price totalAmount DECIMAL(10,2) NOT NULL');
            console.log('Renamed Rentals.total_price to totalAmount');
        }

        // 2. Customers table
        const [customersCols] = await pool.execute('DESCRIBE Customers');
        const cCols = customersCols.map(c => c.Field);
        if (cCols.includes('full_name') && !cCols.includes('name')) {
            await pool.execute('ALTER TABLE Customers CHANGE full_name name VARCHAR(100) NOT NULL');
            console.log('Renamed Customers.full_name to name');
        }
        if (cCols.includes('id_number') && !cCols.includes('idNumber')) {
            await pool.execute('ALTER TABLE Customers CHANGE id_number idNumber VARCHAR(50)');
            console.log('Renamed Customers.id_number to idNumber');
        }

        // 3. Vehicles table
        const [vehiclesCols] = await pool.execute('DESCRIBE Vehicles');
        const vCols = vehiclesCols.map(c => c.Field);
        if (vCols.includes('model_name') && !vCols.includes('name')) {
            await pool.execute('ALTER TABLE Vehicles CHANGE model_name name VARCHAR(100) NOT NULL');
            console.log('Renamed Vehicles.model_name to name');
        }
        if (vCols.includes('plate_number') && !vCols.includes('plateNumber')) {
            await pool.execute('ALTER TABLE Vehicles CHANGE plate_number plateNumber VARCHAR(20) NOT NULL');
            console.log('Renamed Vehicles.plate_number to plateNumber');
        }
        if (vCols.includes('daily_rate') && !vCols.includes('dailyPrice')) {
            await pool.execute('ALTER TABLE Vehicles CHANGE daily_rate dailyPrice DECIMAL(10,2) NOT NULL');
            console.log('Renamed Vehicles.daily_rate to dailyPrice');
        }
        if (vCols.includes('image_url') && !vCols.includes('imageUrl')) {
            await pool.execute('ALTER TABLE Vehicles CHANGE image_url imageUrl TEXT');
            console.log('Renamed Vehicles.image_url to imageUrl');
        }
        // Add insuranceRequired if missing
        if (!vCols.includes('insuranceRequired')) {
            await pool.execute('ALTER TABLE Vehicles ADD COLUMN insuranceRequired TINYINT(1) DEFAULT 0');
            console.log('Added Vehicles.insuranceRequired');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
