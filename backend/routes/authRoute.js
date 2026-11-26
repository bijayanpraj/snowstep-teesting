import { Router } from "express";
import User from "../schema/userSchema.js";
import {
  authMiddleware,
  createAuthToken,
  getAuthTokenSecret,
  getPublicUser,
  hashPassword,
  verifyPassword,
} from "../auth.js";

let authRoute = Router();

let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let passwordIsValid = (password) =>
  typeof password === "string" && password.length >= 8 && password.length <= 128;

authRoute.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

authRoute.post("/register", async (req, res) => {
  let name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  let email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  let password = req.body.password;
  let phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  let addressLine =
    typeof req.body.addressLine === "string" ? req.body.addressLine.trim() : "";
  let city = typeof req.body.city === "string" ? req.body.city.trim() : "";
  let district =
    typeof req.body.district === "string" ? req.body.district.trim() : "";

  if (!name || !emailPattern.test(email) || !passwordIsValid(password)) {
    return res.status(400).json({
      success: false,
      message: "Enter your name, a valid email, and a password of 8 to 128 characters.",
    });
  }

  let addressFields = [phone, addressLine, city, district];
  let hasAddress = addressFields.some(Boolean);
  if (hasAddress && addressFields.some((value) => !value)) {
    return res.status(400).json({
      success: false,
      message: "Enter your phone number, street address, city, and district.",
    });
  }

  try {
    getAuthTokenSecret();
    let passwordData = await hashPassword(password);
    let user = await User.create({
      name,
      email,
      role: "user",
      addresses: hasAddress
        ? [
            {
              fullName: name,
              phone,
              addressLine,
              city,
              district,
              isDefault: true,
            },
          ]
        : [],
      ...passwordData,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token: createAuthToken(user),
      result: getPublicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(error.code === "AUTH_SECRET_MISSING" ? 503 : 500).json({
      success: false,
      message: error.message,
    });
  }
});

authRoute.post("/login", async (req, res) => {
  let email =
    typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  let password = req.body.password;

  if (!emailPattern.test(email) || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email and password.",
    });
  }

  try {
    let user = await User.findOne({ email }).select(
      "+passwordHash +passwordSalt +tokenVersion"
    );

    if (
      !user ||
      !(await verifyPassword(password, user.passwordSalt, user.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
      });
    }

    getAuthTokenSecret();
    res.status(200).json({
      success: true,
      message: "Login successful.",
      token: createAuthToken(user),
      result: getPublicUser(user),
    });
  } catch (error) {
    res.status(error.code === "AUTH_SECRET_MISSING" ? 503 : 500).json({
      success: false,
      message: error.message,
    });
  }
});

authRoute.post("/logout", authMiddleware, async (req, res) => {
  try {
    req.user.tokenVersion += 1;
    await req.user.save();
    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default authRoute;
