import React, { useContext } from "react";
import { toast } from "react-toastify";
import { CartContext, WishlistContext } from "../context/StoreContext";

let getShoeId = (shoe) =>
  String(
    shoe._id ||
      `${shoe.brand || "shoe"}-${shoe.name || "product"}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
  );

const ProductCardActions = ({ shoe }) => {
  let { cart, setCart } = useContext(CartContext);
  let { wishlist, setWishlist } = useContext(WishlistContext);
  let shoeId = getShoeId(shoe);
  let isWishlisted = wishlist.some((item) =>
    typeof item === "string" ? item === shoeId : item?._id === shoeId
  );
  let stock = Number(shoe.quantity) || 0;

  let addToCart = () => {
    if (stock <= 0) {
      toast.error("This shoe is sold out.");
      return;
    }

    let existingItem = cart.find((item) => item._id === shoeId);
    if (existingItem && (Number(existingItem.quantity) || 1) >= stock) {
      toast.error("You have added all available pairs to your bag.");
      return;
    }

    setCart((currentCart) => {
      let existingIndex = currentCart.findIndex((item) => item._id === shoeId);
      if (existingIndex < 0) {
        return [
          ...currentCart,
          {
            ...shoe,
            _id: shoeId,
            stockQuantity: stock,
            quantity: 1,
            size: "",
            color: "",
          },
        ];
      }

      return currentCart.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              stockQuantity: stock,
              quantity: (Number(item.quantity) || 1) + 1,
            }
          : item
      );
    });
    toast.success(`${shoe.name} added to your bag.`);
  };

  let toggleWishlist = () => {
    if (isWishlisted) {
      setWishlist((currentWishlist) =>
        currentWishlist.filter(
          (item) =>
            (typeof item === "string" ? item : item?._id) !== shoeId
        )
      );
      toast.info(`${shoe.name} removed from your wishlist.`);
      return;
    }

    setWishlist((currentWishlist) => [
      ...currentWishlist,
      { ...shoe, _id: shoeId },
    ]);
    toast.success(`${shoe.name} added to your wishlist.`);
  };

  return (
    <div className="productCardActions">
      <button
        type="button"
        className="btnPrimary small productAddButton"
        onClick={addToCart}
        disabled={stock <= 0}
      >
        {stock > 0 ? "Add to bag" : "Sold out"}
      </button>
      <button
        type="button"
        className={`productWishlistButton${isWishlisted ? " active" : ""}`}
        onClick={toggleWishlist}
        aria-label={
          isWishlisted
            ? `Remove ${shoe.name} from wishlist`
            : `Add ${shoe.name} to wishlist`
        }
        aria-pressed={isWishlisted}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isWishlisted ? "♥" : "♡"}
      </button>
    </div>
  );
};

export default ProductCardActions;
