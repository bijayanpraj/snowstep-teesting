import axios from "axios";
import React, { useState, useEffect } from "react";
import { apiUrl } from "../api";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/StoreContext";
import { formatPrice } from "../currency";

const UpdateShoe = () => {
  let { user, token } = useContext(AuthContext);
  let canEdit = import.meta.env.DEV || user?.role === "admin";
  let params = useParams();
  let id = params.id;
  let navigate = useNavigate();

  let [name, setName] = useState("");
  let [brand, setBrand] = useState("");
  let [category, setCategory] = useState("");
  let [price, setPrice] = useState("");
  let [quantity, setQuantity] = useState("");
  let [image, setImage] = useState("");
  let [description, setDescription] = useState("");

  let getData = async () => {
    try {
      let result = await axios({
        url: apiUrl(`/shoe/${id}`),
        method: "get",
      });

      let data = result.data.result;
      setName(data.name);
      setBrand(data.brand);
      setCategory(data.category);
      setPrice(data.price);
      setQuantity(data.quantity);
      setImage(data.image);
      setDescription(data.description || "");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (canEdit) {
      getData();
    }
  }, [id, canEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let data = {
      name: name,
      brand: brand,
      category: category,
      price: price,
      quantity: quantity,
      image: image,
      description: description,
    };

    try {
      let result = await axios({
        url: apiUrl(`/shoe/${id}`),
        method: "patch",
        data: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Shoe updated successfully");
      navigate("/shoe");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!canEdit) {
    return (
      <div className="page">
        <h2>Administrator access required</h2>
        <p>Only the store administrator can edit shoes.</p>
        <Link to="/login" className="btnPrimary adminLoginLink">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <h2>Edit shoe</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label>Shoe name</label>
          <input
            type="text"
            onChange={(e) => {
              setName(e.target.value);
            }}
            value={name}
          />
        </div>

        <div>
          <label>Brand</label>
          <input
            type="text"
            onChange={(e) => {
              setBrand(e.target.value);
            }}
            value={brand}
          />
        </div>

        <div>
          <label>Category</label>
          <input
            type="text"
            onChange={(e) => {
              setCategory(e.target.value);
            }}
            value={category}
          />
        </div>

        <div>
          <label>Price (रु)</label>
          <input
            type="number"
            onChange={(e) => {
              setPrice(e.target.value);
            }}
            value={price}
          />
        </div>

        <div>
          <label>Quantity</label>
          <input
            type="number"
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
            value={quantity}
          />
        </div>

        <div>
          <label>Image link</label>
          <input
            type="text"
            onChange={(e) => {
              setImage(e.target.value);
            }}
            value={image}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            value={description}
          ></textarea>
        </div>

        <button className="btnPrimary" type="submit">
          Save changes
        </button>
      </form>
    </div>
  );
};

export default UpdateShoe;
