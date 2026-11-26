import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fallbackImage } from "./fallback";
import { useContext } from "react";
import { CartContext } from "../context/StoreContext";
import { formatPrice } from "../currency";

const ReadSingleShoe = () => {
  let { cart, setCart } = useContext(CartContext);
  let params = useParams();
  let id = params.id;
  let navigate = useNavigate();

  let [shoe, setShoe] = useState(null);

  let addToCart = () => {
    if (!shoe || !(Number(shoe.quantity) > 0)) {
      toast.error("This shoe is sold out.");
      return;
    }

    let existingItem = cart.find((item) => item._id === shoe._id);
    if (existingItem && (Number(existingItem.quantity) || 1) >= shoe.quantity) {
      toast.error("You have added all available pairs to your bag.");
      return;
    }

    setCart((currentCart) => {
      let existingIndex = currentCart.findIndex((item) => item._id === shoe._id);
      if (existingIndex < 0) {
        return [
          ...currentCart,
          {
            ...shoe,
            stockQuantity: shoe.quantity,
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
              stockQuantity: shoe.quantity,
              size: item.size || "",
              color: item.color || "",
              quantity: (Number(item.quantity) || 1) + 1,
            }
          : item
      );
    });
    toast.success(`${shoe.name} added to your bag`);
  };

  let getData = async () => {
    try {
      let result = await axios({
        url: `http://localhost:8000/shoe/${id}`,
        method: "get",
      });

      setShoe(result.data.result);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  if (!shoe) return <p className="empty">Loading...</p>;
  let soldOut = !(Number(shoe.quantity) > 0);

  return (
    <div className="page single">
      <img
        src={shoe.image}
        alt={shoe.name}
        onError={(e) => {
          e.target.src = fallbackImage;
        }}
      />

      <div className="singleInfo">
        <p className="brand">{shoe.brand}</p>
        {soldOut && <span className="soldOutBadge">Sold out</span>}
        <h2>{shoe.name}</h2>
        <p className="price big">{formatPrice(shoe.price)}</p>
        <p>{shoe.description}</p>
        <p className="meta">Category: {shoe.category}</p>
        {!soldOut && (
          <p className="meta">{shoe.quantity} pairs in stock</p>
        )}

        <div className="btnRow">
          <button
            className="btnPrimary"
            disabled={soldOut}
            onClick={addToCart}
          >
            {soldOut ? "Sold out" : "Add to bag"}
          </button>
          <button
            className="btnGhost"
            onClick={() => {
              navigate(`/shoe/update/${shoe._id}`);
            }}
          >
            Edit
          </button>
          <button
            className="btnGhost"
            onClick={() => {
              navigate("/shoe");
            }}
          >
            Back to all shoes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadSingleShoe;
