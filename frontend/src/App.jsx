import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ReadAllShoe from "./shoe/ReadAllShoe";
import ReadSingleShoe from "./shoe/ReadSingleShoe";
import CartPage from "./shoe/CartPage";
import CreateShoe from "./shoe/CreateShoe";
import UpdateShoe from "./shoe/UpdateShoe";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import {
  AuthProvider,
  CartProvider,
  WishlistProvider,
} from "./context/StoreContext";

const App = () => {
  return (
    <CartProvider>
      <WishlistProvider>
        <AuthProvider>
          <div>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/shoe" element={<ReadAllShoe />}></Route>
              <Route path="/cart" element={<CartPage />}></Route>
              <Route path="/shoe/create" element={<CreateShoe />}></Route>
              <Route path="/shoe/update/:id" element={<UpdateShoe />}></Route>
              <Route path="/shoe/:id" element={<ReadSingleShoe />}></Route>
              <Route path="/login" element={<LoginPage />}></Route>
              <Route path="/register" element={<RegisterPage />}></Route>
            </Routes>
            <footer className="footer">
              <p>Snowstep. Premium shoes, kept simple.</p>
            </footer>
          </div>
        </AuthProvider>
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;
