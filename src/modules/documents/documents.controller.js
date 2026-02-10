const pool = require('../../config/db');

/**
 * Documents Controller
 * Schema: id, customerId, rentalId, vehicleId, documentType, status, fileUri, uploadedDate, expiryDate
 */

const getAllDocuments = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(`
            SELECT d.*, c.name as customerName 
            FROM documents d
            JOIN customers c ON d.customerId = c.id
            ORDER BY d.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const getCustomerDocuments = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const [rows] = await pool.execute('SELECT * FROM documents WHERE customerId = ? ORDER BY uploadedDate DESC', [customerId]);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

const uploadDocument = async (req, res, next) => {
    try {
        const { customerId, rentalId, vehicleId, documentType, expiryDate } = req.body;
        const fileUri = req.file ? `/uploads/${req.file.filename}` : null;

        if (!customerId || !documentType) {
            return res.status(400).json({ message: 'customerId and documentType are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO documents (customerId, rentalId, vehicleId, documentType, fileUri, status, expiryDate) VALUES (?, ?, ?, ?, ?, "uploaded", ?)',
            [customerId, rentalId || null, vehicleId || null, documentType, fileUri, expiryDate || null]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Document uploaded successfully',
            fileUri
        });
    } catch (error) {
        next(error);
    }
};

const verifyDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;

        if (!['approved', 'rejected', 'uploaded'].includes(status)) {
            return res.status(400).json({ message: `Invalid status: ${status}. Must be approved, rejected, or uploaded.` });
        }

        // Get document info first to check type and customerId
        const [[doc]] = await pool.execute('SELECT customerId, documentType FROM documents WHERE id = ?', [id]);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await pool.execute(
            'UPDATE documents SET status = ?, feedback = ? WHERE id = ?',
            [status, feedback || null, id]
        );

        // Sync with customers table if it's an insurance document
        if (doc.documentType === 'insurance') {
            const hasApprovedInsurance = status === 'approved' ? 1 : 0;
            await pool.execute('UPDATE customers SET insurance = ? WHERE id = ?', [hasApprovedInsurance, doc.customerId]);
        }

        res.json({ message: `Document ${status} successfully` });
    } catch (error) {
        next(error);
    }
};

const deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get document info before deletion to check type and status
        const [[doc]] = await pool.execute('SELECT customerId, documentType, status FROM documents WHERE id = ?', [id]);

        await pool.execute('DELETE FROM documents WHERE id = ?', [id]);

        // If it was an approved insurance document, reset customer insurance status
        if (doc && doc.documentType === 'insurance' && doc.status === 'approved') {
            await pool.execute('UPDATE customers SET insurance = 0 WHERE id = ?', [doc.customerId]);
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const updateDocumentData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { documentType, status, expiryDate, feedback } = req.body;
        const fileUri = req.file ? `/uploads/${req.file.filename}` : undefined;

        console.log(`[UPDATE DOCUMENT] ID: ${id}, Body:`, req.body, 'File:', fileUri);

        // Build dynamic UPDATE query
        let updates = [];
        let params = [];

        if (documentType) { updates.push('documentType = ?'); params.push(documentType); }
        if (status) { updates.push('status = ?'); params.push(status); }
        if (expiryDate) { updates.push('expiryDate = ?'); params.push(expiryDate); }
        if (feedback !== undefined) { updates.push('feedback = ?'); params.push(feedback); }
        if (fileUri) { updates.push('fileUri = ?'); params.push(fileUri); }

        if (updates.length === 0) {
            return res.json({ message: 'No changes to update' });
        }

        params.push(id);
        const query = `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`;

        await pool.execute(query, params);

        // Sync with customers table if type is insurance and status changed
        if (status) {
            const [rows] = await pool.execute('SELECT customerId, documentType FROM documents WHERE id = ?', [id]);
            const doc = rows[0];
            if (doc && doc.documentType === 'insurance') {
                const hasApprovedInsurance = status === 'approved' ? 1 : 0;
                await pool.execute('UPDATE customers SET insurance = ? WHERE id = ?', [hasApprovedInsurance, doc.customerId]);
            }
        }

        res.json({
            message: 'Document updated successfully',
            fileUri: fileUri || undefined
        });
    } catch (error) {
        console.error('[UPDATE DOCUMENT ERROR]', error);
        next(error);
    }
};

const uploadGeneralFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const fileUri = `/uploads/${req.file.filename}`;
        res.json({ fileUri });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllDocuments, getCustomerDocuments, uploadDocument, verifyDocument, deleteDocument, updateDocumentData, uploadGeneralFile };
