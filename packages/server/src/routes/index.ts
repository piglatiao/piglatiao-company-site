import { Router } from "express";
import authRoutes from "./auth.routes.js";
import publicRoutes from "./public.routes.js";
import adminRoutes from "./admin.routes.js";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/public", publicRoutes);
router.use("/admin", adminRoutes);

export default router;
