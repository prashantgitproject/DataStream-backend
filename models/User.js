import { hash } from "bcrypt";
import mongoose, { Schema, model } from "mongoose";
// import jwt from "jsonwebtoken";


const schema = new Schema(  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    subscription: {
      id: String,
      status: String,
    },
    playlist: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        poster: String,
      },
    ],
  },
  {
    timestamps: true,
  })

  schema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    
    this.password = await hash(this.password, 10);
  })

  // schema.methods.getJWTToken = function () {
  //   return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  //   });
  // };
  
  // schema.methods.comparePassword = async function (password) {
  //   return await bcrypt.compare(password, this.password);
  // };
  
  // schema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.models.User || model("User", schema);