import express from "express";
import { createUser, loginUser } from "./userController";
import registerValidator from "../validators/registerValidator";
import loginValidator from "../validators/loginValidator";

const router = express.Router();

router.post("/register", registerValidator, createUser);
router.post("/login", loginValidator, loginUser);

export default router;
