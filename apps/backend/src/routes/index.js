import { Router } from "express";
import nominationRoutes from "./nomination.routes.js";

const router = Router();

router.use("/nomination", nominationRoutes);

export default router;
