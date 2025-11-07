import React, { useState } from "react";
import Papa from "papaparse"; 
import "./MarginCalculator.css";

function MarginCalculator() {
  const [csvData, setCsvData] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [summary, setSummary] = useState([]);
  const [settlementData, setSettlementData] = useState([]);
  const [matchedSummary, setMatchedSummary] = useState([]);
  const [costs, setCosts] = useState({}); 
  const exchangeRate = 9.42;
  const [totalMargin, setTotalMargin] = useState(null);
  const [dutyApplied, setDutyApplied] = useState({}); 
  const [extractedText, setExtractedText] = useState("");
  const [proxyApplied, setProxyApplied] = useState({}); 
  const [totalProxyFee, setTotalProxyFee] = useState(0); 
const [divideMap, setDivideMap] = useState({}); 


  // 주문 CSV 업로드
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      encoding: "UTF-8",
      complete: (result) => {
        const data = result.data.filter((row) => row["상품명"]);
        setCsvData(data);
        const names = [...new Set(data.map((row) => row["상품명"]))].sort((a, b) =>
            a.localeCompare(b, "ko")
        );
        setProductNames(names);
      },
    });
  };
  // 정산 CSV 업로드
  const handleSettlementUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      encoding: "UTF-8",
      complete: (result) => {
        const data = result.data.filter((row) => row["옵션정보"]);
        setSettlementData(data);
      },
    });
  };
  // 상품명 선택
  const toggleSelect = (name) => {
    setSelectedNames((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };
  // 주문 데이터 수합
  const handleSummarize = () => {
    const filtered = csvData.filter((row) =>
      selectedNames.includes(row["상품명"])
    );

    const merged = {};
    filtered.forEach((row) => {
      const option = row["옵션정보"];
      const qty = Number(row["수량"]) || 0;
      if (!merged[option]) merged[option] = 0;
      merged[option] += qty;
    });

    const summaryArr = Object.entries(merged).map(([option, qty]) => ({
      option,
      qty,
    }));

    summaryArr.sort((a, b) => {
    const numA = parseInt(a.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    const numB = parseInt(b.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    return numA - numB;
  });

    setSummary(summaryArr);
  };
  // 정산 CSV 매칭 
  const handleMatchSettlement = () => {
    const result = summary.map((item) => {
      const sameOptionsAll = settlementData.filter(
        (row) => row["옵션정보"] === item.option
      );

      if (sameOptionsAll.length === 0) {
        return {
          ...item,
          minSettle: "데이터 없음",
          maxSettle: "데이터 없음",
          minPay: "데이터 없음",
          maxPay: "데이터 없음",
        };
      }
      const singleQtyRows = sameOptionsAll.filter(
        (row) => Number(row["수량"]) === 1
      );
      let targetRows = singleQtyRows;
      if (targetRows.length === 0) {
        const validRows = sameOptionsAll.filter(
          (r) => !isNaN(Number(r["수량"])) && Number(r["수량"]) > 0
        );
        if (validRows.length === 0) {
          return {
            ...item,
            minSettle: "수량 데이터 없음",
            maxSettle: "수량 데이터 없음",
            minPay: "수량 데이터 없음",
            maxPay: "수량 데이터 없음",
          };
        }
        const minQty = Math.min(...validRows.map((r) => Number(r["수량"])));
        targetRows = validRows.filter((r) => Number(r["수량"]) === minQty);
        targetRows = targetRows.map((r) => {
          const settle = Number(String(r["정산금액"]).replace(/[^\d.-]/g, ""));
          const pay = Number(String(r["상품결제금"]).replace(/[^\d.-]/g, ""));
          const qty = Number(r["수량"]);
          return {
            ...r,
            정산금액: qty > 0 ? (settle / qty).toFixed(2) : settle,
            상품결제금: qty > 0 ? (pay / qty).toFixed(2) : pay,
          };
        });
      }

      const settleValues = targetRows
        .map((row) => Number(String(row["정산금액"]).replace(/[^\d.-]/g, "")))
        .filter((n) => !isNaN(n) && n > 0);

      const payValues = targetRows
        .map((row) => Number(String(row["상품결제금"]).replace(/[^\d.-]/g, "")))
        .filter((n) => !isNaN(n) && n > 0);

      if (settleValues.length === 0 || payValues.length === 0) {
        return {
          ...item,
          minSettle: "유효 데이터 없음",
          maxSettle: "유효 데이터 없음",
          minPay: "유효 데이터 없음",
          maxPay: "유효 데이터 없음",
        };
      }

      const minSettle = Math.min(...settleValues);
      const maxSettle = Math.max(...settleValues);
      const minPay = Math.min(...payValues);
      const maxPay = Math.max(...payValues);

      return {
        ...item,
        minSettle,
        maxSettle,
        minPay,
        maxPay,
      };
    });

    result.sort((a, b) => {
    const numA = parseInt(a.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    const numB = parseInt(b.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    return numA - numB;
  });

    setMatchedSummary(result);
  };
  //텍스트추출하기
  const handleExtractText = () => {
  if (summary.length === 0) return;

  const text = summary
    .map((item) => {
      let clean = item.option
        .replace(/^OPTION:\s*/i, "")        
        .replace(/\s*\/\s*TYPE:\s*/i, " ")  
        .replace(/\([^)]*円[^)]*\)/g, "")   
        .replace(/\s*-\s*$/, "")              
        .trim();
      return `${clean} ${item.qty}`;
    })
    .join("\n");
  setExtractedText(text);
};
  //최종마진합계 + 대찍 수고비 합계
  const handleTotalMargin = () => {
  if (matchedSummary.length === 0) return;
  let totalSum = 0;
  matchedSummary.forEach((row) => {
    const costWon = Number(costs[row.option]) || 0;
    const costYen = costWon > 0 ? costWon / exchangeRate : 0;
    const minSettle = Number(row.minSettle);
    const maxSettle = Number(row.maxSettle);
    const minPay = Number(row.minPay);
    const maxPay = Number(row.maxPay);
    if (!isNaN(minSettle) && !isNaN(maxSettle) && !isNaN(minPay) && !isNaN(maxPay)) {
      const avgSettle = Math.floor((minSettle + maxSettle) / 2);
      const avgPay = Math.floor((minPay + maxPay) / 2);
      // 관세 반영 (옷 12%, 16500엔 이상 5%)
      const dutyRate = dutyApplied[row.option] ? 0.12 : 0;
      const autoDutyRate = avgPay > 16500 ? 0.05 : 0;
      const dutyAmount = Math.floor(avgPay * (dutyRate + autoDutyRate));
      // 평균 마진 계산
      const marginAvg = Math.floor(avgSettle - costYen - dutyAmount);
      // 총 마진 = (마진 × 수량)
      totalSum += marginAvg * row.qty;
    }
  });

  // 총 대찍 대리비 계산 (수량 포함)
  let totalProxy = 0;
  matchedSummary.forEach((row) => {
    const costWon = Number(costs[row.option]) || 0;
    if (proxyApplied[row.option]) {
      if (costWon <= 14000) totalProxy += 1000 * row.qty;
      else if (costWon <= 39000) totalProxy += 2000 * row.qty;
      else totalProxy += 3000 * row.qty;
    }
  });
  // 대리비 원화를 엔화로 변환해 마진에서 차감
  const totalProxyYen = totalProxy / exchangeRate;
  // 결과 저장
  setTotalProxyFee(totalProxy); 
  setTotalMargin({
    total: (totalSum - totalProxyYen).toFixed(2), 
    totalWon: Math.ceil((totalSum * exchangeRate) - totalProxy).toLocaleString(), 
  });
};
  // 옵션명 수정 핸들러
const handleOptionChange = (index, newOption) => {
  setMatchedSummary((prev) => {
    const updated = [...prev];
    updated[index].option = newOption;
    return updated;
  });
  setSummary((prev) => {
    const updated = [...prev];
    updated[index].option = newOption;
    return updated;
  });
};

// 수량 수정 핸들러
const handleQtyChange = (index, newQty) => {
  const parsedQty = Number(newQty) || 0;
  setMatchedSummary((prev) => {
    const updated = [...prev];
    updated[index].qty = parsedQty;
    return updated;
  });
  setSummary((prev) => {
    const updated = [...prev];
    updated[index].qty = parsedQty;
    return updated;
  });
};

  // 원가 입력 핸들러
  const handleCostChange = (option, value) => {
    setCosts((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  // 마진 계산
  const calculateMargin = (row) => {
  const costWon = Number(costs[row.option]) || 0;
  const costYen = costWon > 0 ? Math.floor(costWon / exchangeRate) : "-";

  const minSettle = Number(row.minSettle);
  const maxSettle = Number(row.maxSettle);
  const minPay = Number(row.minPay);
  const maxPay = Number(row.maxPay);

  if (isNaN(minSettle) || isNaN(maxSettle) || isNaN(minPay) || isNaN(maxPay)) {
    return {
      costWon,
      costYen,
      avgSettle: "-",
      avgPay: "-",
      marginAvg: "-",
      totalMarginAvg: "-",
      proxyFee: "-",
    };
  }

  // 💡 평균값 계산
  const divideValue = divideMap[row.option] || 1; // 기본값 1
  const avgSettle = Math.floor(((minSettle + maxSettle) / 2) / divideValue);
  const avgPay = Math.floor(((minPay + maxPay) / 2) / divideValue);


  // 💡 자동 관세 (결제금 16500엔 초과 시 5%)
  const autoDutyRate = avgPay > 16500 ? 0.05 : 0;
  const autoDutyAmount = Math.floor(avgPay * autoDutyRate);

  // 대찍 대리비 계산
let proxyFee = 0;
if (proxyApplied[row.option]) {
  if (costWon <= 14000) proxyFee = 1000;
  else if (costWon <= 39000) proxyFee = 2000;
  else proxyFee = 3000;

  proxyFee = proxyFee // ✅ 수량 곱하기
}

  // 평균 마진 (대찍 대리비 차감)
  const marginAvg = Math.floor(
    avgSettle - costYen - autoDutyAmount - (proxyFee / exchangeRate)
  );

  // 총 마진 (수량 반영)
  const totalMarginAvg = Math.floor(marginAvg * row.qty);
  return {
    costWon,
    costYen,
    avgSettle,
    avgPay,
    marginAvg,
    totalMarginAvg,
    proxyFee,
  };
};

  return (
    <div className="margin-container">
      {/* 파일 업로드 구역 */}
    <div className="upload-section">
      <div>
        <h3>📦 주문 파일 업로드</h3>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </div>

      <div>
        <h3>📑 정산 파일 업로드</h3>
        <input type="file" accept=".csv" onChange={handleSettlementUpload} />
      </div>
    </div>


      {/* 상품명 리스트 */}
      {productNames.length > 0 && (
        <div>
          <h3>상품 선택</h3>
          <button
            onClick={() => setSelectedNames([])}
            className="mc-btn mc-btn-blue"
          >
            모두 해제
          </button>
          <ul className="product-list">
            {productNames.map((name, idx) => (
              <li key={idx}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedNames.includes(name)}
                    onChange={() => toggleSelect(name)}
                  />
                  {name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="button-row">
      {/* 수합 버튼 */}
      {selectedNames.length > 0 && (
        <button onClick={handleSummarize} className="mc-btn mc-btn-blue">
          선택한 상품 주문 수합하기
        </button>
      )}
      {/* 정산 매칭 버튼 */}
      {summary.length > 0 && settlementData.length > 0 && (
        <button onClick={handleMatchSettlement} className="mc-btn mc-btn-blue">
          정산금액 매칭하기
        </button>
      )}
        {/* 최종 마진 합계 버튼 */}
        {summary.length > 0 && settlementData.length > 0 && (
        <button
          onClick={handleTotalMargin}
          className="mc-btn mc-btn-blue"
        >
          최종 마진 합계 계산하기
        </button>
        )}
        {/* 텍스트 추출 버튼 */}
      {summary.length > 0 && (
        <button
          onClick={handleExtractText}
          className="mc-btn mc-btn-green"
        >
          텍스트로 추출하기
        </button>
      )}

      {summary.length > 0 && (
      <button
  onClick={() => {
    const newState = {};
    matchedSummary.forEach((row) => {
      newState[row.option] = true; // ✅ 전체 선택 시 true
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

        {extractedText && (
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
      )}

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


{/* 합계 결과 표시 */}
{totalMargin && (
  <div
    style={{
      fontWeight: "bold",
      fontSize: "16px",
      marginBottom: "10px",
      color: "#1a630f",
    }}
  >
    💰 **최종 마진 총합:** {totalMargin.total} ¥  
    ({totalMargin.totalWon} ₩)

  </div>
)}

      {/* 결과 테이블 */}
      {matchedSummary.length > 0 ? (
        <div>
          <h3>📊 옵션별 수량 + 마진 계산 통합표</h3>
          <div className="legend">
            <p>🟢 결제금 16500엔 초과 (자동 5%)</p>
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
                const calc = calculateMargin(row);
                const isDuty = dutyApplied[row.option];
                const avgPay = Number(calc.avgPay);

                // 💡 색상 조건 분기
                let rowClass = "";
                if (isDuty && avgPay > 16500) {
                  rowClass = "dual-duty-row"; // 🔴 둘 다 해당 → 빨강
                } else if (avgPay > 16500) {
                  rowClass = "auto-duty-row"; // 🟢 자동 관세만 해당 → 초록
                } else if (isDuty) {
                  rowClass = "duty-row"; // 💜 기존 보라색 (옷 관세만)
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
                        style={{ width: "80px", textAlign: "right", height: "20px"}}
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
      ) : (
        summary.length > 0 && (
          <div>
            <h3>📋 옵션별 수량 합계</h3>
            <table className="margin-table">
              <thead>
                <tr>
                  <th>옵션정보</th>
                  <th>총 수량</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.option}</td>
                    <td>{row.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
{summary.length > 0 && (
      <button
  onClick={() => {
    if (matchedSummary.length === 0) {
      alert("먼저 마진 계산을 완료해주세요!");
      return;
    }

    // CSV 헤더
    const rows = [["옵션정보", "마진"]];

    // marginAvg 값 가져오기
    matchedSummary.forEach((row) => {
      const { marginAvg } = calculateMargin(row);
      rows.push([row.option, marginAvg]);
    });

    // ✅ UTF-8 BOM 추가
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      rows.map((e) => e.join(",")).join("\n");

    // 다운로드 트리거
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "margin_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }}
  className="mc-btn mc-btn-green"
>
  💾 CSV로 내보내기
</button>
)}

    </div>
  );
  
}

export default MarginCalculator;
