import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fallbackImage } from "../../shoe/fallback";

const SearchBarWithSuggestions = ({ products = [], loading = false }) => {
  let [search, setSearch] = useState("");
  let [debouncedSearch, setDebouncedSearch] = useState("");
  let [selectedIndex, setSelectedIndex] = useState(-1);
  let [isOpen, setIsOpen] = useState(false);
  let searchBox = useRef(null);
  let navigate = useNavigate();

  useEffect(() => {
    let timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  let suggestions = debouncedSearch
    ? products
        .filter((product) => {
          let text = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
          return text.includes(debouncedSearch.toLowerCase());
        })
        .slice(0, 6)
    : [];

  let openProduct = (product) => {
    setIsOpen(false);
    setSearch("");
    if (product._id) {
      navigate(`/shoe/${product._id}`);
    } else {
      navigate("/shoe");
    }
  };

  let submitSearch = (event) => {
    event.preventDefault();
    if (suggestions.length > 0) {
      openProduct(suggestions[Math.max(selectedIndex, 0)]);
    } else if (search.trim()) {
      setIsOpen(false);
      navigate("/shoe");
    }
  };

  let handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!suggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );
    }
  };

  return (
    <div
      className="navSearch"
      ref={searchBox}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <form className="navSearchForm" role="search" onSubmit={submitSearch}>
        <label className="visuallyHidden" htmlFor="nav-product-search">
          Search shoes
        </label>
        <span className="navSearchIcon" aria-hidden="true">⌕</span>
        <input
          id="nav-product-search"
          type="search"
          value={search}
          placeholder="Search shoes, brands..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen && Boolean(search)}
          aria-controls="nav-search-suggestions"
          onChange={(event) => {
            setSearch(event.target.value);
            setSelectedIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {search && (
          <button
            type="button"
            className="navSearchClear"
            aria-label="Clear search"
            onClick={() => {
              setSearch("");
              setIsOpen(false);
              searchBox.current?.querySelector("input")?.focus();
            }}
          >
            ×
          </button>
        )}
        <button type="submit" className="visuallyHidden">Search</button>
      </form>

      {isOpen && search.trim() && (
        <div
          className="searchSuggestions"
          id="nav-search-suggestions"
          role="listbox"
          aria-label="Shoe suggestions"
        >
          {loading ? (
            <p className="searchSuggestionStatus">Loading shoes...</p>
          ) : suggestions.length > 0 ? (
            suggestions.map((product, index) => (
              <button
                type="button"
                role="option"
                aria-selected={selectedIndex === index}
                className={`searchSuggestion ${selectedIndex === index ? "selected" : ""}`}
                key={product._id || `${product.name}-${index}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openProduct(product)}
              >
                <img
                  src={product.image || fallbackImage}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
                <span className="searchSuggestionInfo">
                  <strong>{product.name}</strong>
                  <span>{product.brand} · {product.category}</span>
                  {!(Number(product.quantity) > 0) && (
                    <span className="soldOutBadge">Sold out</span>
                  )}
                </span>
              </button>
            ))
          ) : (
            <p className="searchSuggestionStatus">No matches found. Press Enter to browse shoes.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBarWithSuggestions;
