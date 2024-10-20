import express from "express";
import errorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

import products from "./routes/product.js";
import auth from "./routes/auth.js";
import order from "./routes/order.js";

app.use("/api/v1/", products);
app.use("/api/v1/", auth);
app.use("/api/v1/", order);

app.use(errorMiddleware);

export default app;
