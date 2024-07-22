import { DATASREAM_TOKEN } from "../constants/config.js";
import { User } from "../models/User.js";
import { ErrorHandler } from "../utils/utlity.js";
import { TryCatch } from "./error.js";
import jwt from 'jsonwebtoken';


const isAuthenticated = TryCatch(async (req, res, next) => {
    const token = req.cookies[DATASREAM_TOKEN];
  
    if(!token) return next(new ErrorHandler('Login first to access this route', 401));
  
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  
    req.user = await  User.findById(decodedData._id);
  
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

  const adminOnly = (req, res, next) => {
    const token = req.cookies["Streamapp-admin-token"];
  
    if (!token)
      return next(new ErrorHandler("Only Admin can access this route", 401));
  
    const secretKey = jwt.verify(token, process.env.JWT_SECRET);
  
    const isMatched = secretKey === process.env.ADMIN_SECRET_KEY;
  
    if (!isMatched)
      return next(new ErrorHandler("Only Admin can access this route", 401));
  
    next();
  };

  export { isAuthenticated, authorizeSubscribers, authorizeAdmin, adminOnly};