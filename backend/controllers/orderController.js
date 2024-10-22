import { StatusCodes } from "http-status-codes";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Order from "../models/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendResponse } from "../utils/responseHandler.js";
import moment from "moment";
import { factoryService } from "../services/factoryService.js";


// Create New Order - api/v1/order/new
export const newOrder = async (req, res, next) => {
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

  const order = await factoryService.create(Order, {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: moment().toDate(),
    user: req.user.id,
  });

  sendResponse(res,StatusCodes.OK,true,"New order created successfully",order);
};

// Get Single Order - api/v1/order/:id
export const getSingleOrder = async (req, res, next) => {
  const order = await factoryService.findById(Order,req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, StatusCodes.NOT_FOUND)
    );
  }

  sendResponse(res, StatusCodes.OK, true, "Order fetched successfully", order);

};


// Get Logged-in User Orders - api/v1/myorders
export const myOrders = async (req, res) => {
  const orders = await factoryService.find(Order,req.params.id)

  sendResponse(res, StatusCodes.OK, true, "Orders fetched successfully", orders);
};


// Admin: Get all orders - /api/v1/orders
export const orders = async (req, res) => {
  const orders = await factoryService.find(Order);

  const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);

  sendResponse(res, StatusCodes.OK, true, "Orders fetched successfully", {
    totalAmount,
    orders,
  });
};


// Admin: Update Order - /api/v1/order/:id
export const updateOrder = async (req, res, next) => {
  const order = await factoryService.findById(Order,req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, StatusCodes.NOT_FOUND)
    );
  }

  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler("This order has already been delivered.", StatusCodes.BAD_REQUEST)
    );
  }

  await Promise.all(
    order.orderItems.map((orderItem) =>
      updateStock(orderItem.product, orderItem.quantity)
    )
  );

  order.orderStatus = req.body.orderStatus;
  order.deliveredAt = moment().toDate();

  await order.save();

  sendResponse(res, StatusCodes.OK, true, "Order updated successfully");
};


// Stock Update Function
const updateStock = async (productId, quantity) => {
  const product = await factoryService.findById(Order,productId);

  if (!product) {
    throw new ErrorHandler(
      `Product not found with id: ${productId}`,
      StatusCodes.NOT_FOUND
    );
  }

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
};


// Admin: Delete Order - api/v1/order/:id
export const deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await factoryService.findById(Order,req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(`Order not found with this id: ${req.params.id}`, StatusCodes.NOT_FOUND)
    );
  }

  await factoryService.deleteById(Order,req.params.id);

  sendResponse(res, StatusCodes.OK, true, "Order deleted successfully");
});
