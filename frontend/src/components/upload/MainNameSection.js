import React from "react";

const MainNameSection = ({ mainName, handleCopy }) => {
  if (!mainName) return null;

  return (
    <div className="result-section">
      <h3 className="ui-card-title">메인상품명</h3>
      <textarea
        className="ui-textarea"
        value={mainName}
        readOnly
        rows={3}
      />
      <div className="btn-row">
        <button
          type="button"
          className="btn-copy"
          onClick={() => handleCopy(mainName, "메인 상품명")}
        >
          복사하기
        </button>
      </div>
    </div>
  );
};

export default MainNameSection;
