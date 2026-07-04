import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router: Router = Router();

router.use(authenticate);

router.get("/company", adminController.getCompanyInfo);
router.put("/company", adminController.updateCompanyInfo);

router.get("/products", adminController.getProducts);
router.post("/products", adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);

router.get("/articles", adminController.getArticles);
router.post("/articles", adminController.createArticle);
router.put("/articles/:id", adminController.updateArticle);
router.delete("/articles/:id", adminController.deleteArticle);

router.get("/contacts", adminController.getContacts);
router.put("/contacts/:id/reply", adminController.replyContact);
router.delete("/contacts/:id", adminController.deleteContact);

router.get("/admins", requireRole("SUPER_ADMIN", "ADMIN"), adminController.getAdmins);
router.post("/admins", requireRole("SUPER_ADMIN"), adminController.createAdmin);
router.put("/admins/:id", requireRole("SUPER_ADMIN"), adminController.updateAdmin);
router.delete("/admins/:id", requireRole("SUPER_ADMIN"), adminController.deleteAdmin);

router.get("/settings", adminController.getSettings);
router.put("/settings/:key", requireRole("SUPER_ADMIN", "ADMIN"), adminController.updateSetting);

export default router;
