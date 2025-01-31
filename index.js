require('dotenv').config();
// 1. Importing express
const express=require('express');
const mongoose=require('mongoose');
const connectDB = require('./database/database');
const cors = require('cors')
const fileUpload = require('express-fileupload')
const checkDependencies = require('./utils/versionCheck');
const securityMonitor = require('./middleware/securityMonitor');
const logger = require('./utils/logger');


// 2. Creating an express app
const app=express();

// Json Config
app.use(express.json())

// File Upload Config
app.use(fileUpload())

// Make a public folder access to outside
app.use(express.static('./public'))



// CORS Config
const corsOptions={
    origin : true,
    credentials : true, // dont forget s
    optionSuccessStatus : 200
}
app.use(cors(corsOptions))

// Configuration dotenv
// dotenv.config()

// Connecting to the database
connectDB();

// Check dependencies on startup
checkDependencies();

// 3. Defining the port
const PORT=process.env.PORT;

// 4. Creating a test route or endpoint
app.get('/test',(req,res)=>{
    res.send("Test Api is working ...!")
})
app.get('/new_test',(req,res)=>{
    res.send("new Test Api is working ...!")
})

// Configuring user routes
app.use('/api/user',require('./routes/userRoutes'))
app.use('/api/product',require('./routes/productRoutes'))

// Apply security monitoring to all requests
app.use(securityMonitor);

// Log server startup
logger.info('Server starting...', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT
});

// Error handling middleware with logging
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// http://localhost:5000/api/user/create


//  Starting the server
app.listen(PORT,'0.0.0.0',()=>{
    console.log(`Server-app is Running on port ${PORT}`)
});



module.exports = app;
