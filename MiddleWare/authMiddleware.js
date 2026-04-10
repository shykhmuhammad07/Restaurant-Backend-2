import jwt from "jsonwebtoken";
import dotenv from "dotenv";  

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const protect = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Token:", token);
  
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
    
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default protect;