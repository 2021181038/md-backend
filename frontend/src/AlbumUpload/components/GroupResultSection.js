import React, { memo, useMemo } from "react";
import { exportGroupExcel } from "../utils/excelUtils";

const GroupResultSection = ({ groupedData, sets, canGroupPrices, handleGroupPrices }) => {
  return (
    <>
      <div style={{ marginTop: "16px", textAlign: "left" }}>
        <button
          className="btn-primary"
          onClick={handleGroupPrices}
          disabled={!canGroupPrices()}
          style={{
            opacity: canGroupPrices() ? 1 : 0.5,
            cursor: canGroupPrices() ? "pointer" : "not-allowed"
          }}
        >
          가격대별 그룹 만들기
        </button>

        {!canGroupPrices() && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: "#d9534f",
              fontWeight: "500"
            }}
          >
            ⚠️ 옵션O 상품의 <b>멤버명 입력 완료</b> 버튼을 모두 눌러주세요
          </div>
        )}
      </div>

      {groupedData.length > 0 && (
        <div className="group-result-area">
          <h2>📦 가격대별 그룹 결과</h2>
          {groupedData.map((group, idx) => {
            const reference = Math.ceil((group.standardPrice * 1.3) / 100) * 100 - 10;
            return (
              <div key={idx} className="group-box">
                <div className="group-header">
                  <strong>그룹 {idx + 1}</strong>
                  <span>기준가격: ¥{group.standardPrice}</span>
                  <span>참고가격: ¥{reference}</span>
                  <button
                    className="xlsx-button"
                    onClick={() => exportGroupExcel(group, idx, sets)}
                  >
                    그룹 {idx + 1} 엑셀 다운로드
                  </button>
                </div>
                <ul className="group-item-list">
                  {group.items.map((item, i) => (
                    <li key={i} className={item.hasOption ? "option-item" : ""}>
                      {item.displayName}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default memo(GroupResultSection);

