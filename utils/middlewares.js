const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "Token is missing" })


    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err)
            return res.status(401).json({ message: "Invalid or Expired Token" });

        req.user = user;
        next();
    })
}

function authorizeRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    }
}
module.exports = { authMiddleware, authorizeRole}