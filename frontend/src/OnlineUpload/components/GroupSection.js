import React from "react";
import { exportGroupExcel } from "../utils/excelUtils";

const GroupSection = ({ grouped, handleGroup }) => {
  return (
    <>
      <button className="pretty-button" onClick={handleGroup}>
        가격별 그룹 만들기
      </button>

      {grouped.map((group, idx) => {
        const rawReference = group.standardPrice * 1.3;
        const referencePrice = Math.ceil(rawReference / 100) * 100 - 10;
        const sortedItems = [...group.items].sort((a, b) => {
          if (a.name === "–") return 1;
          if (b.name === "–") return -1;
          const numA = parseInt(a.name.match(/^\[(\d+)\]/)?.[1] || 0, 10);
          const numB = parseInt(b.name.match(/^\[(\d+)\]/)?.[1] || 0, 10);
          return numA - numB;
        });

        return (
          <div key={idx} style={{ marginBottom: '15px' }}>
            <strong>
              그룹 {idx + 1} (기준가격: ¥{group.standardPrice} 참고가격: ¥{referencePrice})
            </strong>
            <button
              className="xlsx-button"
              style={{ marginLeft: '10px' }}
              onClick={() => exportGroupExcel(group, idx)}
            >
              그룹 {idx + 1} 엑셀 다운로드
            </button>
            <ul>
              {sortedItems.map((item, i) => {
                const diff = Number(item.price) - group.standardPrice;
                const diffText = diff === 0 ? '0' : (diff > 0 ? `+${diff}` : `${diff}`);
                return (
                  <li
                    key={i}
                    style={{ color: item.hasOption ? 'red' : 'black' }}
                  >
                    {item.name} : {diffText}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
};

export default GroupSection;

