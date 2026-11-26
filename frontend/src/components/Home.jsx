import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../api";
import ProductCarousel from "./home/ProductCarousel";
import CategoryGrid from "./home/CategoryGrid";
import BrandShowcase from "./home/BrandShowcase";

const Home = () => {
  let [products, setProducts] = useState([]);
  let [categories, setCategories] = useState([]);
  let [brands, setBrands] = useState([]);
  let [loading, setLoading] = useState(true);
  let [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    let loadHomeData = async () => {
      let failedRequests = [];
      let productsRequest = axios({
        url: apiUrl("/api/shoes"),
        method: "get",
      })
        .then((response) => {
          if (!Array.isArray(response.data.result)) {
            throw new Error("The shoe service returned an invalid response.");
          }
          return response.data.result;
        })
        .catch(() => {
          failedRequests.push("products");
          return [];
        });

      let categoryRequest = axios({
        url: apiUrl("/api/shoes/categories"),
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
          return [];
        });

      let brandRequest = axios({
        url: apiUrl("/api/shoes/brands"),
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
          return [];
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
            ? "Some store details could not be loaded. Check the backend connection and try again."
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
