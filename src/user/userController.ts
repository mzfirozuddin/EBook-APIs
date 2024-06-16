import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    //: Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ error: result.array() });
    }

    //: Process
    //: Response
    res.json({ message: "User created!" });
};

export { createUser };
