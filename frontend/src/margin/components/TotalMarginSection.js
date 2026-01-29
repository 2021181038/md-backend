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
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "6px",
              color: "#1a630f",
            }}
          >
            매입금 총합 : {totalMargin.totalCostWon} ₩
          </div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "6px",
              color: "#1a630f",
            }}
          >
            결제금 총합 : {totalMargin.totalPayWon} ₩
          </div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "6px",
              color: "#1a630f",
            }}
          >
            정산금액 총합 : {totalMargin.totalSettleWon} ₩
          </div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#1a630f",
            }}
          >
            최종 마진 총합 : {totalMargin.totalWon} ₩
          </div>
        </div>
      )}
    </>
  );
};

export default TotalMarginSection;

