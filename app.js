import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import setupSocket from "./socket/index.js";
import messageRoutes from "./routes/messagesRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5052;
const dbUrl = process.env.MONGO_URL;

app.use(
  cors({
    // origin: ["http://localhost:3000", "http://localhost:3001"],
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(cookieParser())
app.use(express.json());

app.use('/api/auth' , authRoutes)
app.use('/api/messages' , messageRoutes)
app.use('/api/channels' , channelRoutes)

app.get("/", (req, res) => {
  res.send("Hello World");
});

const server = app.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});

setupSocket(server)

mongoose
  .connect(dbUrl)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log(err.message));
