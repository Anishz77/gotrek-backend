const mongoose = require('mongoose');

// 2. Creating a function
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_CLOUDURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            retryReads: true,
        });
        
        console.log('🟢 MongoDB Connection Status:');
        console.log(`Connected to: ${conn.connection.host}`);
        console.log(`Database name: ${conn.connection.name}`);
        console.log(`Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
        
    } catch (error) {
        console.error('🔴 MongoDB Connection Error:');
        console.error(`Error message: ${error.message}`);
        console.error('Full error:', error);
        process.exit(1);
    }
};

// Add connection event listeners
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected');
});

// 3. Exporting the function
module.exports = connectDB;
