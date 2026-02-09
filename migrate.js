const pool = require('./src/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Rentals table
        const [rentalsCols] = await pool.execute('DESCRIBE rentals');
        const rCols = rentalsCols.map(c => c.Field);

        if (rCols.includes('customer_id') && !rCols.includes('customerId')) {
            await pool.execute('ALTER TABLE rentals CHANGE customer_id customerId INT NOT NULL');
            console.log('Renamed rentals.customer_id to customerId');
        }
        if (rCols.includes('vehicle_id') && !rCols.includes('vehicleId')) {
            await pool.execute('ALTER TABLE rentals CHANGE vehicle_id vehicleId INT NOT NULL');
            console.log('Renamed rentals.vehicle_id to vehicleId');
        }
        if (rCols.includes('start_date') && !rCols.includes('startDate')) {
            await pool.execute('ALTER TABLE rentals CHANGE start_date startDate DATE NOT NULL');
            console.log('Renamed rentals.start_date to startDate');
        }
        if (rCols.includes('end_date') && !rCols.includes('endDate')) {
            await pool.execute('ALTER TABLE rentals CHANGE end_date endDate DATE NOT NULL');
            console.log('Renamed rentals.end_date to endDate');
        }
        if (rCols.includes('total_price') && !rCols.includes('totalAmount')) {
            await pool.execute('ALTER TABLE rentals CHANGE total_price totalAmount DECIMAL(10,2) NOT NULL');
            console.log('Renamed rentals.total_price to totalAmount');
        }

        // 2. Customers table
        const [customersCols] = await pool.execute('DESCRIBE customers');
        const cCols = customersCols.map(c => c.Field);
        if (cCols.includes('full_name') && !cCols.includes('name')) {
            await pool.execute('ALTER TABLE customers CHANGE full_name name VARCHAR(100) NOT NULL');
            console.log('Renamed customers.full_name to name');
        }
        if (cCols.includes('id_number') && !cCols.includes('idNumber')) {
            await pool.execute('ALTER TABLE customers CHANGE id_number idNumber VARCHAR(50)');
            console.log('Renamed customers.id_number to idNumber');
        }

        // 3. Vehicles table
        const [vehiclesCols] = await pool.execute('DESCRIBE vehicles');
        const vCols = vehiclesCols.map(c => c.Field);
        if (vCols.includes('model_name') && !vCols.includes('name')) {
            await pool.execute('ALTER TABLE vehicles CHANGE model_name name VARCHAR(100) NOT NULL');
            console.log('Renamed vehicles.model_name to name');
        }
        if (vCols.includes('plate_number') && !vCols.includes('plateNumber')) {
            await pool.execute('ALTER TABLE vehicles CHANGE plate_number plateNumber VARCHAR(20) NOT NULL');
            console.log('Renamed vehicles.plate_number to plateNumber');
        }
        if (vCols.includes('daily_rate') && !vCols.includes('dailyPrice')) {
            await pool.execute('ALTER TABLE vehicles CHANGE daily_rate dailyPrice DECIMAL(10,2) NOT NULL');
            console.log('Renamed vehicles.daily_rate to dailyPrice');
        }
        if (vCols.includes('image_url') && !vCols.includes('imageUrl')) {
            await pool.execute('ALTER TABLE vehicles CHANGE image_url imageUrl TEXT');
            console.log('Renamed vehicles.image_url to imageUrl');
        }
        // Add insuranceRequired if missing
        if (!vCols.includes('insuranceRequired')) {
            await pool.execute('ALTER TABLE vehicles ADD COLUMN insuranceRequired TINYINT(1) DEFAULT 0');
            console.log('Added vehicles.insuranceRequired');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
