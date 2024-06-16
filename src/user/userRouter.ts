import express from "express";
import { createUser } from "./userController";
import registerValidator from "../validators/registerValidator";

const router = express.Router();

router.post("/register", registerValidator, createUser);

export default router;
