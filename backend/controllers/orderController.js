import catchAsyncError from "../middlewares/catchAsyncError.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js"; // Ensure you import the Product model
import ErrorHandler from "../utils/errorHandler.js";
import { sendResponse } from "../utils/responseHandler.js";
// Create New Order - api/v1/order/new
export const newOrder = catchAsyncError(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  // Validate input here (optional)

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user.id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// Get Single Order - api/v1/order/:id
export const getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404)
    );
  }

  sendResponse(res, 200, true, "Order fetched successfully", order);

});

// Get Logged-in User Orders - api/v1/myorders
export const myOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({ user: req.user.id });

  sendResponse(res, 200, true, "Orders fetched successfully", orders);
});

// Admin: Get all orders - /api/v1/orders
export const orders = catchAsyncError(async (req, res) => {
  const orders = await Order.find();

  const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  sendResponse(res, 200, true, "Orders fetched successfully", {
    totalAmount,
    orders,
  });
});

// Admin: Update Order - /api/v1/order/:id
export const updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404)
    );
  }

  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler("This order has already been delivered.", 400)
    );
  }

  await Promise.all(
    order.orderItems.map((orderItem) =>
      updateStock(orderItem.product, orderItem.quantity)
    )
  );

  order.orderStatus = req.body.orderStatus;
  order.deliveredAt = Date.now();

  await order.save();

  sendResponse(res, 200, true, "Order updated successfully");
});

// Stock Update Function
const updateStock = async (productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ErrorHandler(`Product not found with id: ${productId}`, 404);
  }

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
};

// Admin: Delete Order - api/v1/order/:id
export const deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404)
    );
  }

  await order.deleteOne();

  sendResponse(res, 200, true, "Order deleted successfully");
});
