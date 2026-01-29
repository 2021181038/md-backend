import React from "react";

const ActionButtonsSection = ({
  selectedNames,
  summary,
  settlementData,
  matchedSummary,
  handleSummarize,
  handleTotalMargin,
  proxyApplied,
  setProxyApplied,
  handleSortByOption,
}) => {
  return (
    <div className="button-row">
      {selectedNames.length > 0 && summary.length === 0 && (
        <button onClick={handleSummarize} className="mc-btn mc-btn-blue">
          선택한 상품 주문 수합하기
        </button>
      )}

      {summary.length > 0 && settlementData.length > 0 && (
        <button onClick={handleTotalMargin} className="mc-btn mc-btn-blue">
          최종 마진 합계 계산하기
        </button>
      )}

      {summary.length > 0 && matchedSummary.length > 0 && (() => {
        // 모든 옵션이 선택되어 있는지 확인
        const allSelected = matchedSummary.every((row) => proxyApplied[row.option]);
        
        return (
          <button
            onClick={() => {
              if (allSelected) {
                // 모두 선택되어 있으면 해제
                setProxyApplied({});
              } else {
                // 하나라도 해제되어 있으면 전체 선택
                const newState = {};
                matchedSummary.forEach((row) => {
                  newState[row.option] = true;
                });
                setProxyApplied(newState);
              }
            }}
            className="mc-btn mc-btn-purple"
          >
            {allSelected ? "대찍 전체 해제" : "대찍 전체 선택"}
          </button>
        );
      })()}

      {summary.length > 0 && matchedSummary.length > 0 && (
        <button onClick={handleSortByOption} className="mc-btn mc-btn-green">
          옵션명 오름차순 정렬
        </button>
      )}
    </div>
  );
};

export default ActionButtonsSection;

