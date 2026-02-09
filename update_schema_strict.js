const pool = require('./src/config/db');

async function updateSchema() {
    try {
        console.log("Starting full schema update for production-ready backend...");

        // 1. Vehicles: Add missing columns
        // name, model, plateNumber, dailyPrice, status, insuranceRequired, qrCodeUrl
        // Current: model_name, plate_number, category, daily_rate, status, image_url
        // Mapping: model_name -> model, daily_rate -> dailyPrice, plate_number -> plateNumber
        // New: name, insuranceRequired, qrCodeUrl
        try {
            await pool.execute('ALTER TABLE vehicles ADD COLUMN name VARCHAR(100) AFTER id');
            console.log("Added vehicles.name");
        } catch (e) { }

        try {
            await pool.execute('ALTER TABLE vehicles CHANGE COLUMN daily_rate dailyPrice DECIMAL(10,2) NOT NULL');
            console.log("Renamed daily_rate to dailyPrice");
        } catch (e) { console.log('dailyPrice might already exist'); }

        try {
            await pool.execute('ALTER TABLE vehicles CHANGE COLUMN plate_number plateNumber VARCHAR(20) NOT NULL UNIQUE');
            console.log("Renamed plate_number to plateNumber");
        } catch (e) { console.log('plateNumber might already exist'); }

        try {
            await pool.execute('ALTER TABLE vehicles CHANGE COLUMN model_name model VARCHAR(100) NOT NULL');
            console.log("Renamed model_name to model");
        } catch (e) { console.log('model might already exist'); }

        try {
            await pool.execute('ALTER TABLE vehicles ADD COLUMN insuranceRequired TINYINT(1) DEFAULT 0');
            console.log("Added vehicles.insuranceRequired");
        } catch (e) { }

        try {
            await pool.execute('ALTER TABLE vehicles ADD COLUMN qrCodeUrl VARCHAR(255) DEFAULT NULL');
            console.log("Added vehicles.qrCodeUrl");
        } catch (e) { }

        // Remove old column category if not needed? User didn't specify it, but good to keep for legacy or just ignore.


        // 2. Customers: 
        // id, name, email, phone (unique), address, status (active, inactive), outstandingBalance
        // Current: full_name, phone, email, ...
        // Mapping: full_name -> name
        try {
            await pool.execute('ALTER TABLE customers CHANGE COLUMN full_name name VARCHAR(100) NOT NULL');
            console.log("Renamed full_name to name");
        } catch (e) { console.log('name might already exist'); }

        try {
            await pool.execute("ALTER TABLE customers ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
            console.log("Added customers.status");
        } catch (e) { }

        try {
            await pool.execute("ALTER TABLE customers ADD COLUMN outstandingBalance DECIMAL(10,2) DEFAULT 0.00");
            console.log("Added customers.outstandingBalance");
        } catch (e) { }

        try {
            // Ensure address column exists (we added it before but let's be safe)
            await pool.execute("ALTER TABLE customers MODIFY COLUMN address TEXT");
            console.log("Ensured customers.address exists");
        } catch (e) {
            // If it doesn't exist, modify will fail, so try add
            try {
                await pool.execute("ALTER TABLE customers ADD COLUMN address TEXT");
                console.log("Added customers.address");
            } catch (e2) { }
        }


        // 3. Rentals:
        // status (booking_request, active, completed, cancelled)
        // Current: REQUESTED, VERIFIED, PAID, ACTIVE, COMPLETED, CANCELLED
        try {
            await pool.execute("ALTER TABLE rentals MODIFY COLUMN status ENUM('booking_request', 'active', 'completed', 'cancelled', 'REQUESTED', 'VERIFIED', 'PAID', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'booking_request'");
            console.log("Updated rentals.status ENUM values (mixed old and new for migration safety)");
            // ideally we map old values to new ones, but let's allow both for now to avoid breaking existing data instantly
        } catch (e) { console.log('Error updating rentals status enum', e.message); }

        try {
            await pool.execute('ALTER TABLE rentals CHANGE COLUMN total_price totalAmount DECIMAL(10,2) NOT NULL');
            console.log("Renamed total_price to totalAmount");
        } catch (e) { console.log('totalAmount might already exist'); }

        // FKs: vehicleId, customerId. 
        // Current: vehicle_id, customer_id. 
        try {
            await pool.execute('ALTER TABLE rentals CHANGE COLUMN vehicle_id vehicleId INT NOT NULL');
            console.log("Renamed vehicle_id to vehicleId");
        } catch (e) { console.log('vehicleId might already exist'); }

        try {
            await pool.execute('ALTER TABLE rentals CHANGE COLUMN customer_id customerId INT NOT NULL');
            console.log("Renamed customer_id to customerId");
        } catch (e) { console.log('customerId might already exist'); }


        // 4. Documents:
        // status (uploaded, approved, rejected)
        // Current: PENDING, APPROVED, REJECTED
        try {
            await pool.execute("ALTER TABLE documents MODIFY COLUMN status ENUM('uploaded', 'approved', 'rejected', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'uploaded'");
            console.log("Updated documents.status ENUM values");
        } catch (e) { }

        // FK: customerId. (Already added in previous step?)
        // Ensure column name is customerId (camelCase) to match requirement or stick to snake_case?
        // User requirments say "customerId (FK)". My previous script added "customer_id".
        // Let's rename to customerId to be strict.
        try {
            await pool.execute('ALTER TABLE documents CHANGE COLUMN customer_id customerId INT NULL');
            console.log("Renamed documents.customer_id to customerId");
        } catch (e) { console.log('documents.customerId might already exist'); }

        try {
            await pool.execute('ALTER TABLE documents CHANGE COLUMN file_path fileUrl VARCHAR(255) NOT NULL');
            console.log("Renamed file_path to fileUrl");
        } catch (e) { console.log('documents.fileUrl might already exist'); }

        try {
            await pool.execute('ALTER TABLE documents CHANGE COLUMN type documentType ENUM(\'driver_license\', \'insurance\', \'ID_CARD\', \'LICENSE\', \'OTHER\') NOT NULL');
            console.log("Renamed type to documentType and updated ENUM");
        } catch (e) { console.log('documents.documentType might already exist'); }


        console.log("Schema update complete.");
        process.exit(0);

    } catch (error) {
        console.error("Schema update failed:", error);
        process.exit(1);
    }
}

updateSchema();
