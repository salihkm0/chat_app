import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_KEY || "secret_key";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Ensure your cookies are correctly parsed using cookie-parser middleware

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
