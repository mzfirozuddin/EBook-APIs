import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";

const app = express();
app.use(express.json());

// Register user router
app.use("/api/users", userRouter);
// Register book router
app.use("/api/books", bookRouter);

// Global Error Handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.env === "development" ? err.stack : "",
    });
});

export default app;
