import { DATASREAM_TOKEN } from "../constants/config.js";
import { ErrorHandler } from "../utils/utlity.js";
import { TryCatch } from "./error.js";
import jwt from 'jsonwebtoken';


const isAuthenticated = TryCatch((req, res, next) => {
    const token = req.cookies[DATASREAM_TOKEN];
  
    if(!token) return next(new ErrorHandler('Login first to access this route', 401));
  
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  
    req.user = decodedData._id;
  
    next();
  });

  const authorizeSubscribers = (req, res, next) => {
    if (req.user.subscription.status !== "active" && req.user.role !== "admin")
      return next(
        new ErrorHandler(`Only Subscribers can acces this resource`, 403)
      );
  
    next();
  };
  
  const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin")
      return next(
        new ErrorHandler(
          `${req.user.role} is not allowed to access this resource`,
          403
        )
      );
  
    next();
  };

  export { isAuthenticated, authorizeSubscribers, authorizeAdmin};