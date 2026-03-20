import { Router } from "express";
import {
  getNominationById,
  getNominations,
} from "../controllers/admin.controller.js";

const router = Router();

router.get("/nominations", getNominations);
router.get("/nominations/:id", getNominationById);

export default router;
