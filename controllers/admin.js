import { TryCatch } from "../middlewares/error.js";
import { cookieOptions } from "../utils/features.js";
import { ErrorHandler } from "../utils/utlity.js";
import jwt from "jsonwebtoken";
import { Stats } from "../models/Stats.js";

export const adminLogin = TryCatch(async (req, res, next) => {
    const { secretKey } = req.body;
  
    const isMatched = secretKey === process.env.ADMIN_SECRET_KEY;
  
    if (!isMatched) return next(new ErrorHandler("Invalid Admin Key", 401));
  
    const token = jwt.sign(secretKey, process.env.JWT_SECRET);
  
    return res
      .status(200)
      .cookie("Streamapp-admin-token", token, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 15,
      })
      .json({
        success: true,
        message: "Authenticated Successfully, Welcome BOSS",
      });
});

export const adminLogout = TryCatch(async (req, res, next) => {
    return res
      .status(200)
      .cookie("Streamapp-admin-token", "", {
        ...cookieOptions,
        maxAge: 0,
      })
      .json({
        success: true,
        message: "Logged Out Successfully",
      });
});

export const getDashboardStats = TryCatch(async (req, res, next) => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);
    const statsData = [];
  
    for (let i = 0; i < stats.length; i++) {
      statsData.unshift(stats[i]);
    }
    const requiredSize = 12 - stats.length;
  
    for (let i = 0; i < requiredSize; i++) {
      statsData.unshift({
        users: 0,
        subscription: 0,
        views: 0,
      });
    }
  
    const usersCount = statsData[11].users;
    const subscriptionCount = statsData[11].subscription;
    const viewsCount = statsData[11].views;
  
    let usersPercentage = 0,
      viewsPercentage = 0,
      subscriptionPercentage = 0;
    let usersProfit = true,
      viewsProfit = true,
      subscriptionProfit = true;
  
    if (statsData[10].users === 0) usersPercentage = usersCount * 100;
    if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;
    if (statsData[10].subscription === 0)
      subscriptionPercentage = subscriptionCount * 100;
    else {
      const difference = {
        users: statsData[11].users - statsData[10].users,
        views: statsData[11].views - statsData[10].views,
        subscription: statsData[11].subscription - statsData[10].subscription,
      };
  
      usersPercentage = (difference.users / statsData[10].users) * 100;
      viewsPercentage = (difference.views / statsData[10].views) * 100;
      subscriptionPercentage =
        (difference.subscription / statsData[10].subscription) * 100;
      if (usersPercentage < 0) usersProfit = false;
      if (viewsPercentage < 0) viewsProfit = false;
      if (subscriptionPercentage < 0) subscriptionProfit = false;
    }
  
    res.status(200).json({
      success: true,
      stats: statsData,
      usersCount,
      subscriptionCount,
      viewsCount,
      subscriptionPercentage,
      viewsPercentage,
      usersPercentage,
      subscriptionProfit,
      viewsProfit,
      usersProfit,
    });
  });

export const getAdmin = TryCatch(async (req, res, next) => {
    res.status(200).json({
      admin: true
    });
  });