import { model, Schema } from "mongoose";

let newsletterSchema = Schema({
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

let Newsletter = model("Newsletter", newsletterSchema);
export default Newsletter;
