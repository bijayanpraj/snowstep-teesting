import React from "react";
import { useNavigate } from "react-router-dom";

let categoryIcons = {
  Running: "↗",
  Basketball: "◉",
  Casual: "✦",
  Sports: "⌁",
  Training: "＋",
  Formal: "◇",
};

const CategoryGrid = ({ categories = [] }) => {
  let navigate = useNavigate();
  let visibleCategories = categories.length
    ? categories
    : ["Running", "Basketball", "Casual", "Sports", "Training", "Formal"];

  return (
    <section className="homeSection">
      <div className="homeSectionHead">
        <h2>Shop By Category</h2>
        <a href="/shoe">Explore all</a>
      </div>
      <div className="categoryGrid">
        {visibleCategories.map((category) => (
          <button
            type="button"
            className="categoryTile"
            key={category}
            onClick={() => navigate("/shoe")}
          >
            <span className="categoryIcon" aria-hidden="true">
              {categoryIcons[category] || "✦"}
            </span>
            <span>{category}</span>
            <span className="categoryArrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
