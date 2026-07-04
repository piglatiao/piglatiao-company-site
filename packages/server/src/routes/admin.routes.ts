import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async.js";

const router: Router = Router();

router.use(authenticate);

router.get("/company", asyncHandler(adminController.getCompanyInfo));
router.put("/company", asyncHandler(adminController.updateCompanyInfo));

router.get("/products", asyncHandler(adminController.getProducts));
router.post("/products", asyncHandler(adminController.createProduct));
router.put("/products/:id", asyncHandler(adminController.updateProduct));
router.delete("/products/:id", asyncHandler(adminController.deleteProduct));

router.get("/articles", asyncHandler(adminController.getArticles));
router.post("/articles", asyncHandler(adminController.createArticle));
router.put("/articles/:id", asyncHandler(adminController.updateArticle));
router.delete("/articles/:id", asyncHandler(adminController.deleteArticle));

router.get("/contacts", asyncHandler(adminController.getContacts));
router.put("/contacts/:id/reply", asyncHandler(adminController.replyContact));
router.delete("/contacts/:id", asyncHandler(adminController.deleteContact));

router.get("/admins", requireRole("SUPER_ADMIN", "ADMIN"), asyncHandler(adminController.getAdmins));
router.post("/admins", requireRole("SUPER_ADMIN"), asyncHandler(adminController.createAdmin));
router.put("/admins/:id", requireRole("SUPER_ADMIN"), asyncHandler(adminController.updateAdmin));
router.delete("/admins/:id", requireRole("SUPER_ADMIN"), asyncHandler(adminController.deleteAdmin));

router.get("/settings", asyncHandler(adminController.getSettings));
router.put("/settings/:key", requireRole("SUPER_ADMIN", "ADMIN"), asyncHandler(adminController.updateSetting));

export default router;
