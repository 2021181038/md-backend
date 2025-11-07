//기존 이벤트 병합 반영
import React, { useState } from "react";
import Papa from "papaparse";
import { supabase } from "../supabaseClient";

function MergeEventModal({
  closeModal,
  eventList,
  selectedEvent,
  refreshCurrentEvent,
  setHighlightedOptions,
}) {
  const [mergeCsvData, setMergeCsvData] = useState([]);
  const [mergeProductNames, setMergeProductNames] = useState([]);
  const [mergeAssignments, setMergeAssignments] = useState({});

  // ✅ CSV 업로드
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
        setMergeCsvData(data);

        const names = [
          ...new Set(
            data.map(
              (row) => row["상품명"] || row["Product Name"] || row["Name"]
            )
          ),
        ].sort((a, b) => a.localeCompare(b, "ko"));

        setMergeProductNames(names);
        setMergeAssignments(Object.fromEntries(names.map((n) => [n, ""])));
      },
    });
  };

  // ✅ 병합 저장
  const handleMerge = async () => {
    if (mergeProductNames.length === 0) {
      alert("CSV 데이터를 먼저 업로드하세요!");
      return;
    }

    const grouped = {};
    const newlyAdded = [];

    // 상품별 → 이벤트별로 분배
    for (const name of mergeProductNames) {
      const targetEvent = mergeAssignments[name];
      if (!targetEvent) continue;

      const filtered = mergeCsvData.filter(
        (row) =>
          (row["상품명"] || row["Product Name"] || row["Name"]) === name
      );

      const merged = {};
      filtered.forEach((row) => {
        const option = row["옵션정보"] || row["Option"] || "기타";
        const qty = Number(row["수량"] || row["Qty"] || 0);
        merged[option] = (merged[option] || 0) + qty;
      });

      grouped[targetEvent] = [
        ...(grouped[targetEvent] || []),
        ...Object.entries(merged).map(([option_name, qty]) => ({
          option_name,
          qty,
        })),
      ];
    }

    // ✅ Supabase 반영
    for (const [eventName, orders] of Object.entries(grouped)) {
      for (const row of orders) {
        const { data: existing } = await supabase
          .from("orders")
          .select(
            "id, needed_qty, proxy_qty, received_qty, quantity, order_index"
          )
          .eq("event_name", eventName)
          .eq("option_name", row.option_name)
          .maybeSingle();

        if (existing) {
          // 이미 존재 → 수량 합산
          await supabase
            .from("orders")
            .update({
              needed_qty:
                (existing.needed_qty ?? existing.quantity ?? 0) + row.qty,
              quantity: (existing.quantity ?? 0) + row.qty, // 호환용
            })
            .eq("id", existing.id);
        } else {
          // 신규 추가 → 전체 필드 포함
          const { data: maxData } = await supabase
            .from("orders")
            .select("order_index")
            .eq("event_name", eventName)
            .order("order_index", { ascending: false })
            .limit(1)
            .maybeSingle();

          const nextIndex =
            maxData?.order_index != null ? maxData.order_index + 1 : 0;

          await supabase.from("orders").insert([
            {
              event_name: eventName,
              option_name: row.option_name,
              needed_qty: row.qty,
              proxy_qty: 0,
              received_qty: 0,
              quantity: row.qty,
              order_index: nextIndex,
            },
          ]);
        }

        newlyAdded.push(row.option_name);
      }
    }

    // ✅ 병합 완료 후 반영
    if (newlyAdded.length > 0) {
      setHighlightedOptions([...newlyAdded]);
    }

    alert("✅ 선택한 이벤트들에 주문이 병합되었습니다!");
    if (selectedEvent) await refreshCurrentEvent();
    handleClose(); // 닫기 실행
  }; // ✅ ← 중괄호 닫기 추가

  // ✅ 닫기 핸들러
  const handleClose = () => {
    setMergeCsvData([]);
    setMergeProductNames([]);
    setMergeAssignments({});
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>↔ 기존 이벤트 병합</h3>
        </div>

        <div className="modal-body">
          <div className="upload-section">
            <h3>📄 주문 CSV 업로드</h3>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>

          {/* ✅ 상품별 이벤트 배정 */}
          {mergeProductNames.length > 0 && (
            <>
              <h3>📦 상품별 이벤트 연결</h3>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>상품명</th>
                    <th>이벤트 선택</th>
                  </tr>
                </thead>
                <tbody>
                  {mergeProductNames.map((name, idx) => (
                    <tr key={idx}>
                      <td>{name}</td>
                      <td>
                        <select
                          value={mergeAssignments[name] || ""}
                          onChange={(e) =>
                            setMergeAssignments((prev) => ({
                              ...prev,
                              [name]: e.target.value,
                            }))
                          }
                        >
                          <option value="">반영 안 함</option>
                          {eventList.map((ev) => (
                            <option key={ev.event_name} value={ev.event_name}>
                              {ev.event_name}
                            </option>
                          ))}
                        </select>
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
          <button className="mc-btn mc-btn-blue" onClick={handleMerge}>
            반영하기
          </button>
          <button className="mc-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MergeEventModal;
