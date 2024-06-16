import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        errorMessage: "Name is required!",
        trim: true,
        notEmpty: true,
    },
    email: {
        errorMessage: "Email is required!",
        trim: true,
        notEmpty: true,
        isEmail: {
            errorMessage: "Email must be a valid email!",
        },
    },
    password: {
        errorMessage: "Password is required!",
        trim: true,
        notEmpty: true,
        isLength: {
            options: {
                min: 6,
            },
            errorMessage: "Password length should be at least 6 chars!",
        },
    },
});
