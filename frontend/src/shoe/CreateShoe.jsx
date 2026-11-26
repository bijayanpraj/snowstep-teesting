import axios from "axios";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/StoreContext";

const CreateShoe = () => {
  let { user, token } = useContext(AuthContext);
  let canCreate = import.meta.env.DEV || user?.role === "admin";
  let [name, setName] = useState("");
  let [brand, setBrand] = useState("");
  let [category, setCategory] = useState("");
  let [price, setPrice] = useState("");
  let [quantity, setQuantity] = useState("");
  let [image, setImage] = useState("");
  let [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* 
    send data to backend through api 
    url : localhost:8000/shoe
    method : post 
    */

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
        url: "http://localhost:8000/shoe",
        method: "post",
        data: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setName("");
      setBrand("");
      setCategory("");
      setPrice("");
      setQuantity("");
      setImage("");
      setDescription("");

      toast.success("Shoe created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!canCreate) {
    return (
      <div className="page lightFormPage">
        <h2>Administrator access required</h2>
        <p>
          Log in to your store administrator account to add shoes.
        </p>
        <Link to="/login" className="btnPrimary adminLoginLink">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="page narrow lightFormPage">
      <h2>Add a new shoe</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label>Shoe name</label>
          <input
            type="text"
            onChange={(e) => {
              setName(e.target.value);
            }}
            value={name}
          ></input>
        </div>

        <div>
          <label>Brand</label>
          <input
            type="text"
            onChange={(e) => {
              setBrand(e.target.value);
            }}
            value={brand}
          ></input>
        </div>

        <div>
          <label>Category</label>
          <input
            type="text"
            placeholder="Running, Trail, Lifestyle"
            onChange={(e) => {
              setCategory(e.target.value);
            }}
            value={category}
          ></input>
        </div>

        <div>
          <label>Price (रु)</label>
          <input
            type="number"
            onChange={(e) => {
              setPrice(e.target.value);
            }}
            value={price}
          ></input>
        </div>

        <div>
          <label>Quantity</label>
          <input
            type="number"
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
            value={quantity}
          ></input>
        </div>

        <div>
          <label>Image link</label>
          <input
            type="text"
            placeholder="https://..."
            onChange={(e) => {
              setImage(e.target.value);
            }}
            value={image}
          ></input>
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
          Create shoe
        </button>
      </form>
    </div>
  );
};

export default CreateShoe;
