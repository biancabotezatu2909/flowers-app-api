const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const flowerRoutes = require('./api/routes/flower');
const gardenerRoutes = require('./api/routes/gardener');
const loginRoutes=require('./api/routes/login');
const registerRoutes=require('./api/routes/register');
const authRoutes=require('./api/routes/auth');
require('dotenv').config();




app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use('/home', flowerRoutes);
app.use('/gardener', gardenerRoutes);
app.use('/auth',authRoutes);

app.use('/login',loginRoutes);
app.use('/register',registerRoutes);

app.use((req,res,next) =>{
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});



app.use((error,req,res,next) =>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
});

module.exports = app;