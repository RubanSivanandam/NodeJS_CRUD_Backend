// Import the 'jsonwebtoken' library to handle JSON Web Tokens (JWT)
const jwt = require('jsonwebtoken');

// Function to generate a JWT token for a user
function generateJWTToken(user) {
    // Define the payload for the JWT token, which includes user information
    const payload = {
        user: {
            id: user._id,          // User ID
            email: user.email,      // User email
            password:user.password  // User password   
            // You can add any other user data you want to include in the token payload
        }
    };

    // Ensure that the JWT secret key is set in the environment variables
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT secret key not found');  // Throw an error if JWT secret key is missing
    }

    // Sign the JWT token with the secret key and set an expiration time of 1 hour
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Log the JWT secret key to the console (for debugging purposes)
    console.log(process.env.JWT_SECRET);

    // Return the generated JWT token
    return token;
}

// Export the 'generateJWTToken' function to make it accessible to other modules
module.exports = { generateJWTToken };
