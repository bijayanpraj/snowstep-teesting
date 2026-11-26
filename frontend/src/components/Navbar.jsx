import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../api";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AuthContext,
  CartContext,
  WishlistContext,
} from "../context/StoreContext";
import MegaMenu from "./nav/MegaMenu";
import MobileDrawer from "./nav/MobileDrawer";  
import SearchBarWithSuggestions from "./nav/SearchBarWithSuggestions";

const Navbar = () => {
  let { cart, setCart } = useContext(CartContext);
  let { wishlist, setWishlist } = useContext(WishlistContext);
  let { user, setUser, token, setToken } = useContext(AuthContext);
  let navigate = useNavigate();
  let [products, setProducts] = useState([]);
  let [productsLoading, setProductsLoading] = useState(true);
  let [openMenu, setOpenMenu] = useState("");
  let [drawerOpen, setDrawerOpen] = useState(false);
  let [profileOpen, setProfileOpen] = useState(false);
  let cartCount = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );
  let wishlistCount = wishlist.length;
  let defaultAddress =
    user?.addresses?.find((address) => address.isDefault) ||
    user?.addresses?.[0];

  let handleLogout = async () => {
    try {
      await axios({
        url: apiUrl("/api/auth/logout"),
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("You have been logged out.");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.info("Your session was already expired. You have been logged out.");
      } else {
        toast.error(
          `Signed out on this device, but server logout failed: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setUser(null);
      setToken("");
      setCart([]);
      setWishlist([]);
      setProfileOpen(false);
      setDrawerOpen(false);
      navigate("/");
    }
  };

  useEffect(() => {
    let active = true;

    let getProducts = async () => {
      try {
        let result = await axios({
          url: apiUrl("/api/shoes"),
          method: "get",
        });

        if (active && Array.isArray(result.data.result)) {
          setProducts(result.data.result);
        }
      } catch (error) {
        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setProductsLoading(false);
        }
      }
    };

    getProducts();
    return () => {
      active = false;
    };
  }, []);

  let navItems = [
    { label: "Home", to: "/", isLink: true },
    { label: "Men", menu: true },
    { label: "Women", menu: true },
    { label: "Kids", menu: true },
  ];

  return (
    <header
      className="navbarShell"
      onMouseLeave={() => setOpenMenu("")}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpenMenu("");
          setDrawerOpen(false);
          setProfileOpen(false);
        }
      }}
    >
      <div className="navbar">
        <button
          type="button"
          className="mobileMenuButton"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation"
          onClick={() => setDrawerOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>
        <Link to="/" className="logo" onClick={() => setOpenMenu("")}>
          Snowstep
        </Link>
        <nav className="desktopNavLinks" aria-label="Main navigation">
          {navItems.map((item) =>
            item.isLink ? (
              <NavLink
                to={item.to}
                end={item.to === "/"}
                key={item.label}
                onClick={() => setOpenMenu("")}
              >
                {item.label}
              </NavLink>
            ) : (
              <button
                type="button"
                className={`navMenuButton ${openMenu === item.label ? "active" : ""}`}
                key={item.label}
                aria-controls="desktop-mega-menu"
                aria-expanded={openMenu === item.label}
                aria-haspopup="true"
                onMouseEnter={() => setOpenMenu(item.label)}
                onFocus={() => setOpenMenu(item.label)}
                onClick={() =>
                  setOpenMenu((current) =>
                    current === item.label ? "" : item.label
                  )
                }
              >
                {item.label}
              </button>
            )
          )}
        </nav>
        <SearchBarWithSuggestions
          products={products}
          loading={productsLoading}
        />
        <div className="navActions">
          {import.meta.env.DEV && (
            <Link to="/shoe/create" className="navLoginButton">
              Add shoes
            </Link>
          )}
          <Link
            to="/shoe"
            className="navActionLink"
            aria-label={`Wishlist, ${wishlistCount} items`}
            title="Wishlist"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </svg>
            {wishlistCount > 0 && <span className="navCount">{wishlistCount}</span>}
          </Link>
          {!user && (
            <>
              <Link to="/login" className="navLoginButton">
                Log in
              </Link>
              <Link to="/register" className="navRegisterButton">
                Create account
              </Link>
            </>
          )}
          {user && (
            <div
              className="navProfile"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setProfileOpen(false);
                }
              }}
            >
              <button
                type="button"
                className="navActionLink navActionAccount navProfileButton"
                aria-label={`Profile for ${user.name || user.email}`}
                aria-expanded={profileOpen}
                aria-controls="nav-profile-menu"
                title="Your profile"
                onClick={() => setProfileOpen((isOpen) => !isOpen)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </button>
              {profileOpen && (
                <div
                  className="navProfileMenu"
                  id="nav-profile-menu"
                  aria-label="Your profile details"
                >
                  <p className="profileMenuEyebrow">YOUR ACCOUNT</p>
                  <h2>{user.name}</h2>
                  <p className="profileMenuDetail">{user.email}</p>
                  {defaultAddress && (
                    <>
                      {defaultAddress.phone && (
                        <p className="profileMenuDetail">{defaultAddress.phone}</p>
                      )}
                      <address className="profileMenuAddress">
                        {defaultAddress.addressLine}
                        {defaultAddress.city && `, ${defaultAddress.city}`}
                        {defaultAddress.district && `, ${defaultAddress.district}`}
                      </address>
                    </>
                  )}
                  {!import.meta.env.DEV && user.role === "admin" && (
                    <Link
                      to="/shoe/create"
                      className="btnPrimary profileAddShoe"
                      onClick={() => setProfileOpen(false)}
                    >
                      Add new shoes
                    </Link>
                  )}
                  <button
                    type="button"
                    className="profileLogoutButton"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
          <Link
            to="/cart"
            className="navActionLink"
            aria-label={`Shopping cart, ${cartCount} items`}
            title="Shopping cart"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L22 8H6" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="18" cy="21" r="1" />
            </svg>
            <span className="navCount" aria-live="polite">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
      {openMenu && (
        <MegaMenu
          id="desktop-mega-menu"
          type={openMenu}
          products={products}
          onClose={() => setOpenMenu("")}
        />
      )}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Navbar;
//