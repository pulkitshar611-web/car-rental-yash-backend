const pool = require('../../config/db');

/**
 * Documents Controller
 * Strictly following schema: id, customerId, documentType (driver_license, insurance), fileUrl, status (uploaded, approved, rejected)
 */

const uploadDocument = async (req, res, next) => {
    try {
        const { customerId, documentType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Local storage for now, mapped to 'fileUrl'
        const fileUrl = `/uploads/${req.file.filename}`;

        if (!customerId || !documentType) {
            return res.status(400).json({ message: 'customerId and documentType are required' });
        }

        // Implementation requirement: "Re-upload creates NEW row (no overwrite)"
        const [result] = await pool.execute(
            'INSERT INTO Documents (customerId, documentType, fileUrl, status) VALUES (?, ?, ?, "uploaded")',
            [customerId, documentType, fileUrl]
        );

        res.status(201).json({
            id: result.insertId,
            fileUrl,
            message: 'Document uploaded successfully'
        });
    } catch (error) {
        next(error);
    }
};

const verifyDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // approved or rejected

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use approved or rejected.' });
        }

        const [doc] = await pool.execute('SELECT * FROM Documents WHERE id = ?', [id]);
        if (doc.length === 0) return res.status(404).json({ message: 'Document not found' });

        await pool.execute(
            'UPDATE Documents SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ message: `Document status updated to ${status}` });
    } catch (error) {
        next(error);
    }
};

const getAllDocuments = async (req, res, next) => {
    try {
        const [docs] = await pool.execute(`
            SELECT d.*, c.name as customerName 
            FROM Documents d
            JOIN Customers c ON d.customerId = c.id
            ORDER BY d.created_at DESC
        `);
        res.json(docs);
    } catch (error) {
        next(error);
    }
};

const getCustomerDocuments = async (req, res, next) => {
    try {
        const [docs] = await pool.execute(
            'SELECT * FROM Documents WHERE customerId = ? ORDER BY created_at DESC',
            [req.params.customerId]
        );
        res.json(docs);
    } catch (error) {
        next(error);
    }
};

const deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM Documents WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { uploadDocument, verifyDocument, getAllDocuments, getCustomerDocuments, deleteDocument };
