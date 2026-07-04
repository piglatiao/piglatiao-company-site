import { Router } from "express";
import * as publicController from "../controllers/public.controller.js";

const router: Router = Router();

router.get("/company", publicController.getCompanyInfo);
router.get("/settings", publicController.getPublicSettings);
router.get("/products", publicController.getProducts);
router.get("/products/:id", publicController.getProductById);
router.get("/articles", publicController.getArticles);
router.get("/articles/:id", publicController.getArticleById);
router.post("/contact", publicController.submitContact);

export default router;
