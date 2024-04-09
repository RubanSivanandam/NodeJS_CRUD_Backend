// Importing the Router class from the 'express' module
const Router = require('express')

// Importing the employeeController module from the specified path
const employeeController = require('./../controllers/employeeControllers')

// Creating a new router instance
const router = Router();

// Defining routes and associating them with corresponding controller functions
router.get('/find', employeeController.getEmployees);         // Route to handle GET requests to retrieve all employees
router.get('/find/:id', employeeController.getByEmployeeId);   // Route to handle GET requests to retrieve an employee by ID
router.post('/create', employeeController.createEmployee)       // Route to handle POST requests to create a new employee
router.delete('/delete/:id', employeeController.deleteEmployee); // Route to handle DELETE requests to delete an employee by ID
router.put('/update/:id', employeeController.updateEmployee); // Route to handle PUT(update) requests to update an employee by ID
//router.get('/test', employeeController.testidCreation); // New route to retrieve desired data from both databases by ID
// Exporting the router instance to make it available for other modules
module.exports = router;

