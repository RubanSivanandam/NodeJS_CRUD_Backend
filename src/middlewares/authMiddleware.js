const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
async function authenticateJWT(req, res, next) {
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

        // Attach user information to the request object
        req.user = {
            id: decoded.user.id,
            username: decoded.user.username, // Assuming username is included in the JWT payload
            role:decoded.user.role
        };

        next();
    } catch (error) {
        console.error('Error authenticating JWT Token:', error);
        res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
}

module.exports = { authenticateJWT };
