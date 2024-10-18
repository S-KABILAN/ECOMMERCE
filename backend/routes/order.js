const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  orders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const router = express.Router();
const {
  isAuthendicatedUser,
  authorizeRoles,
} = require("../midddlewares/authenticate");

router.route("/order/new").post(isAuthendicatedUser, newOrder);
router.route("/order/:id").get(isAuthendicatedUser, getSingleOrder);
router.route("/myorders").get(isAuthendicatedUser, myOrders);

//Admin Routes
router.route("/orders").get(orders);
router
  .route("/order/:id")
  .put(isAuthendicatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthendicatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
