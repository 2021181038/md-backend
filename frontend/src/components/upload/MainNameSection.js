import React from "react";

const MainNameSection = ({ mainName, handleCopy }) => {
  if (!mainName) return null;

  return (
    <div style={{ marginTop: '0px' }}>
      <h3>📝 메인상품명</h3>
      <textarea
        value={mainName}
        readOnly
        style={{ width: '100%', height: '60px', fontSize: '16px' }}
      />
      <button
        className="COPY-button"
        style={{ marginTop: '8px' }}
        onClick={() => handleCopy(mainName, "메인 상품명")}
      >
        복사하기
      </button>
    </div>
  );
};

export default MainNameSection;

