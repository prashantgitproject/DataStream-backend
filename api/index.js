import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsOptions } from "../constants/config.js";
import { connectDB } from "../utils/features.js";
import {v2 as cloudinary} from "cloudinary";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../middlewares/error.js";
import bodyParser from "body-parser";
import RazorPay from "razorpay";
import nodeCron from "node-cron";
import { Stats } from "../models/Stats.js";

import userRoute from '../routes/user.js';
import courseRoute from '../routes/course.js';
import paymentRoute from '../routes/payment.js';
import otherRoute from '../routes/other.js';

dotenv.config( { path: './.env' });

const app = express();
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

export const instance = new RazorPay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

nodeCron.schedule("0 0 0 5 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});

connectDB(MONGO_URI);

// using middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors(corsOptions))
app.use(cookieParser())

app.use('/api/v1/user', userRoute);
app.use('/api/v1/course', courseRoute);
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/other', otherRoute);


app.get('/' , (req, res) => {
    res.send('Hello World')
});


app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running at port no. ${PORT} in ${envMode} Mode`)
})

export { envMode };