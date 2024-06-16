import express from "express";
import { createUser } from "./userController";

const router = express.Router();

router.post("/register", createUser);

export default router;
