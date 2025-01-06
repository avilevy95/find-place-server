export const verifyAdmin = (req, res, next) => {
    const user = req.user; 
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  
    next();
  };
  