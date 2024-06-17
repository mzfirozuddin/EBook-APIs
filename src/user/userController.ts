import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { User } from "./userModel";
import createHttpError from "http-errors";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { IUser } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    //: Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ error: result.array() });
    }

    const { name, email, password } = req.body;

    //: DB Call (Check user is already present or not in DB)
    try {
        const user = await User.findOne({ email });
        if (user) {
            const error = createHttpError(
                400,
                "User already exists with this email!"
            );
            return next(error);
        }
    } catch (err) {
        return next(createHttpError(500, "Error while getting the user!"));
    }

    //: Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    //: Store user in DB
    let newUser: IUser;
    try {
        newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });
    } catch (err) {
        return next(createHttpError(500, "Error while creating user!"));
    }

    try {
        //: JWT token generation
        const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
            expiresIn: "7d",
        });
        //: Response
        res.status(201).json({ id: newUser._id, accessToken: token });
    } catch (err) {
        return next(createHttpError(500, "Error while signing jwt token!"));
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    //: Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ error: result.array() });
    }

    const { email, password } = req.body;

    try {
        //: Check user present in DB or not
        const user = await User.findOne({ email });
        if (!user) {
            return next(createHttpError(400, "User not found!"));
        }

        //: Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(
                createHttpError(400, "Username or password incorrect!")
            );
        }

        //: create access token
        const token = sign({ sub: user._id }, config.jwtSecret as string, {
            expiresIn: "7d",
            algorithm: "HS256",
        });

        //: Response
        res.status(200).json({
            id: user._id,
            accessToken: token,
            msg: "Login Successful.",
        });
    } catch (err) {
        return next(createHttpError(500, "Error while logging user!"));
    }
};

export { createUser, loginUser };
