// Importing the required module for MongoDB connectivity
const { MongoClient } = require('mongodb');

// Connection URI for MongoDB
const uri = 'mongodb://localhost:27017/emp-management';

// Database Name
const dbName = 'emp-management';

// Collection Name
const collectionName = 'employee';

// Function to connect to MongoDB
async function mongo() {
    
    // Creating a new instance of MongoClient to connect to the MongoDB server
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        
        // Attempting to establish a connection to the MongoDB server
        await client.connect();
        
        // If connection is successful, log a success message
        console.log('Connected successfully to MongoDB');

        // Return an object containing the connected client and the specified database
        return {
            client, // Connected MongoClient instance
            database: client.db(dbName) // Specified database from the connected client
        };
    } catch (error) {
        // If an error occurs during connection, log the error
        console.error('Error connecting to MongoDB:', error);
        // Rethrow the error to the caller
        throw error;
    }
}

// Exporting the function to connect to MongoDB
module.exports = mongo;
