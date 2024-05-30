const express = require('express');
const router = express.Router();
const sql = require('msnodesqlv8');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()


const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=.;Database=mpp-flowers;Trusted_Connection=yes;';


const secretKey = process.env.JWT_SECRET || 'MySecretKey123!@#';
console.log(secretKey)

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

router.post('/', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = `SELECT * FROM Users WHERE userEmail = '${email}'`;

    sql.open(connectionString, async (err, conn) => {
        if (err) {
            console.error('Error occurred:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        conn.query(query, async (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.length === 0) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const user = result[0];
           
           if(password!=user.userPassword)
           return res.status(400).json({ error: 'Invalid credentials' });


            const token = jwt.sign({ userId: user.userId }, secretKey, { expiresIn: '1h' });
            res.status(200).json({ message: "Login successful", token });
            console.log( "Login successful");

            conn.close();
        });
    });
});

module.exports = router;