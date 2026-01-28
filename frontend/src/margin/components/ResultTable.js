import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { DUTY_CONFIG } from "../../constants/config";

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
}) => {
  if (matchedSummary.length === 0) return null;

  return (
    <div>
      <h3>📊 옵션별 수량 + 마진 계산 통합표</h3>
      <div className="legend">
        <p>🟢 결제금 {DUTY_CONFIG.AUTO_DUTY_THRESHOLD.toLocaleString()}엔 초과 (자동 {DUTY_CONFIG.AUTO_DUTY_RATE * 100}%)</p>
        <p>🟣 옷 관세 (체크 시 12%)</p>
        <p>🔴 모두 해당</p>
      </div>

      <table className="margin-table">
        <thead>
          <tr>
            <th>옵션정보</th>
            <th>옷 관세</th>
            <th>대찍 대리비(₩)</th>
            <th>총 수량</th>
            <th>원가(₩)</th>
            <th>원가(¥)</th>
            <th>분할(N)</th>
            <th>정산금(평균)</th>
            <th>결제금(평균)</th>
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

            return (
              <tr key={idx} className={rowClass}>
                <td>
                  <input
                    type="text"
                    value={row.option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    style={{ width: "95%" }}
                  />
                </td>
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
                <td>{calc.avgSettle}</td>
                <td>{calc.avgPay}</td>
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
};

export default ResultTable;

