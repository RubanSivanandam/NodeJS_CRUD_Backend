// Importing the MongoDB configuration file
const mongo = require('../config/mongodb');

// Function to create a new employee
const createEmployee = async (req, res) => {
    const { username,designation,email, password } = req.body;

    try {
        // Connect to MongoDB
        const { database, client } = await mongo();

        // Accessing the 'employees' collection in the MongoDB database
        const collection = database.collection('employee');

        // Retrieve the last used ID from the database
        const lastEmployee = await collection.findOne({}, { sort: { id: -1 } });
        
        let lastId = 999; // Default to 999 if no employee exists yet
        if (lastEmployee) {
            lastId = parseInt(lastEmployee.id);
        }
        
        // Generate the new ID by incrementing the last ID
        const newId = lastId + 1;

        // Inserting the new employee document into the collection
        await collection.insertOne({
            id: newId, // Use the newly generated ID
            username,
            designation,
            email,
            password
        });

        // Logging success
        console.log("Employee inserted into MongoDB successfully");

        // Close the MongoDB connection
        client.close();

        // Send 201 response indicating success
        res.status(201).json({ message: "Employee created successfully" });
    } catch (error) {
        // Handling errors
        console.error('Error:', error);
        // Send 500 response for internal server error
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Function to update an existing employee by ID
const updateEmployee = async (req, resp) => {
    // Extracting data from request body
    const { id, username,designation,email, password } = req.body;

    try {
        // Connect to MongoDB
        const { database, client } = await mongo();

        // Accessing the 'employees' collection in the MongoDB database
        const collection = database.collection('employee');

        // Update the employee document in the collection
        const result = await collection.updateOne(
            { id: parseInt(id) }, // Match employee by ID
            { $set: { username, email, designation, password } } // Set new values
        );

        // Check if the update was successful
        if (result.modifiedCount === 1) {
            // Logging success
            console.log(`Employee with ID ${id} updated in MongoDB successfully`);

            // Close the MongoDB connection
            client.close();

            // Send success response
            resp.status(200).json({message:"Employee updated successfully"});
        } else {
            // Close the MongoDB connection
            client.close();

            // Send 404 response if employee with specified ID was not found
            resp.status(404).json({error:"Employee not found"});
        }
    } catch (error) {
        // Handling errors
        console.error('Error:', error);

        // Send 500 response for internal server error
        resp.status(500).send("Internal Server Error");
    }
};
// Function to delete an employee
const deleteEmployee = async (req, res) => {
    try {
        // Connect to MongoDB
        const { database } = await mongo();

        // Accessing the 'employees' collection in the MongoDB database
        const collection = database.collection('employee');

        // Deleting the employee document from the collection
        await collection.deleteOne({ id: parseInt(req.params.id) });

        // Logging success
        console.log("Employee deleted from MongoDB successfully");

        // Send success response
        res.status(200).json("Employee deleted successfully");
    } catch (error) {
        // Handling errors
        console.error('MongoDB Connection Error:', error);
        res.status(500).json("Internal Server Error");
    }
};

// Function to retrieve all employees
const getEmployees = async (_, res) => {
    try {
        // Connect to MongoDB
        const { database } = await mongo();

        // Accessing the 'employee' collection in the MongoDB database
        const collection = database.collection('employee');

        // Retrieving all employees from the collection
        const employees = await collection.find({}).toArray();

        // Logging success
        console.log("All Employees retrieved from MongoDB successfully");

        // Send response with the retrieved employees
        res.status(200).json(employees);
    } catch (error) {
        // Handling errors
        console.error('MongoDB Error:', error);
        res.status(500).send("Internal Server Error");
    }
};

// Function to retrieve an employee by id
const getByEmployeeId = async (req, res) => {
    try {
        // Connect to MongoDB
        const { database } = await mongo();

        // Accessing the 'employee' collection in the MongoDB database
        const collection = database.collection('employee');

        // Retrieving the employee by ID from the collection
        const employee = await collection.findOne({ id: parseInt(req.params.id) });

        // Logging success
        console.log(`Employee with ID ${req.params.id} retrieved from MongoDB successfully`);

        // Send response with the retrieved employee
        res.status(200).json(employee);
    } catch (error) {
        // Handling errors
        console.error('MongoDB Error:', error);
        res.status(500).send("Internal Server Error");
    }
};

// Exporting functions to be used in the route layer
module.exports = {
    createEmployee,
    deleteEmployee,
    getByEmployeeId,
    getEmployees,
    updateEmployee
};
