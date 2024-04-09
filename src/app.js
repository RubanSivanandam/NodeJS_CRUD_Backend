// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nocache = require('nocache');
const helmet = require('helmet');

// Importing employeeRoutes module
const employeeRoute = require('./routes/employeeRoutes');

// Creating an Express application
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json({ limit: '50mb' }));

// Middleware to parse incoming URL-encoded requests
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use(cors());

// Mounting the employeeRoutes middleware
app.use('/api/v1/employees', employeeRoute);

// Using helmet for security headers
app.use(helmet());

// Parse JSON bodies with a limit of 10mb
app.use(bodyParser.json({ limit: '10mb' }));

// Parse URL-encoded bodies with a limit of 10mb
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Disabling 'x-powered-by' header
app.disable('x-powered-by');

// Using nocache middleware to prevent caching
app.use(nocache());

// Setting the port number
const port = process.env.PORT || 8090;

// Starting the Express server
app.listen(port, () => console.log(`Server is running on port ${port}`));


