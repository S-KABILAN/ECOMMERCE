import Product from "../models/productModel.js";

// Find all products with query
export const findProducts = (query) => {
  return Product.find(query);
};

// Create a new product
export const createProduct = (productData) => {
  return Product.create(productData);
};

// Find a product by ID
export const findProductById = (id) => {
  return Product.findById(id);
};

// Update a product by ID
export const updateProductById = (id, updateData) => {
  return Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Delete a product by ID
export const deleteProductById = (id) => {
  return Product.findByIdAndDelete(id);
};
