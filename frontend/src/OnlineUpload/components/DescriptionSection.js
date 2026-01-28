import React from "react";

const DescriptionSection = ({ detailDescription }) => {
  if (!detailDescription) return null;

  return (
    <div style={{ marginTop: "10px" }}>
      <h3>📝 상세페이지</h3>
      <textarea
        value={detailDescription}
        readOnly
        style={{
          width: "100%",
          height: "300px",
          fontSize: "13px",
          fontFamily: "monospace"
        }}
      />
      <button
        className="COPY-button"
        style={{ marginTop: "8px" }}
        onClick={() => navigator.clipboard.writeText(detailDescription)}
      >
        복사하기
      </button>
    </div>
  );
};

export default DescriptionSection;

