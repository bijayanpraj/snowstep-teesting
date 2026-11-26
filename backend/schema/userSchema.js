import { model, Schema } from "mongoose";

let addressSchema = Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
    },
    addressLine: {
      type: String,
      required: [true, "Address is required."],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required."],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required."],
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

let userSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    passwordSalt: {
      type: String,
      required: true,
      select: false,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Shoe",
      },
    ],
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true }
);

let User = model("User", userSchema);
export default User;
