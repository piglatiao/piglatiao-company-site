import { Router } from "express";
import * as publicController from "../controllers/public.controller.js";
import { asyncHandler } from "../middleware/async.js";

const router: Router = Router();

router.get("/company", asyncHandler(publicController.getCompanyInfo));
router.get("/settings", asyncHandler(publicController.getPublicSettings));
router.get("/products", asyncHandler(publicController.getProducts));
router.get("/products/:id", asyncHandler(publicController.getProductById));
router.get("/articles", asyncHandler(publicController.getArticles));
router.get("/articles/:id", asyncHandler(publicController.getArticleById));
router.post("/contact", asyncHandler(publicController.submitContact));

export default router;
