import { Router } from "express";
import {
  createNomination,
  getNominations,
} from "../controllers/nomination.controller.js";

const router = Router();

router.get("/", getNominations);
router.post("/", createNomination);

export default router;
