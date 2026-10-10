import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rsu_vpass_super_secret_jwt_token_2026_romblon');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token is expired or invalid', error: error.message });
  }
};
