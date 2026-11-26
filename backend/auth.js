import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import User from "./schema/userSchema.js";

let scrypt = promisify(scryptCallback);
let developmentSecret = "";

if (process.env.NODE_ENV !== "production") {
  let configuredSecret = process.env.AUTH_TOKEN_SECRET;
  if (!configuredSecret || configuredSecret.length < 32) {
    developmentSecret = randomBytes(32).toString("hex");
    console.warn(
      "AUTH_TOKEN_SECRET is not configured with 32 characters; using a temporary development-only secret."
    );
  }
}

export let getAuthTokenSecret = () => {
  let secret = process.env.AUTH_TOKEN_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production" && developmentSecret) {
    return developmentSecret;
  }

  let error = new Error("AUTH_TOKEN_SECRET must be set to at least 32 characters.");
  error.code = "AUTH_SECRET_MISSING";
  throw error;
};

export let hashPassword = async (password) => {
  let salt = randomBytes(16).toString("hex");
  let hash = await scrypt(password, salt, 64);

  return {
    passwordSalt: salt,
    passwordHash: hash.toString("hex"),
  };
};

export let verifyPassword = async (password, salt, storedHash) => {
  let hash = await scrypt(password, salt, 64);
  let expectedHash = Buffer.from(storedHash, "hex");

  return (
    hash.length === expectedHash.length &&
    timingSafeEqual(hash, expectedHash)
  );
};

let signToken = (payload) =>
  createHmac("sha256", getAuthTokenSecret())
    .update(payload)
    .digest("base64url");

export let createAuthToken = (user) => {
  let payload = Buffer.from(
    JSON.stringify({
      userId: String(user._id),
      tokenVersion: user.tokenVersion,
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    })
  ).toString("base64url");

  return `${payload}.${signToken(payload)}`;
};

export let verifyAuthToken = (token) => {
  let parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  let expectedSignature = Buffer.from(signToken(parts[0]), "base64url");
  let suppliedSignature;
  try {
    suppliedSignature = Buffer.from(parts[1], "base64url");
  } catch (error) {
    return null;
  }

  if (
    expectedSignature.length !== suppliedSignature.length ||
    !timingSafeEqual(expectedSignature, suppliedSignature)
  ) {
    return null;
  }

  try {
    let payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (
      typeof payload.userId !== "string" ||
      !Number.isInteger(payload.tokenVersion) ||
      !Number.isInteger(payload.expiresAt) ||
      payload.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
};

export let authMiddleware = async (req, res, next) => {
  let authorization = req.headers.authorization || "";
  let match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({
      success: false,
      message: "A valid bearer token is required.",
    });
  }

  try {
    let payload = verifyAuthToken(match[1]);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "The authentication token is invalid or expired.",
      });
    }

    let user = await User.findById(payload.userId).select("+tokenVersion");
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: "The authentication token is invalid or expired.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(error.code === "AUTH_SECRET_MISSING" ? 503 : 500).json({
      success: false,
      message:
        error.code === "AUTH_SECRET_MISSING"
          ? error.message
          : "Unable to verify the authentication token.",
    });
  }
};

export let adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only the store administrator can change shoes.",
    });
  }

  next();
};

export let shoeManagementMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  return authMiddleware(req, res, () =>
    adminMiddleware(req, res, next)
  );
};

export let getPublicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  addresses: user.addresses,
  wishlist: user.wishlist,
  orderHistory: user.orderHistory,
  createdAt: user.createdAt,
});
