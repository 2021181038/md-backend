import React from "react";

const TextExtractSection = ({ extractedText }) => {
  if (!extractedText) return null;

  return (
    <div style={{ marginTop: "15px" }}>
      <h3>📄 공유용 텍스트</h3>
      <textarea
        readOnly
        value={extractedText}
        style={{ width: "100%", height: "200px", fontSize: "14px" }}
      />
      <button
        className="mc-btn mc-btn-green"
        onClick={() => {
          navigator.clipboard.writeText(extractedText);
        }}
        style={{ marginTop: "10px" }}
      >
        복사하기
      </button>
    </div>
  );
};

export default TextExtractSection;

