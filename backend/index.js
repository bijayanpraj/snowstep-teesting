import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import shoeRoute from "./routes/shoeRoute.js";
import newsletterRoute from "./routes/newsletterRoute.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";

let app = express();
let port = 8000;

app.use(cors()); // lets react (localhost:5173) talk to this server
app.use(express.json()); // without this req.body is undefined

app.use("/shoe", shoeRoute); // localhost:8000/shoe
app.use("/api/shoes", shoeRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

let connectDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/snowstep");
    console.log("database connected successfully.");
  } catch (error) {
    console.log(error.message);
  }
};

app.listen(port, () => {
  console.log(`app is listening at port ${port}`);
  connectDb();
});
//