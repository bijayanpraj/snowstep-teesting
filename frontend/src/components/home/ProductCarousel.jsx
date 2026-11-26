import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { fallbackImage } from "../../shoe/fallback";
import ProductCardActions from "../../shoe/ProductCardActions";
import { formatPrice } from "../../currency";

const ProductCarousel = ({ title, products = [] }) => {
  let navigate = useNavigate();

  let openProduct = (product) => {
    if (!product._id) {
      return;
    }

    navigate(`/shoe/${product._id}`);
  };

  return (
    <section className="homeSection">
      <div className="homeSectionHead">
        <h2>{title}</h2>
        <Link to="/shoe">View all shoes</Link>
      </div>
      {products.length === 0 ? (
        <p className="homeEmpty">New styles are on the way.</p>
      ) : (
        <div className="productCarousel">
          {products.map((product, index) => {
            let soldOut = !(Number(product.quantity) > 0);
            let salePrice =
              product.discountPercent > 0
                ? product.price * (1 - product.discountPercent / 100)
                : product.price;

            return (
              <article
                className="homeProductCard"
                key={product._id || `${product.name}-${index}`}
              >
                <div className="homeProductImage">
                  {product.discountPercent > 0 && (
                    <span className="discountBadge">
                      -{product.discountPercent}%
                    </span>
                  )}
                  <img
                    src={product.image || fallbackImage}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                    onClick={() => openProduct(product)}
                  />
                </div>
                <div className="homeProductBody">
                  <p className="brand">{product.brand}</p>
                  {soldOut && <span className="soldOutBadge">Sold out</span>}
                  <button
                    className="productNameButton"
                    onClick={() => openProduct(product)}
                    disabled={!product._id}
                  >
                    {product.name}
                  </button>
                  <p className="productRating" aria-label={`${product.rating || 0} out of 5 stars`}>
                    <span aria-hidden="true">{"★".repeat(Math.round(product.rating || 0))}</span>
                    <span className="ratingCount">
                      {product.rating ? ` ${product.rating} (${product.reviewCount || 0})` : " No reviews"}
                    </span>
                  </p>
                  <p className="productPrices">
                    <span className="price">{formatPrice(salePrice)}</span>
                    {product.discountPercent > 0 && (
                      <del>{formatPrice(product.price)}</del>
                    )}
                  </p>
                  <ProductCardActions shoe={{ ...product, price: salePrice }} />
                  <button
                    type="button"
                    className="btnGhost small productDetailsButton"
                    onClick={() => openProduct(product)}
                    disabled={!product._id}
                  >
                    View details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ProductCarousel;
