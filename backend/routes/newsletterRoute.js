import { Router } from "express";
import Newsletter from "../schema/newsletterSchema.js";

let newsletterRoute = Router();

newsletterRoute.post("/", async (req, res) => {
  let email = typeof req.body.email === "string" ? req.body.email.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
  }

  try {
    let result = await Newsletter.create({ email });
    res.status(201).json({
      success: true,
      message: "Thanks for subscribing!",
      result: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default newsletterRoute;
