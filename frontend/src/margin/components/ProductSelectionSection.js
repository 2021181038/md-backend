import React from "react";

const ProductSelectionSection = ({ productNames, selectedNames, toggleSelect, setSelectedNames }) => {
  if (productNames.length === 0) return null;

  return (
    <div>
      <h3>상품 선택</h3>
      <button
        onClick={() => setSelectedNames([])}
        className="mc-btn mc-btn-blue"
      >
        모두 해제
      </button>
      <ul className="product-list">
        {productNames.map((name, idx) => (
          <li key={idx}>
            <label>
              <input
                type="checkbox"
                checked={selectedNames.includes(name)}
                onChange={() => toggleSelect(name)}
              />
              {name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductSelectionSection;

