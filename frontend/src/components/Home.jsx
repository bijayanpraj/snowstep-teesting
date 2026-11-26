import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCarousel from "./home/ProductCarousel";
import CategoryGrid from "./home/CategoryGrid";
import BrandShowcase from "./home/BrandShowcase";
import { fallbackShoes } from "../shoe/fallback";

const Home = () => {
  let [products, setProducts] = useState(fallbackShoes);
  let [categories, setCategories] = useState([]);
  let [brands, setBrands] = useState([]);
  let [loading, setLoading] = useState(true);
  let [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    let loadHomeData = async () => {
      let failedRequests = [];
      let productsRequest = axios({
        url: "http://localhost:8000/api/shoes",
        method: "get",
      })
        .then((response) => {
          if (!Array.isArray(response.data.result)) {
            throw new Error("The shoe service returned an invalid response.");
          }
          return response.data.result.length ? response.data.result : fallbackShoes;
        })
        .catch(() => {
          failedRequests.push("products");
          return fallbackShoes;
        });

      let categoryRequest = axios({
        url: "http://localhost:8000/api/shoes/categories",
        method: "get",
      })
        .then((response) => {
          if (!Array.isArray(response.data.result)) {
            throw new Error("The category service returned an invalid response.");
          }
          return response.data.result;
        })
        .catch(() => {
          failedRequests.push("categories");
          return [...new Set(fallbackShoes.map((shoe) => shoe.category))];
        });

      let brandRequest = axios({
        url: "http://localhost:8000/api/shoes/brands",
        method: "get",
      })
        .then((response) => {
          if (!Array.isArray(response.data.result)) {
            throw new Error("The brand service returned an invalid response.");
          }
          return response.data.result;
        })
        .catch(() => {
          failedRequests.push("brands");
          return [...new Set(fallbackShoes.map((shoe) => shoe.brand))];
        });

      let [loadedProducts, loadedCategories, loadedBrands] = await Promise.all([
        productsRequest,
        categoryRequest,
        brandRequest,
      ]);

      if (active) {
        setProducts(loadedProducts);
        setCategories(loadedCategories);
        setBrands(loadedBrands);
        setErrorMessage(
          failedRequests.length
            ? "Some live store details are unavailable. Showing our sample collection instead."
            : ""
        );
        setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="homePage">
      {loading && (
        <p className="homeStatus" role="status">
          Loading the latest from Snowstep…
        </p>
      )}
      {errorMessage && <p className="homeError" role="status">{errorMessage}</p>}
      <ProductCarousel title="Products" products={products} />
      <CategoryGrid categories={categories} />
      <BrandShowcase brands={brands} />
    </main>
  );
};

export default Home;
