import React from "react";

const DescriptionSection = ({ detailDescription }) => {
  if (!detailDescription) return null;

  return (
    <div className="result-section">
      <h3 className="ui-card-title">상세페이지</h3>
      <textarea
        className="ui-textarea ui-textarea--mono"
        value={detailDescription}
        readOnly
        rows={12}
      />
      <div className="btn-row">
        <button
          type="button"
          className="btn-copy"
          onClick={() => navigator.clipboard.writeText(detailDescription)}
        >
          복사하기
        </button>
      </div>
    </div>
  );
};

export default DescriptionSection;
