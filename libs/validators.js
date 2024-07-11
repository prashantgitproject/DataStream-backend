import { body, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utlity.js"

const validateHandler = (req, res, next) => {
    const errors = validationResult(req);
    const errorMessages = errors.array().map((error) => error.msg).join(", ");

    console.log(errors);

    if(errors.isEmpty()) return next(); 
    else next(new ErrorHandler(errorMessages, 400));
};

const registerValidators = () => [
    body("email", "Please enter email").notEmpty(),
    body("password", "Please enter password").notEmpty(),
];

const loginValidators = () => [
    body("email", "PLease enter email").notEmpty(),
    body("password", "PLease enter password").notEmpty(),
];

export { registerValidators, loginValidators, validateHandler };