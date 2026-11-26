import React, { createContext, useEffect, useState } from "react";

export let CartContext = createContext();
export let WishlistContext = createContext();
export let AuthContext = createContext();

let readSavedItems = (key) => {
  try {
    let items = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(items) ? items : [];
  } catch (error) {
    return [];
  }
};

let CartProvider = ({ children }) => {
  let [cart, setCart] = useState(() => readSavedItems("cart"));

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

let WishlistProvider = ({ children }) => {
  let [wishlist, setWishlist] = useState(() => readSavedItems("wishlist"));

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

let AuthProvider = ({ children }) => {
  let [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      return null;
    }
  });
  let [token, setToken] = useState(() => localStorage.getItem("authToken") || "");

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export { CartProvider, WishlistProvider, AuthProvider };
