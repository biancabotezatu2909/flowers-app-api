const express = require('express');
const router = express.Router();
const authControllerRegister = require('../routes/register');
const authControllerLogin = require('../routes/login');
const  protect  = require('../../middleware/authenticateToken');


router.post('/register', authControllerRegister);
router.post('/login', authControllerLogin);
router.get('/home', protect, (req, res) => {
    res.send('This is a protected route, accessible only to authenticated users');
});

module.exports = router;