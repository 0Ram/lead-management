import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  // Get token from httpOnly cookie
  const token = req.cookies?.token;
  
  if (!token) {
    console.log('No token found in cookies');
    return res.status(401).json({ 
      message: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    console.log('Verifying token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully for user:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ 
      message: 'Invalid or expired token.',
      code: 'INVALID_TOKEN',
      error: error.message
    });
  }
};

export default authenticateToken;