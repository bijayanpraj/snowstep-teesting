import React, { useEffect } from "react";
import { Link } from "react-router-dom";

let drawerLinks = [
  ["Home", "/"],
  ["Men", "/shoe"],
  ["Women", "/shoe"],
  ["Kids", "/shoe"],
];

const MobileDrawer = ({
  isOpen,
  onClose,
  cartCount = 0,
  wishlistCount = 0,
  user,
  onLogout,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let closeOnEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  let linkTabIndex = isOpen ? 0 : -1;
  let defaultAddress =
    user?.addresses?.find((address) => address.isDefault) ||
    user?.addresses?.[0];

  return (
    <div className={`mobileDrawerLayer ${isOpen ? "open" : ""}`}>
      <button
        className="mobileDrawerOverlay"
        type="button"
        aria-label="Close navigation menu"
        tabIndex={linkTabIndex}
        onClick={onClose}
      />
      <nav
        className="mobileDrawer"
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="mobileDrawerHead">
          <span className="logo">Snowstep</span>
          <button
            type="button"
            className="mobileDrawerClose"
            aria-label="Close navigation menu"
            tabIndex={linkTabIndex}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="mobileDrawerLinks">
          {drawerLinks.map(([label, path]) => (
            <Link
              to={path}
              key={label}
              tabIndex={linkTabIndex}
              onClick={onClose}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="mobileDrawerActions">
          <Link to="/shoe" tabIndex={linkTabIndex} onClick={onClose}>
            ♡ Wishlist <span>{wishlistCount}</span>
          </Link>
          <Link to="/cart" tabIndex={linkTabIndex} onClick={onClose}>
            🛒 Cart <span>{cartCount}</span>
          </Link>
          {user ? (
            <div className="mobileProfileCard">
              <p className="profileMenuEyebrow">YOUR ACCOUNT</p>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              {defaultAddress?.phone && <span>{defaultAddress.phone}</span>}
              {defaultAddress && (
                <span>
                  {defaultAddress.addressLine}
                  {defaultAddress.city && `, ${defaultAddress.city}`}
                  {defaultAddress.district && `, ${defaultAddress.district}`}
                </span>
              )}
              {(import.meta.env.DEV || user.role === "admin") && (
                <Link
                  to="/shoe/create"
                  tabIndex={linkTabIndex}
                  onClick={onClose}
                >
                  Add new shoes
                </Link>
              )}
              <button
                type="button"
                className="mobileLogoutButton"
                tabIndex={linkTabIndex}
                onClick={onLogout}
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              {import.meta.env.DEV && (
                <Link
                  to="/shoe/create"
                  tabIndex={linkTabIndex}
                  onClick={onClose}
                >
                  Add new shoes
                </Link>
              )}
              <Link to="/login" tabIndex={linkTabIndex} onClick={onClose}>
                Log in
              </Link>
              <Link to="/register" tabIndex={linkTabIndex} onClick={onClose}>
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default MobileDrawer;
