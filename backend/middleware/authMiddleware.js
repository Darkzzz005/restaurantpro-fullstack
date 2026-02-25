const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

req.user = decoded;
req.userId = decoded.id || decoded._id; 

if (!req.userId) {
  return res.status(401).json({ message: "Token invalid (missing user id)" });
}

next();

  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") next();
  else res.status(403).json({ message: "Access denied. Admin only." });
};
