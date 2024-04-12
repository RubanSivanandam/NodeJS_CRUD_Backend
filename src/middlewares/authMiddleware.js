const jwt = require('jsonwebtoken');
const unless = require('express-unless'); // Import the unless function from express-unless module
const { MongoClient } = require('mongodb'); // Import the MongoClient from MongoDB

// Middleware function to verify JWT token
const authenticateJWT = async (req, res, next) => {
    try {
        // Get token from the request header
        const authorizationHeader = req.header('Authorization');

        // Check if Authorization header exists
        if (!authorizationHeader) {
            return res.status(401).json({ message: 'Authorization header is missing' });
        }

        // Split the Authorization header to extract the token
        const token = authorizationHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Connect to MongoDB
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const database = client.db(process.env.DB_NAME);

        // Query the database to retrieve user information based on the decoded token
        const user = await database.collection('employees').findOne({ _id: decoded.user.id });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user information to the request object
        req.user = user;
        
        // Close the MongoDB connection
        await client.close();

        // Call the next middleware
        next();
    } catch (error) {
        console.error('Error authenticating JWT Token:', error);
        res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
}


/* // Assign the 'unless' function to the 'authenticateJWT' middleware
authenticateJWT.unless = unless; */

// Export the 'authenticateJWT' middleware
module.exports={authenticateJWT}