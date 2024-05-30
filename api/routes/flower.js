const express = require('express');
const router = express.Router();
const sql = require('msnodesqlv8');
require('dotenv').config();

// Connection string
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=.;Database=MPP-FLOWERS;Trusted_Connection=yes;';

// Get all flowers
router.get('/', (req, res, next) => {
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const query = `
            SELECT f.flower_id, f.flower_name, f.flower_color, f.flower_sunlight, f.flower_watering, g.gardener_name
            FROM Flowers f
            INNER JOIN Gardeners g ON f.gardener_id = g.gardener_id
        `;

        conn.query(query, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const flowerArray = results.map(flower => ({
                id: flower.flower_id,
                name: flower.flower_name,
                color: flower.flower_color,
                sunlight: flower.flower_sunlight,
                watering: flower.flower_watering,
                gardener: flower.gardener_name
            }));
            res.status(200).json(flowerArray);
            conn.close();
        });
    });
});

// Get a specific flower by ID
router.get('/:id', (req, res, next) => {
    const flowerId = req.params.id;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        const query = `
            SELECT f.flower_id, f.flower_name, f.flower_color, f.flower_sunlight, f.flower_watering, g.gardener_name
            FROM Flowers f
            INNER JOIN Gardeners g ON f.gardener_id = g.gardener_id
            WHERE f.flower_id = ${flowerId}
        `;
        
        conn.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            if (result.length === 0) {
                return res.status(404).json({ error: `Flower with ID ${flowerId} not found` });
            }
            
            const flower = {
                id: result[0].flower_id,
                name: result[0].flower_name,
                color: result[0].flower_color,
                sunlight: result[0].flower_sunlight,
                watering: result[0].flower_watering,
                gardener: result[0].gardener_name
            };
            res.status(200).json(flower);
            conn.close();
        });
    });
});

// Add a new flower
router.post('/', (req, res, next) => {
    const { name, color, sunlight, watering, gardener } = req.body;
    
    const maxIdQuery = 'SELECT MAX(flower_id) AS maxId FROM Flowers';
    
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
            if (!name || !color || !sunlight || !watering || !gardener) {
                return res.status(400).json({ error: 'Please provide all required fields: name, color, sunlight, watering, gardener' });
            }
            
            const nextId = result[0].maxId + 1;
            
            const insertQuery = `INSERT INTO Flowers (flower_id, flower_name, flower_color, flower_sunlight, flower_watering, gardener_id) VALUES (${nextId}, '${name}', '${color}', '${sunlight}', '${watering}', ${gardener})`;
            
            conn.query(insertQuery, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                
                res.status(201).json({ message: 'Flower added successfully' });
                
                conn.close();
            });
        });
    });
});

// Update an existing flower
router.put('/:id', (req, res, next) => {
    const flowerId = req.params.id;
    const { name, color, sunlight, watering } = req.body;
    const query = `UPDATE Flowers SET flower_name = '${name}', flower_color = '${color}', flower_sunlight = '${sunlight}', flower_watering = '${watering}' WHERE flower_id = ${flowerId}`;
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        conn.query(query, (err, result) => {
            if (err || result.rowsAffected === 0) {
                console.error('Error executing query:', err);
                return res.status(404).json({ error: `Flower with ID ${flowerId} not found` });
            }
            
            res.status(200).json({ message: `Flower with ID ${flowerId} updated successfully` });
            conn.close();
        });
    });
});

// Delete a flower by ID
router.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        const query = `DELETE FROM Flowers WHERE flower_id = ${id}`;

        conn.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.rowsAffected === 0) {
                return res.status(404).json({ message: 'Flower not found' });
            }

            res.status(200).json({ message: `Deleted flower ${id}` });
            conn.close();
        });
    });
});

module.exports = router;
