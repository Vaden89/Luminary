import { Router } from "express";
import { createNomination } from "../controllers/nomination.controller.js";

const router = Router();

router.post("/", createNomination);

export default router;
