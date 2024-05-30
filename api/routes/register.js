const express = require('express');
const router = express.Router();
const sql = require('msnodesqlv8');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=.;Database=mpp-flowers;Trusted_Connection=yes;';


router.get('/', (req, res, next) => {
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const query = `SELECT * FROM Users`;

        conn.query(query, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const userArray = results.map(user => ({
                
                email: user.userEmail,
                password:user.userPassword
            }));

            res.status(200).json(userArray);
            conn.close();
        });
    });
});

// Register a new user
router.post('/', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password ) {
        return res.status(400).json({ error: 'Email and password are required' });
    }



    const checkUserQuery = `SELECT * FROM Users WHERE userEmail = '${email}'`;

    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        conn.query(checkUserQuery, async (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }

           
            const insertUserQuery = `INSERT INTO Users (userEmail, userPassword) VALUES ('${email}', '${password}')`;

            conn.query(insertUserQuery, (err) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                res.status(201).json({ message: 'User registered successfully' });
                conn.close();
            });
        });
    });
});

module.exports = router;