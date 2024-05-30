const express = require('express');
const router = express.Router();
const sql = require('msnodesqlv8');

// Connection string
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=.;Database=MPP-FLOWERS;Trusted_Connection=yes;';

// Get all gardeners
router.get('/all', (req, res, next) => {
    const query = `
        SELECT g.gardener_id, g.gardener_name, g.gardener_age, COUNT(f.flower_id) AS flower_count
        FROM Gardeners g
        LEFT JOIN Flowers f ON g.gardener_id = f.gardener_id
        GROUP BY g.gardener_id, g.gardener_name, g.gardener_age;
    `;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.length === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: 'No gardeners found' });
            }
            const gardenersWithFlowerCount = result.map(gardener => ({
                id: gardener.gardener_id,
                name: gardener.gardener_name,
                age: gardener.gardener_age,
                flower_count: gardener.flower_count
            }));
            res.status(200).json(gardenersWithFlowerCount);
            conn.close();
        });
    });
});

// Get a single gardener by ID
router.get('/:id', (req, res, next) => {
    const gardenerId = req.params.id;
    const query = `SELECT * FROM Gardeners WHERE gardener_id = ${gardenerId}`;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.length === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: `Gardener with ID ${gardenerId} not found` });
            }
            res.status(200).json(result[0]);
            conn.close();
        });
    });
});

// Add a new gardener
router.post('/', (req, res, next) => {
    const { name, age } = req.body;
    if (!name || !age) {
        return res.status(400).json({ error: 'Name and age are required' });
    }

    const maxIdQuery = 'SELECT MAX(gardener_id) AS maxId FROM Gardeners';
    
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        conn.query(maxIdQuery, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            const nextId = result[0].maxId + 1;
            const insertQuery = `INSERT INTO Gardeners (gardener_id, gardener_name, gardener_age) VALUES (${nextId}, '${name}', ${age})`;
            
            conn.query(insertQuery, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                
                res.status(201).json({ message: 'Gardener added successfully' });
    
                conn.close();
            });
        });
    });
});

// Update an existing gardener
router.put('/:id', (req, res, next) => {
    const gardenerId = req.params.id;
    const { name, age } = req.body;
    if (isNaN(gardenerId) || parseInt(gardenerId) <= 0) {
        return res.status(400).json({ error: 'Invalid gardener ID' });
    }

    const query = `UPDATE Gardeners SET gardener_name = '${name}', gardener_age = ${age} WHERE gardener_id = ${gardenerId}`;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.rowsAffected === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: `Gardener with ID ${gardenerId} not found` });
            }
            res.status(200).json({ message: `Gardener with ID ${gardenerId} updated successfully` });
            conn.close();
        });
    });
});

// Delete a gardener by ID
router.delete('/:id', (req, res, next) => {
    const gardenerId = req.params.id;
    const query = `DELETE FROM Gardeners WHERE gardener_id = ${gardenerId}`;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.rowsAffected === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: `Gardener with ID ${gardenerId} not found` });
            }
            
            res.status(200).json({ message: `Gardener with ID ${gardenerId} deleted successfully` });
            conn.close();
        });
    });
});

module.exports = router;
