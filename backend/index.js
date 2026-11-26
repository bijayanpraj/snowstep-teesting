import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import shoeRoute from "./routes/shoeRoute.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";

let app = express();
let port = process.env.PORT || 8000;
let connectionPromise;

if (process.env.FRONTEND_ORIGIN) {
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
} else {
  app.use(cors());
}
app.use(express.json());

let connectDb = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!connectionPromise) {
    let mongoUri =
      process.env.MONGODB_URI ||
      (process.env.NODE_ENV !== "production"
        ? "mongodb://127.0.0.1:27017/snowstep"
        : "");
    if (!mongoUri) {
      return Promise.reject(
        new Error("MONGODB_URI must be configured in production.")
      );
    }

    connectionPromise = mongoose.connect(mongoUri).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
};

app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    console.error(`Unable to connect to the database: ${error.message}`);
    res.status(503).json({
      success: false,
      message: "The database is currently unavailable.",
    });
  }
});

app.use("/shoe", shoeRoute);
app.use("/api/shoe", shoeRoute);
app.use("/api/shoes", shoeRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;
//