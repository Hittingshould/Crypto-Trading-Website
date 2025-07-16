const adminAuthMiddleware = (req, res, next) => {
  // user object has a 'role' field
  if (req.user && req.user.role[0] === "admin") {
    
    // User has the 'admin' role, proceed to the next middleware or route handler
    next();
  } else {
    // User doesn't have the required role, send a forbidden response
    res.status(403).render('error', { errorMessage: "Permission Denied. Not Authorized" });
  }
};

module.exports = adminAuthMiddleware;
