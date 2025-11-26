import jwt from 'jsonwebtoken';

// Helper function to extract user ID from token
export const getUserIdFromToken = (req) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authorizationHeader.split("Bearer ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.id;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Middleware to authenticate user
export const authenticateToken = (req, res, next) => {
  console.log("Authenticating token", req.headers.authorization);

  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // console.log('token is extracted')

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decodedToken)

    if (!decodedToken.role || !['User', 'Admin', 'SuperAdmin'].includes(decodedToken.role)) {
      return res.status(401).json({ error: "Forbidden" });
    }

    req.user = decodedToken;
    console.log("authenticated")
    next();
  } catch (error) {
    console.error("Token verification failed", error.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Middleware to authenticate admin
export const authenticateAdmin = (req, res, next) => {
  console.log("Authenticating admin", req.headers.authorization);

  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  const token = authorizationHeader.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not found in Authorization header" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken.role || !['Admin', 'SuperAdmin'].includes(decodedToken.role)) {
      return res.status(401).json({ message: "Forbidden: User is not an admin" });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed", error.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
}