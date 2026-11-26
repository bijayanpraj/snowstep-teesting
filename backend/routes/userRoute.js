import { Router } from "express";
import mongoose from "mongoose";
import Shoe from "../schema/shoeSchema.js";
import User from "../schema/userSchema.js";
import {
  authMiddleware,
  createAuthToken,
  getPublicUser,
  hashPassword,
  verifyPassword,
} from "../auth.js";

let userRoute = Router();

userRoute.use(authMiddleware);
userRoute.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

userRoute
  .route("/profile")
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: "Profile read successfully.",
      result: getPublicUser(req.user),
    });
  })
  .patch(async (req, res) => {
    let hasName = typeof req.body.name === "string";
    let hasEmail = typeof req.body.email === "string";

    if (!hasName && !hasEmail) {
      return res.status(400).json({
        success: false,
        message: "Provide a name or email to update.",
      });
    }

    if (hasName) {
      req.user.name = req.body.name.trim();
    }
    if (hasEmail) {
      req.user.email = req.body.email.trim().toLowerCase();
    }

    try {
      await req.user.save();
      res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        result: getPublicUser(req.user),
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      res.status(error.name === "ValidationError" ? 400 : 500).json({
        success: false,
        message: error.message,
      });
    }
  });

userRoute
  .route("/addresses")
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: "Addresses read successfully.",
      result: req.user.addresses,
    });
  })
  .post(async (req, res) => {
    if (
      req.body.isDefault !== undefined &&
      typeof req.body.isDefault !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isDefault must be a boolean.",
      });
    }

    let address = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      addressLine: req.body.addressLine,
      city: req.body.city,
      district: req.body.district,
      postalCode: req.body.postalCode || "",
      isDefault: req.body.isDefault === true || req.user.addresses.length === 0,
    };

    if (address.isDefault) {
      req.user.addresses.forEach((value) => {
        value.isDefault = false;
      });
    }

    req.user.addresses.push(address);

    try {
      await req.user.save();
      res.status(201).json({
        success: true,
        message: "Address added successfully.",
        result: req.user.addresses[req.user.addresses.length - 1],
      });
    } catch (error) {
      res.status(error.name === "ValidationError" ? 400 : 500).json({
        success: false,
        message: error.message,
      });
    }
  });

userRoute
  .route("/addresses/:addressId")
  .patch(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.addressId)) {
      return res.status(400).json({
        success: false,
        message: "Address ID is invalid.",
      });
    }

    let address = req.user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    let editableFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "district",
      "postalCode",
      "isDefault",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    if (address.isDefault) {
      req.user.addresses.forEach((value) => {
        if (String(value._id) !== req.params.addressId) {
          value.isDefault = false;
        }
      });
    }

    try {
      await req.user.save();
      res.status(200).json({
        success: true,
        message: "Address updated successfully.",
        result: address,
      });
    } catch (error) {
      res.status(error.name === "ValidationError" ? 400 : 500).json({
        success: false,
        message: error.message,
      });
    }
  })
  .delete(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.addressId)) {
      return res.status(400).json({
        success: false,
        message: "Address ID is invalid.",
      });
    }

    let address = req.user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    address.deleteOne();

    try {
      await req.user.save();
      res.status(200).json({
        success: true,
        message: "Address deleted successfully.",
        result: req.user.addresses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

userRoute.patch("/password", async (req, res) => {
  let { currentPassword, newPassword } = req.body;

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    newPassword.length < 8 ||
    newPassword.length > 128
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter your current password and a new password of 8 to 128 characters.",
    });
  }

  try {
    let user = await User.findById(req.user._id)
      .select("+passwordHash +passwordSalt +tokenVersion");

    if (
      !user ||
      !(await verifyPassword(currentPassword, user.passwordSalt, user.passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    let passwordData = await hashPassword(newPassword);
    user.passwordHash = passwordData.passwordHash;
    user.passwordSalt = passwordData.passwordSalt;
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
      token: createAuthToken(user),
    });
  } catch (error) {
    res.status(error.code === "AUTH_SECRET_MISSING" ? 503 : 500).json({
      success: false,
      message: error.message,
    });
  }
});

userRoute
  .route("/wishlist")
  .get(async (req, res) => {
    try {
      let user = await req.user.populate("wishlist", "name brand category image price rating reviewCount");
      res.status(200).json({
        success: true,
        message: "Wishlist read successfully.",
        result: user.wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  })
  .put(async (req, res) => {
    let shoeIds = req.body.shoeIds;
    if (
      !Array.isArray(shoeIds) ||
      shoeIds.length > 200 ||
      shoeIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid list of shoe IDs.",
      });
    }

    let uniqueIds = [...new Set(shoeIds.map(String))];

    try {
      let shoes = await Shoe.find({ _id: { $in: uniqueIds } }).select("_id");
      if (shoes.length !== uniqueIds.length) {
        return res.status(404).json({
          success: false,
          message: "One or more shoes could not be found.",
        });
      }

      req.user.wishlist = uniqueIds;
      await req.user.save();
      let user = await req.user.populate("wishlist", "name brand category image price rating reviewCount");
      res.status(200).json({
        success: true,
        message: "Wishlist updated successfully.",
        result: user.wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

userRoute
  .route("/wishlist/:shoeId")
  .post(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.shoeId)) {
      return res.status(400).json({
        success: false,
        message: "Shoe ID is invalid.",
      });
    }

    try {
      let shoe = await Shoe.findById(req.params.shoeId).select("_id");
      if (!shoe) {
        return res.status(404).json({
          success: false,
          message: "Shoe not found.",
        });
      }

      if (!req.user.wishlist.some((id) => String(id) === req.params.shoeId)) {
        req.user.wishlist.push(shoe._id);
        await req.user.save();
      }

      res.status(200).json({
        success: true,
        message: "Shoe added to wishlist.",
        result: req.user.wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  })
  .delete(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.shoeId)) {
      return res.status(400).json({
        success: false,
        message: "Shoe ID is invalid.",
      });
    }

    req.user.wishlist = req.user.wishlist.filter(
      (id) => String(id) !== req.params.shoeId
    );

    try {
      await req.user.save();
      res.status(200).json({
        success: true,
        message: "Shoe removed from wishlist.",
        result: req.user.wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

export default userRoute;
