import React from "react";
import { Link } from "react-router-dom";
import { fallbackImage } from "../../shoe/fallback";

let menuGroups = {
  Men: [
    { title: "Shop by style", links: ["Running", "Casual", "Training", "Sports"] },
  ],
  Women: [
    { title: "Shop by style", links: ["Running", "Casual", "Training", "Sports"] },
  ],
  Kids: [
    { title: "Shop by style", links: ["Running", "Casual", "Training", "Sports"] },
  ],
};

const MegaMenu = ({ id, type, products = [], onClose }) => {
  let featuredProduct = products[0];

  if (!menuGroups[type]) {
    return null;
  }

  return (
    <div
      id={id}
      className="megaMenu"
      role="region"
      aria-label={`${type} shoe selection`}
    >
      {menuGroups[type].length > 0 && (
        <div className="megaMenuGroups">
          {menuGroups[type].map((group) => (
            <div className="megaMenuGroup" key={group.title}>
              <h2>{group.title}</h2>
              {group.links.map((item) => (
                <Link
                  to="/shoe"
                  key={item}
                  onClick={onClose}
                >
                  {item}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
      <Link
        className="megaMenuPromo"
        to={featuredProduct?._id ? `/shoe/${featuredProduct._id}` : "/shoe"}
        onClick={onClose}
      >
        <img
          src={featuredProduct?.image || fallbackImage}
          alt={featuredProduct?.name || "Featured shoes"}
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />
        <span className="megaMenuPromoText">
          <span className="megaMenuPromoLabel">SNOWSTEP PICKS</span>
          <strong>{featuredProduct?.name || "Find your next favorite"}</strong>
          {featuredProduct && !(Number(featuredProduct.quantity) > 0) && (
            <span className="soldOutBadge">Sold out</span>
          )}
          <span>Explore the collection <span aria-hidden="true">→</span></span>
        </span>
      </Link>
    </div>
  );
};

export default MegaMenu;
