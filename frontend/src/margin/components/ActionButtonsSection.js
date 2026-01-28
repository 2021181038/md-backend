import React from "react";

const ActionButtonsSection = ({
  selectedNames,
  summary,
  settlementData,
  matchedSummary,
  handleSummarize,
  handleMatchSettlement,
  handleTotalMargin,
  handleExtractText,
  setProxyApplied,
}) => {
  return (
    <div className="button-row">
      {selectedNames.length > 0 && (
        <button onClick={handleSummarize} className="mc-btn mc-btn-blue">
          선택한 상품 주문 수합하기
        </button>
      )}

      {summary.length > 0 && settlementData.length > 0 && (
        <button onClick={handleMatchSettlement} className="mc-btn mc-btn-blue">
          정산금액 매칭하기
        </button>
      )}

      {summary.length > 0 && settlementData.length > 0 && (
        <button onClick={handleTotalMargin} className="mc-btn mc-btn-blue">
          최종 마진 합계 계산하기
        </button>
      )}

      {summary.length > 0 && (
        <button onClick={handleExtractText} className="mc-btn mc-btn-green">
          텍스트로 추출하기
        </button>
      )}

      {summary.length > 0 && (
        <button
          onClick={() => {
            const newState = {};
            matchedSummary.forEach((row) => {
              newState[row.option] = true;
            });
            setProxyApplied(newState);
          }}
          className="mc-btn mc-btn-purple"
        >
          대찍 전체 선택
        </button>
      )}

      {summary.length > 0 && (
        <button
          onClick={() => setProxyApplied({})}
          className="mc-btn mc-btn-purple"
        >
          대찍 전체 해제
        </button>
      )}
    </div>
  );
};

export default ActionButtonsSection;

