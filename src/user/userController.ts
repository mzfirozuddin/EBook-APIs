import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { User } from "./userModel";
import createHttpError from "http-errors";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    //: Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ error: result.array() });
    }

    const { name, email, password } = req.body;

    //: DB Call (Check user is already present or not in DB)
    const user = await User.findOne({ email });
    if (user) {
        const error = createHttpError(
            400,
            "User already exists with this email!"
        );
        return next(error);
    }

    //: Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    //: Store user in DB
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    //: JWT token generation
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
        expiresIn: "7d",
    });
    //: Response
    res.json({ id: newUser._id, accessToken: token });
};

export { createUser };
