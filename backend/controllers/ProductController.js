import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
//import catchAsyncError from "../middlewares/catchAsyncError.js";
import APIFeatures from "../utils/apiFeatures.js";
import { sendResponse } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";
import {
  findProducts,
  createProduct,
  findProductById,
  updateProductById,
  deleteProductById,
} from "../DBoperations/productDB.js";

// Get all products - /api/v1/products
export const getProducts = async (req, res, next) => {
  const resPerPage = 2;
  const apiFeatures = new APIFeatures(findProducts(), req.query)
    .search()
    .filter()
    .paginate(resPerPage);

  const products = await apiFeatures.query;

  sendResponse(res, StatusCodes.OK, true, "Products fetched successfully", {
    count: products.length,
    products,
  });
};

// Create a new product - /api/v1/product/new
export const newProduct = async (req, res, next) => {
  req.body.user = req.user.id; // Assuming req.user is set by authentication middleware
  const product = await createProduct(req.body);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    "Product created successfully",
    product
  );
};

// Get single product - /api/v1/product/:id
export const getSingleProduct = async (req, res, next) => {
   const { id } = req.params;
   const product = await findProductById(id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404)); // Updated to 404 status code
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    "Product fetched successfully",
    product
  );
};



// Update product - /api/v1/product/:id
export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const updatedProduct = await updateProductById(id, req.body);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    "Product updated successfully",
    updatedProduct
  );
};



// Delete product - /api/v1/product/:id
export const deleteProduct = async (req, res, next) => {
    const { id } = req.params;
  const product = await findProductById(id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404)); // Using ErrorHandler
  }

  await deleteProductById(id);

  sendResponse(res, StatusCodes.OK, true, "Product deleted successfully");

};
