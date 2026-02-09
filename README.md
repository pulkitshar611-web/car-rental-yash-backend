# Car Rental Management System - Backend

This is a production-ready Node.js/Express backend for a Car Rental Management System.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v14+)
- MySQL Server (XAMPP / WAMP / phpMyAdmin)

### 2. Installation
1. Navigate to the backend folder: `cd car-rental-backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`.

### 3. Database Setup (phpMyAdmin)
1. Open phpMyAdmin.
2. Create a new database named `car`.
3. Click on the **Import** tab.
4. Choose the `schema.sql` file from the project root.
5. Click **Go**.

### 4. Running the Server
- Development mode: `node src/server.js`
- The API will be available at `http://localhost:5000/api`.

---

## 🔐 Auth Details
- **Default Admin**: `admin`
- **Default Password**: `admin123`
- Role: `SUPER_ADMIN`

---

## 🔄 State Machine Flow
1. **REQUESTED**: Created via QR Booking (OTP verified).
2. **VERIFIED**: Admin approves all uploaded documents.
3. **PAID**: Deposit or full rental fee is paid.
4. **ACTIVE**: Admin activates the rental (vehicle status becomes RENTED).
5. **COMPLETED**: Rental ends, vehicle status becomes AVAILABLE.
6. **CANCELLED**: Allowed from REQUESTED, VERIFIED, or PAID states.

---

## 💥 Failure Handling & Safety
1. **Double Booking**: Prevented using `SELECT ... FOR UPDATE` pessimistic locking and date overlap queries inside SQL transactions.
2. **Idempotency**: Payments include an `idempotency_key` to prevent double charges if the user clicks twice or the server lags.
3. **Audit Trails**: Every sensitive action (create/update/delete/activate) is logged in the `AuditLogs` table with old and new values.
4. **Data Integrity**: Foreign keys and unique constraints ensure no orphan rentals or duplicate phone numbers.

---

## ⚠️ Common Mistakes to Avoid
1. **Date Overlaps**: Never trust the frontend for date availability; always re-verify server-side inside a transaction.
2. **Hard Deletes**: Use the provided `deleted_at` soft-delete logic to preserve history for audit logs.
3. **JWT Expiry**: Ensure the `JWT_SECRET` is changed for production.
4. **Multer Security**: Always check mimetypes (implemented in `upload.middleware.js`) to prevent malicious file uploads.

---

## 📡 API Endpoints Summary
- `POST /api/auth/login`: Admin authentication.
- `GET /api/vehicles`: List all available vehicles.
- `POST /api/rentals/init`: Start QR booking flow.
- `POST /api/rentals/verify`: Complete booking with OTP.
- `POST /api/documents/upload`: Upload ID/License.
- `POST /api/payments`: Handle deposits/rental fees.
- `GET /api/audit/export`: Download Excel report of rentals.
