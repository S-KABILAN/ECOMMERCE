import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
//import catchAsyncError from "../middlewares/catchAsyncError.js";
import APIFeatures from "../utils/apiFeatures.js";
import { sendResponse } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";
import { factoryService } from "../services/factoryService.js";


// Get all products - /api/v1/products
export const getProducts = async (req, res, next) => {
  const resPerPage = 2;
  const apiFeatures = new APIFeatures(factoryService.find(Product), req.query)
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
  const product = await factoryService.create(Product,req.body);

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
   const product = await factoryService.findById(Product,id);

  if (!product) {
    return next(new ErrorHandler("Product not found", StatusCodes.NOT_FOUND)); // Updated to 404 status code
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
  const product = await factoryService.findById(Product,id)

  if (!product) {
    return next(new ErrorHandler("Product not found", StatusCodes.NOT_FOUND));
  }

  const updatedProduct = await factoryService.updateById(Product,id,req.body);

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
  const product = await factoryService.findById(Product,id);

  if (!product) {
    return next(new ErrorHandler("Product not found", StatusCodes.NOT_FOUND)); // Using ErrorHandler
  }

  await factoryService.deleteById(Product,id);

  sendResponse(res, StatusCodes.OK, true, "Product deleted successfully");

};
