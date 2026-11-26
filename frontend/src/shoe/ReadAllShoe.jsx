import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fallbackImage } from "./fallback";
import { useContext } from "react";
import { AuthContext } from "../context/StoreContext";
import ProductCardActions from "./ProductCardActions";
import { formatPrice } from "../currency";

const ReadAllShoe = () => {
  let [shoes, setShoes] = useState([]);
  let [search, setSearch] = useState("");
  let navigate = useNavigate();
  let { user, token } = useContext(AuthContext);
  let isAdmin = user && user.role === "admin";

  let getData = async () => {
    try {
      let result = await axios({
        url: "http://localhost:8000/shoe",
        method: "get",
      });

      setShoes(result.data.result);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  let handleDelete = async (id) => {
    try {
      let result = await axios({
        url: `http://localhost:8000/shoe/${id}`,
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Shoe deleted successfully");
      getData(); // refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // search by name or brand
  let filteredShoes = shoes.filter((value) => {
    let text = (value.name + " " + value.brand).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <div className="pageHead">
        <h2>All shoes</h2>
        <input
          className="searchBox"
          type="text"
          placeholder="Search by name or brand"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          value={search}
        />
      </div>

      {filteredShoes.length === 0 ? (
        <p className="empty">No shoes found. Try another search or add a new pair.</p>
      ) : (
        <div className="grid">
          {filteredShoes.map((value, i) => {
            let soldOut = !(Number(value.quantity) > 0);
            return (
              <div key={i} className="card">
                <img
                  src={value.image}
                  alt={value.name}
                  onError={(e) => {
                    e.target.src = fallbackImage;
                  }}
                  onClick={() => {
                    navigate(`/shoe/${value._id}`);
                  }}
                />
                <div className="cardBody">
                  <p className="brand">{value.brand}</p>
                  {soldOut && <span className="soldOutBadge">Sold out</span>}
                  <h3>{value.name}</h3>
                  <p className="price">{formatPrice(value.price)}</p>

                  <div className="btnRow">
                    <button
                      className="btnPrimary small"
                      onClick={() => {
                        navigate(`/shoe/${value._id}`);
                      }}
                    >
                      View details
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          className="btnGhost small"
                          onClick={() => {
                            navigate(`/shoe/update/${value._id}`);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btnDanger small"
                          onClick={() => {
                            handleDelete(value._id);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                  <ProductCardActions shoe={value} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReadAllShoe;
