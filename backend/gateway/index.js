import express from "express";
import dotenv from "dotenv";
dotenv.config();
import proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import protect from "./middleware/auth.middleware.js";
import getCurrentUser from "./controllers/user.controller.js";
import proxyWithHeader from "./utils/proxyWithHeader.js";
import morgan from "morgan";

const port = process.env.PORT;
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(morgan("dev"));

app.use(cookieParser());

app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));

app.get("/api/me", protect, getCurrentUser);
app.use("/api/agent", protect, proxy(process.env.AGENT_SERVICE_URL));

// Protected microservices routes
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE_URL));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from api Gateway" });
});
app.listen(port, () => {
  console.log(`Api Gateway Started at ${port}`);
});
