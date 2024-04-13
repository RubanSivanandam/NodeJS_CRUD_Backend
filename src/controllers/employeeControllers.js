// Importing the required modules
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongo=require('../config/mongodb')
const {generateJWTToken}=require('../utils/jwUtils')

// Function to create a new employee
const createEmployee = async (req, res) => {
    const { username, designation, email, password } = req.body;
   // Connect to Mongo
   const { database, client } = await mongo();

   // Accessing the 'employees' collection in the MongoDB database
   const collection = database.collection('employee');
    try {
        // Check if the email is valid
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        // Check if the username is valid
        if (!validator.isAlphanumeric(username)) {
            return res.status(400).json({ message: 'Username must be alphanumeric' });
        }

        // Check if user already exists
        const existingUser = await collection.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

       // Check password criteria
        if (!(password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[$#@*]/.test(password)&& /[0-9]/.test(password))) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one capital letter, one small letter, and one special character such as #$@*' });
         }
    
        // Hash the password with saltround of 10
        const hashedPassword = await bcrypt.hash(password, 10);

         // Determine if the user is registering as an admin
         let role = 'user'; // Default role
         if (req.body.admin) {
             role = 'admin';   //admin role given during http request from frontend
         }

        // Retrieve the last used ID from the database
        const lastEmployee = await collection.findOne({}, { sort: { id: -1 } });
        
        let lastId = 999; // Default to 999 if no employee exists yet
        if (lastEmployee) {
            lastId = parseInt(lastEmployee.id);
        }
         
        // Generate the new ID by incrementing the last ID
        const newId = lastId + 1;

        // Create a new User document
        await collection.insertOne({
            id: newId, // Use the newly generated ID
            username,
            designation,
            email,
            password: hashedPassword,
            role
        });

        // Close the MongoDB connection
        client.close();

        // Logging success
        console.log("User registered successfully");

        // Send 201 response indicating success
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        // Handling errors
        console.error('Error:', error);
        // Send 500 response for internal server error
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = createEmployee;

// Function to update an existing employee by ID
const updateEmployee = async (req, res) => {
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
            res.status(200).json({message:"Employee updated successfully"});
        } else {
            // Close the MongoDB connection
            client.close();

            // Send 404 response if employee with specified ID was not found
            res.status(404).json({error:"Employee not found"});
        }
    } catch (error) {
        // Handling errors
        console.error('Error:', error);

        // Send 500 response for internal server error
        res.status(500).send("Internal Server Error");
    }
};
// Function to delete an employee
const deleteEmployee = async (req, res) => {
    try {
        // Check if user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden, admin role required' });
        }

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

// Function to login with validation
const loginEmployee = async (req, res) => {
    // Extracting data from request body
     // Connect to Mongo
   const { database, client } = await mongo();

   // Accessing the 'employees' collection in the MongoDB database
   const collection = database.collection('employee');
    try {
        // Find the user by email
        const user = await collection.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Email' });
        }

        // Compare the provided Password with Hashed password
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Password' });
        }

        // If authentication is successful, generate a JWT Token
        const token = generateJWTToken(user);

        // Check if user is an admin
        if (user.role === 'admin') {
            return res.status(200).json({ message: 'Welcome, admin', token });
        }

        // Check if user is a regular user
        if (user.role === 'user') {
            return res.status(200).json({ message: 'User access granted', token });

    // Logging success
    console.log("User registered successfully");
        }

        // If role is neither admin nor user, return 403 Forbidden
        return res.status(403).json({ message: 'Access forbidden, invalid role' });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    // Close the MongoDB connection
    client.close();

    
}
// Exporting functions to be used in the route layer
module.exports = {
    createEmployee,
    deleteEmployee,
    getByEmployeeId,
    getEmployees,
    updateEmployee,
    loginEmployee
};
