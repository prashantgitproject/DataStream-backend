import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utlity.js";
import { sendMail } from "../utils/features.js";

export const contact = TryCatch(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return next(new ErrorHandler("All fields are mandatory", 400));

  const to = process.env.MY_MAIL;
  const subject = "Contact from CourseBundler";
  const text = `I am ${name} and my Email is ${email}. \n${message}`;

  await sendMail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your Message Has Been Sent.",
  });
});

export const courseRequest = TryCatch(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course)
    return next(new ErrorHandler("All fields are mandatory", 400));

  const to = process.env.MY_MAIL;
  const subject = "Requesting for a course on CourseBundler";
  const text = `I am ${name} and my Email is ${email}. \n${course}`;

  await sendMail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your Request Has Been Sent.",
  });
});


