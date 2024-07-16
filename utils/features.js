import {v2 as cloudinary} from "cloudinary";
import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import { getBase64 } from "../libs/helper.js";
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";

// const cookieOptions = {
//   httpOnly: true,
//   expires: new Date(
//     Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
//   ),
// };

  const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none"
};

const connectDB = (uri) => {
    mongoose.connect(uri, {dbName: 'DataStream'}).then((data) => {
        console.log(`Connected to MongoDB: ${data.connection.host}`)
    }).catch((err) => {
        throw err
    });
};


const sendToken = (res, user, code, message) => {
  const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);


  return res.status(code).cookie('datastream-token', token, cookieOptions).json({
      success: true,
      user,
      message,
  });
};

const sendMail = async (email, subject, text) => {
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    text,
  }); 
};

const uploadFilesToCloudinary = async (files = [], folder, type = 'auto') => {
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          getBase64(file),
          {
            resource_type: type,
            public_id: uuid(),
            folder: `Data_Stream/${folder}`
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
      });
    });
  
    try {
      const results = await Promise.all(uploadPromises);
  
      const formattedResults = results.map((result) => ({
        public_id: result.public_id,
        url: result.secure_url,
      }));
      return formattedResults;
    } catch (err) {
      throw new Error("Error uploading files to cloudinary", err);
    }
  };

  const deleteFilesFromCloudinary = async (public_ids) => {
    console.log(public_ids);
    const deletePromises = public_ids.map((id) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(id, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
    });
  
    try {
      await Promise.all(deletePromises);
    } catch (err) {
      throw new Error("Error deleting files from cloudinary", err);
    }
  };

  export { connectDB, sendToken, uploadFilesToCloudinary, deleteFilesFromCloudinary, sendMail, cookieOptions };