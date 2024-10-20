import express from "express";
import {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController.js";
import {
  isAuthenticatedUser,
  authorizeRoles,
} from "../middlewares/authenticate.js";

const router = express.Router();

router.route("/products").get(isAuthenticatedUser, getProducts);
router
  .route("/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);
router
  .route("/product/:id")
  .get(getSingleProduct)
  .put(isAuthenticatedUser, updateProduct) 
  .delete(isAuthenticatedUser, deleteProduct); 

export default router;
