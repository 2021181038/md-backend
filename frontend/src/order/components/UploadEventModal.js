//새 이벤트 등록 (CSV 업로드)
import React, { useState } from "react";
import Papa from "papaparse";
import { supabase } from "../supabaseClient";

function UploadEventModal({ closeModal, fetchEventList }) {
  const [eventName, setEventName] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [summary, setSummary] = useState([]);

  // ✅ CSV 파일 업로드
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      encoding: "UTF-8",
      complete: (result) => {
        const data = result.data.filter(
          (row) => row["상품명"] || row["Product Name"] || row["Name"]
        );
        setCsvData(data);

        const names = [
          ...new Set(
            data.map((row) => row["상품명"] || row["Product Name"] || row["Name"])
          ),
        ].sort((a, b) => a.localeCompare(b, "ko"));

        setProductNames(names);
      },
    });
  };

  // ✅ 상품 선택 토글
  const toggleSelect = (name) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // ✅ 선택된 상품만 수합
  const handleSummarize = () => {
    const filtered = csvData.filter((row) =>
      selectedNames.includes(row["상품명"] || row["Product Name"] || row["Name"])
    );

    const merged = {};
    filtered.forEach((row) => {
      const option = row["옵션정보"] || row["Option"] || "기타";
      const qty = Number(row["수량"] || row["Qty"] || 0);
      merged[option] = (merged[option] || 0) + qty;
    });

    const summaryArr = Object.entries(merged).map(([option, qty]) => ({
      option,
      qty,
    }));

    // [숫자] 기준 정렬
    summaryArr.sort((a, b) => {
      const numA = parseInt(a.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
      const numB = parseInt(b.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
      return numA - numB;
    });

    setSummary(summaryArr);
  };

  // ✅ 수량 직접 수정
  const handleQtyChange = (idx, newQty) => {
    const updated = [...summary];
    updated[idx].qty = Math.max(0, Number(newQty) || 0);
    setSummary(updated);
  };

  // ✅ Supabase 저장
  const handleSave = async () => {
    if (!eventName.trim()) {
      alert("이벤트명을 입력하세요!");
      return;
    }
    if (summary.length === 0) {
      alert("먼저 상품 수합을 완료해주세요!");
      return;
    }

    // 중복 이벤트 확인
    const { data: exists } = await supabase
      .from("events")
      .select("event_name")
      .eq("event_name", eventName);

    if (exists?.length > 0) {
      alert("이미 같은 이벤트명이 존재합니다!");
      return;
    }

    // 이벤트 생성
    const { error: eventErr } = await supabase
      .from("events")
      .insert([{ event_name: eventName }]);

    if (eventErr) {
      alert("이벤트 저장 오류!");
      return;
    }

    // 주문 데이터 저장
    const insertData = summary.map((row, idx) => ({
      event_name: eventName,
      option_name: row.option,
      needed_qty: row.qty,
      proxy_qty: 0,
      received_qty: 0,
      quantity: row.qty, // 호환용
      order_index: idx,
    }));


    const { error: orderErr } = await supabase.from("orders").insert(insertData);
    if (orderErr) {
      alert("주문 저장 오류!");
      return;
    }

    alert("✅ 이벤트가 성공적으로 등록되었습니다!");
    fetchEventList();
    closeModal();
  };

  const handleClose = () => {
    setEventName("");
    setCsvData([]);
    setProductNames([]);
    setSelectedNames([]);
    setSummary([]);
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>📦 새 이벤트 등록</h3>
          <input
            type="text"
            placeholder="이벤트명 입력"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        <div className="modal-body">
          <div className="upload-section">
            <h3>CSV 주문 파일 업로드</h3>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>

          {/* ✅ 상품 선택 */}
          {productNames.length > 0 && (
            <>
              <h3>상품 선택</h3>
              <div className="button-row" style={{ marginBottom: "8px" }}>
                <button
                  onClick={() => setSelectedNames([])}
                  className="mc-btn mc-btn-blue"
                >
                  모두 해제
                </button>
                <button
                  onClick={handleSummarize}
                  className="mc-btn mc-btn-green"
                  disabled={selectedNames.length === 0}
                >
                  선택 상품 수합하기
                </button>
              </div>
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
            </>
          )}

          {/* ✅ 수합 결과 */}
          {summary.length > 0 && (
            <>
              <h3>📊 수합 결과</h3>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>옵션명</th>
                    <th>총 수량</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.option}</td>
                      <td className="qty-cell">
                        <button
                          className="qty-btn"
                          onClick={() => handleQtyChange(idx, row.qty - 1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={row.qty}
                          onChange={(e) =>
                            handleQtyChange(idx, e.target.value)
                          }
                          className="qty-input"
                        />
                        <button
                          className="qty-btn"
                          onClick={() => handleQtyChange(idx, row.qty + 1)}
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* ✅ 하단 버튼 */}
        <div className="modal-footer-fixed">
          <button className="mc-btn mc-btn-blue" onClick={handleSave}>
            저장하기
          </button>
          <button className="mc-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadEventModal;
