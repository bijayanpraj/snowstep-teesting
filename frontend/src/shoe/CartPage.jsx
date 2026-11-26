import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/StoreContext";
import { fallbackImage } from "./fallback";
import { formatPrice } from "../currency";

let ukSizes = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13];
let colors = ["Black", "White", "Grey", "Navy", "Brown", "Red", "Blue", "Green", "Beige"];

const CartPage = () => {
  let { cart, setCart } = useContext(CartContext);
  let [checkoutStarted, setCheckoutStarted] = useState(false);
  let [checkoutMessage, setCheckoutMessage] = useState("");
  let subtotal = cart.reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  let updateItem = (id, changes) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id ? { ...item, ...changes } : item
      )
    );
    setCheckoutStarted(false);
    setCheckoutMessage("");
  };

  let removeItem = (id) => {
    setCart((currentCart) => currentCart.filter((item) => item._id !== id));
    setCheckoutStarted(false);
    setCheckoutMessage("");
  };

  let startCheckout = () => {
    let optionsSelected = cart.every((item) => item.size && item.color);
    if (!optionsSelected) {
      setCheckoutMessage("Choose a UK size and color for every item to continue.");
      return;
    }

    let itemCount = cart.reduce(
      (count, item) => count + (Number(item.quantity) || 1),
      0
    );
    setCheckoutStarted(true);
    setCheckoutMessage(
      `Checkout started for ${itemCount} item${itemCount === 1 ? "" : "s"}. Your cart has been cleared. This demo does not submit payment or place a confirmed order.`
    );
    setCart([]);
  };

  if (checkoutStarted) {
    return (
      <main className="page cartPage">
        <div className="cartEmpty" role="status">
          <h2>Checkout in progress</h2>
          <p>{checkoutMessage}</p>
          <Link to="/shoe" className="btnPrimary">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  if (!cart.length) {
    return (
      <main className="page cartPage">
        <div className="pageHead">
          <h2>Your bag</h2>
        </div>
        <div className="cartEmpty">
          <p>Your bag is empty.</p>
          <Link to="/shoe" className="btnPrimary">
            Browse shoes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page cartPage">
      <div className="pageHead">
        <h2>Your bag</h2>
        <p>{cart.reduce((count, item) => count + (Number(item.quantity) || 1), 0)} items</p>
      </div>
      <div className="cartLayout">
        <div className="cartItems">
          {cart.map((item) => {
            let quantity = Number(item.quantity) || 1;
            let stock = Number(item.stockQuantity) || Number(item.quantity) || 1;

            return (
              <article className="cartItem" key={item._id}>
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="cartItemInfo">
                  <p className="brand">{item.brand}</p>
                  <h3>{item.name}</h3>
                  <p className="cartItemPrice">{formatPrice(item.price)}</p>
                  <div className="cartOptions">
                    <label>
                      UK size
                      <select
                        value={item.size || ""}
                        onChange={(event) =>
                          updateItem(item._id, { size: event.target.value })
                        }
                      >
                        <option value="">Choose size</option>
                        {ukSizes.map((size) => (
                          <option key={size} value={size}>
                            UK {size}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Color
                      <select
                        value={item.color || ""}
                        onChange={(event) =>
                          updateItem(item._id, { color: event.target.value })
                        }
                      >
                        <option value="">Choose color</option>
                        {colors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Quantity
                      <input
                        type="number"
                        min="1"
                        max={stock}
                        value={quantity}
                        onChange={(event) => {
                          let nextQuantity = Number(event.target.value);
                          if (Number.isFinite(nextQuantity)) {
                            updateItem(item._id, {
                              quantity: Math.max(1, Math.min(stock, nextQuantity)),
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="cartRemoveButton"
                    onClick={() => removeItem(item._id)}
                  >
                    Remove
                  </button>
                </div>
                <strong className="cartLineTotal">
                  {formatPrice(Number(item.price) * quantity)}
                </strong>
              </article>
            );
          })}
        </div>
        <aside className="cartSummary">
          <h3>Order summary</h3>
          <div className="cartSummaryItems">
            {cart.map((item) => {
              let quantity = Number(item.quantity) || 1;
              return (
                <div className="cartSummaryItem" key={item._id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      Qty {quantity} - {formatPrice(Number(item.price) * quantity)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cartSummaryRemove"
                    onClick={() => removeItem(item._id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <div>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <p>Shipping and any applicable taxes are not included in this subtotal.</p>
          <button
            type="button"
            className="btnPrimary cartCheckoutButton"
            onClick={startCheckout}
            disabled={checkoutStarted}
          >
            {checkoutStarted ? "Order in progress" : "Proceed to checkout"}
          </button>
          {checkoutMessage && (
            <p className="cartCheckoutMessage" role="status">
              {checkoutMessage}
            </p>
          )}
          <Link to="/shoe" className="btnPrimary cartContinueButton">
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
};

export default CartPage;
