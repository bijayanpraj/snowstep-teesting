import React from "react";

const BrandShowcase = ({ brands = [] }) => {
  if (!brands.length) {
    return null;
  }

  return (
    <section className="homeSection brandSection">
      <div className="homeSectionHead">
        <h2>Popular Brands</h2>
      </div>
      <div className="brandShowcase">
        {brands.map((brand) => (
          <div className="brandTile" key={brand}>{brand}</div>
        ))}
      </div>
    </section>
  );
};

export default BrandShowcase;
