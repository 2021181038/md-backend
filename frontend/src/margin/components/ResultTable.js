import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { DUTY_CONFIG } from "../../constants/config";
import { parseOptionText } from "../utils/textUtils";

const ResultTable = ({
  matchedSummary,
  calculateMarginForRow,
  dutyApplied,
  setDutyApplied,
  proxyApplied,
  setProxyApplied,
  divideMap,
  setDivideMap,
  handleOptionChange,
  handleQtyChange,
  handleCostChange,
  handleSortByOption,
  selectedRows,
  toggleRowSelection,
}) => {
  const [showDetailSettings, setShowDetailSettings] = useState(false);

  if (matchedSummary.length === 0) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3 style={{ margin: 0 }}>📊 마진 계산</h3>
        <button 
          onClick={() => setShowDetailSettings(!showDetailSettings)}
          className="mc-btn mc-btn-blue"
          style={{ fontSize: "14px", padding: "6px 12px" }}
        >
          {showDetailSettings ? "상세설정 숨기기" : "상세설정"}
        </button>
      </div>
      <div className="legend" style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <span>🟢 결제금 {DUTY_CONFIG.AUTO_DUTY_THRESHOLD.toLocaleString()}엔 초과 (자동 {DUTY_CONFIG.AUTO_DUTY_RATE * 100}%)</span>
        <span>🟣 옷 관세 (체크 시 12%)</span>
        <span>🔴 모두 해당</span>
      </div>

      <table className="margin-table">
        <thead>
          <tr>
            <th>옵션정보</th>
            {showDetailSettings && <th>옷 관세</th>}
            {showDetailSettings && <th>대찍 대리비(₩)</th>}
            <th>총 수량</th>
            <th>원가(₩)</th>
            <th>원가(¥)</th>
            {showDetailSettings && <th>분할(N)</th>}
            <th>결제금(평균)</th>
            <th>정산금(평균)</th>
            <th>마진(¥, 평균)</th>
            <th>최종마진(¥)</th>
          </tr>
        </thead>
        <tbody>
          {matchedSummary.map((row, idx) => {
            const calc = calculateMarginForRow(row);
            const isDuty = dutyApplied[row.option];
            const avgPay = Number(calc.avgPay);

            let rowClass = "";
            if (isDuty && avgPay > DUTY_CONFIG.AUTO_DUTY_THRESHOLD) {
              rowClass = "dual-duty-row";
            } else if (avgPay > DUTY_CONFIG.AUTO_DUTY_THRESHOLD) {
              rowClass = "auto-duty-row";
            } else if (isDuty) {
              rowClass = "duty-row";
            }

            const { main, sub } = parseOptionText(row.option);

            const isSelected = selectedRows && selectedRows.has(row.option);
            const finalRowClass = isSelected ? `${rowClass} selected-row`.trim() : rowClass;

            return (
              <tr key={idx} className={finalRowClass}>
                <td
                  onClick={() => toggleRowSelection(row.option)}
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    backgroundColor: isSelected ? "#fff3cd" : "transparent",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "#f0f8ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.05em" }}>{main}</span>
                    {sub && (
                      <span style={{ color: "#666", fontSize: "0.85em" }}>{sub}</span>
                    )}
                  </div>
                </td>
                {showDetailSettings && (
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!dutyApplied[row.option]}
                        onChange={(e) =>
                          setDutyApplied((prev) => ({
                            ...prev,
                            [row.option]: e.target.checked,
                          }))
                        }
                      />{" "}
                    </label>
                  </td>
                )}
                {showDetailSettings && (
                  <td>
                    <input
                      type="checkbox"
                      checked={!!proxyApplied[row.option]}
                      onChange={(e) =>
                        setProxyApplied((prev) => ({
                          ...prev,
                          [row.option]: e.target.checked,
                        }))
                      }
                    />
                  </td>
                )}
                <td>
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) => handleQtyChange(idx, e.target.value)}
                    style={{ width: "60px", textAlign: "right" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={calc.costWon}
                    placeholder="₩"
                    onChange={(e) => handleCostChange(row.option, e.target.value)}
                    style={{ width: "80px", textAlign: "right", height: "20px" }}
                  />
                </td>
                <td>{calc.costYen}</td>
                {showDetailSettings && (
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={divideMap[row.option] || 1}
                      onChange={(e) =>
                        setDivideMap((prev) => ({
                          ...prev,
                          [row.option]: Number(e.target.value) || 1,
                        }))
                      }
                      style={{ width: "60px", textAlign: "center" }}
                    />
                  </td>
                )}
                <td>{calc.avgPay}</td>
                <td>{calc.avgSettle}</td>
                <td>{calc.marginAvg}</td>
                <td>{calc.totalMarginAvg}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

ResultTable.propTypes = {
  matchedSummary: PropTypes.arrayOf(
    PropTypes.shape({
      option: PropTypes.string.isRequired,
      qty: PropTypes.number.isRequired,
      minSettle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      maxSettle: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      minPay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      maxPay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  calculateMarginForRow: PropTypes.func.isRequired,
  dutyApplied: PropTypes.object.isRequired,
  setDutyApplied: PropTypes.func.isRequired,
  proxyApplied: PropTypes.object.isRequired,
  setProxyApplied: PropTypes.func.isRequired,
  divideMap: PropTypes.object.isRequired,
  setDivideMap: PropTypes.func.isRequired,
  handleOptionChange: PropTypes.func.isRequired,
  handleQtyChange: PropTypes.func.isRequired,
  handleCostChange: PropTypes.func.isRequired,
  selectedRows: PropTypes.instanceOf(Set),
  toggleRowSelection: PropTypes.func.isRequired,
};

export default ResultTable;

