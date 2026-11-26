import React from "react";

const BrandShowcase = ({ brands = [] }) => {
  let popularBrands = ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "Converse"];
  let visibleBrands = brands.length ? brands : popularBrands;

  return (
    <section className="homeSection brandSection">
      <div className="homeSectionHead">
        <h2>Popular Brands</h2>
      </div>
      <div className="brandShowcase">
        {visibleBrands.map((brand) => (
          <div className="brandTile" key={brand}>{brand}</div>
        ))}
      </div>
    </section>
  );
};

export default BrandShowcase;
