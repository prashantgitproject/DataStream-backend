import bcrypt, { compare } from "bcrypt";
import { TryCatch } from "../middlewares/error.js";
import { User } from "../models/user.js";
import { cookieOptions, deleteFilesFromCloudinary, sendMail, sendToken, uploadFilesToCloudinary } from "../utils/features.js";
import { ErrorHandler } from "../utils/utlity.js";
import { Course } from "../models/Course.js";
import { Stats } from "../models/Stats.js";


export const verifyUser = TryCatch(async (req, res, next) => {

    const {email} = req.body;

    const userMail = await User.findOne({email: email});

    if(userMail) return next(new ErrorHandler("Email already exits", 400));
  

    const otp = Math.floor(Math.random() * 1000000);
  

    await sendMail(email, "Verify your account", `Your OTP is ${otp}`);

    const notHashedOtp = otp.toString();
    const salt = bcrypt.genSaltSync(10);
    const hashedOtp = bcrypt.hashSync(notHashedOtp, salt);


    res.status(201).json({
        success: true,
        hashedOtp,
        message: "OTP sent to your email, please verify your account",
    });
}); 


export const registerUser = TryCatch(async (req, res, next) => {

    const { email, password } = req.body;
  
    const user = await User.create({
        email,
        password,
    });
    await user.save();

    sendToken(res, user, 200, "Account Verified");
});


export const login = TryCatch(async(req, res, next) => {
const {email, password} = req.body;

const user = await User.findOne({email}).select('+password');

if(!user) return next(new ErrorHandler("User not found", 404));

const isMatch = await compare(password, user.password);

if(!isMatch) return next(new ErrorHandler("Invalid Credentials!", 404));

sendToken(res, user, 200, `Welcome back ${user.name}`);

});


export const getMyProfile = TryCatch(async (req, res, next) => {

    const user = await User.findById(req.user);

    if (!user) return next(new ErrorHandler("User not found", 404));

    res.status(200).json({
        success: true,
        user
    })
});


export const updateProfile = TryCatch(async (req, res, next) => {
    const {name, id} = req.body;

    const file = req.file;

    const user = await User.findById(id);

    if(file) {
        if(user.avatar) {
            await deleteFilesFromCloudinary([user.avatar.public_id]);
        }

        const result = await uploadFilesToCloudinary([file], "avatars"); 

        const avatar = {
            public_id: result[0].public_id,
            url: result[0].url,
        }

        user.avatar = avatar;
    }

    user.name = name;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
    });
});


export const logout = TryCatch(async (req, res) => {

    return res.status(200).cookie('datastream-token', "", {...cookieOptions, maxAge: 0}).json({
        success: true,
        message: 'Logged out successfully'
    })
});


export const forgetPassword = TryCatch(async (req, res, next) => {
    const {email} = req.body;

    const user = await User.findOne({email: email});

    if(!user) return next(new ErrorHandler("User not found", 404));

    const otp = Math.floor(Math.random() * 1000000);

    await sendMail(email, "Password Reset", `Your OTP is ${otp}`);

    const notHashedOtp = otp.toString();

    const salt = bcrypt.genSaltSync(10);

    const hashedOtp = bcrypt.hashSync(notHashedOtp, salt);

    res.status(200).json({
        success: true,
        hashedOtp,
        message: "OTP sent to your email, please verify",
    });
});

export const updatePassword = TryCatch(async (req, res, next) => {
    const {email, password} = req.body;

    const user = await User.findOne({email: email});

    if(!user) return next(new ErrorHandler("User not found", 404));
    if(!password) return next(new ErrorHandler("Password is required", 400));

    user.password = password;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});

export const resetPassword = TryCatch(async (req, res, next) => {
    const {id, password, oldPassword} = req.body;

    const user = await User.findById(id).select('+password');

    if(!user) return next(new ErrorHandler("User not found", 404));

    const isMatch = await compare(oldPassword, user.password)

    if(!isMatch) return next(new ErrorHandler("Invalid Old Password!", 404));

    if(!password) return next(new ErrorHandler("Password is required", 400));

    user.password = password;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});

export const addToPlaylist = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.user._id);
  
    const course = await Course.findById(req.body.id);
  
    if (!course) return next(new ErrorHandler("Invalid Course Id", 404));
  
    const itemExist = user.playlist.find((item) => {
      if (item.course.toString() === course._id.toString()) return true;
    });
  
    if (itemExist) return next(new ErrorHandler("Item Already Exist", 409));
  
    user.playlist.push({
      course: course._id,
      poster: course.poster.url,
    });
  
    await user.save();
  
    res.status(200).json({
      success: true,
      message: "Added to playlist",
    });
});

export const removeFromPlaylist = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);
    if (!course) return next(new ErrorHandler("Invalid Course Id", 404));
  
    const newPlaylist = user.playlist.filter((item) => {
      if (item.course.toString() !== course._id.toString()) return item;
    });
  
    user.playlist = newPlaylist;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Removed From Playlist",
    });
});

// Admin Controllers

export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
  
    res.status(200).json({
      success: true,
      users,
    });
  });
  
export const updateUserRole = TryCatch(async (req, res, next) => {
const user = await User.findById(req.params.id);

if (!user) return next(new ErrorHandler("User not found", 404));

if (user.role === "user") user.role = "admin";
else user.role = "user";

await user.save();

res.status(200).json({
    success: true,
    message: "Role Updated",
});
});

export const deleteUser = TryCatch(async (req, res, next) => {
const user = await User.findById(req.params.id);

if (!user) return next(new ErrorHandler("User not found", 404));

await deleteFilesFromCloudinary([user.avatar.public_id]);

// Cancel Subscription

await user.remove();

res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
});
});

export const deleteMyProfile = TryCatch(async (req, res, next) => {
const user = await User.findById(req.user._id);

await deleteFilesFromCloudinary([user.avatar.public_id]);

// Cancel Subscription

await user.remove();

res.status(200)
    .cookie("datastream-token", null, {...cookieOptions, maxAge: 0})
    .json({
    success: true,
    message: "User Deleted Successfully",
    });
});

User.watch().on("change", async () => {
const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

const subscription = await User.find({ "subscription.status": "active" });
stats[0].users = await User.countDocuments();
stats[0].subscription = subscription.length;
stats[0].createdAt = new Date(Date.now());

await stats[0].save();
});
