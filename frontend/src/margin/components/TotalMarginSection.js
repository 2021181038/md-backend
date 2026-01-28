import React from "react";

const TotalMarginSection = ({ totalMargin, totalProxyFee }) => {
  return (
    <>
      {totalProxyFee > 0 && (
        <div
          style={{
            fontWeight: "bold",
            fontSize: "15px",
            marginBottom: "6px",
            color: "#6b2ea6",
          }}
        >
          💸 총 대찍 대리비: {totalProxyFee.toLocaleString()}₩
        </div>
      )}

      {totalMargin && (
        <div
          style={{
            fontWeight: "bold",
            fontSize: "16px",
            marginBottom: "10px",
            color: "#1a630f",
          }}
        >
          💰 **최종 마진 총합:** {totalMargin.total} ¥ ({totalMargin.totalWon} ₩)
        </div>
      )}
    </>
  );
};

export default TotalMarginSection;

