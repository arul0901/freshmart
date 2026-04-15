const supabase = require('../supabase');

/**
 * Auth Middleware: Validates Supabase JWT tokens
 * This allows the backend to know exactly who is making the request for auditing
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(); // Continue as guest if no token
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    // Note: We use the supabase.auth client to verify the user via the token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Attach user to request for LoggerService and other controllers
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    next(); // Fallback to guest rather than crashing
  }
};

module.exports = authenticate;
