// 주문 목록, 수량 조정, 저장 → 자동저장 + 확인하기 버튼 버전
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function OrderTable({
  selectedEvent,
  eventOrders,
  setEventOrders,
  refreshCurrentEvent,
  highlightedOptions,
  setHighlightedOptions,
  agents,
}) {
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionQty, setNewOptionQty] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [margins, setMargins] = useState([]);
  const exchangeRate = 9.43;

  const totalFee = agents.reduce((sum, a) => sum + Number(a.fee || 0), 0);


  const handleSortByNeeded = async () => {
  const sorted = [...eventOrders].sort((a, b) => {
    const neededA = a.needed_qty ?? a.quantity ?? 0;
    const neededB = b.needed_qty ?? b.quantity ?? 0;

    // 1) 구매필요 1 이상 항목을 최상단으로
    if (neededA > 0 && neededB === 0) return -1;
    if (neededA === 0 && neededB > 0) return 1;

    // 2) 그 안에서는 기존 오름차순 규칙 적용
    const nameA = a.option_name?.trim() || "";
    const nameB = b.option_name?.trim() || "";
    const numA = parseInt(nameA.match(/\[(\d+)\]/)?.[1] || "");
    const numB = parseInt(nameB.match(/\[(\d+)\]/)?.[1] || "");

    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA) && isNaN(numB)) return -1;
    if (isNaN(numA) && !isNaN(numB)) return 1;

    return nameA.localeCompare(nameB, "ko", { numeric: true });
  });

  setEventOrders(sorted);

  // DB order_index 업데이트
  await Promise.all(
    sorted.map((row, i) =>
      supabase.from("orders").update({ order_index: i }).eq("id", row.id)
    )
  );
};

  // 🔥 자동 저장 함수
  const autoSave = async (row) => {
    await supabase
      .from("orders")
      .update({
        needed_qty: row.needed_qty ?? 0,
        proxy_qty: row.proxy_qty ?? 0,
        received_qty: row.received_qty ?? 0,
        quantity: row.needed_qty ?? 0,
      })
      .eq("id", row.id);
  };

  // 마지막 저장 시간 가져오기
  useEffect(() => {
    const fetchLastSavedTime = async () => {
      if (!selectedEvent) return;
      const { data } = await supabase
        .from("events")
        .select("last_saved_time")
        .eq("event_name", selectedEvent)
        .single();

      if (data?.last_saved_time) {
        const formatted = new Date(data.last_saved_time).toLocaleString("ko-KR", {
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastSavedTime(formatted);
      } else {
        setLastSavedTime(null);
      }
    };

    fetchLastSavedTime();
  }, [selectedEvent]);

  // 마진 데이터 가져오기
  useEffect(() => {
    const fetchMargins = async () => {
      if (!selectedEvent) return;
      const { data, error } = await supabase
        .from("margins")
        .select("option_name, margin")
        .eq("event_name", selectedEvent);

      if (!error) setMargins(data || []);
    };

    fetchMargins();
  }, [selectedEvent, refreshCurrentEvent]);

  if (!selectedEvent) {
    return (
      <div className="order-left-panel">
        <p className="placeholder-text">이벤트를 선택하면 주문 내역이 표시됩니다.</p>
      </div>
    );
  }

  if (eventOrders.length === 0) {
    return (
      <div className="order-left-panel">
        <h3>📦 {selectedEvent} 주문 내역</h3>
        <p className="placeholder-text">아직 주문 내역이 없습니다.</p>
      </div>
    );
  }

  // 변경 항목 강조 (빨간색 표시)
  const markAsChanged = (optionName) => {
    setHighlightedOptions((prev) =>
      prev.includes(optionName) ? prev : [...prev, optionName]
    );
  };

  // 총마진 계산
  const totalProfit = eventOrders.reduce((sum, row) => {
    const marginRow = margins.find((m) => m.option_name === row.option_name);
    const marginValue = marginRow ? marginRow.margin : 0;

    const needed = row.needed_qty ?? row.quantity ?? 0;
    const received = row.received_qty ?? 0;
    const total = needed + received;

    return sum + total * marginValue;
  }, 0);

  const totalProfitKRW = Math.round(totalProfit * exchangeRate);

  // 🔥 오름차순 정렬 그대로 유지
  const handleSort = async () => {
    const sorted = [...eventOrders].sort((a, b) => {
      const nameA = a.option_name?.trim() || "";
      const nameB = b.option_name?.trim() || "";

      const numA = parseInt(nameA.match(/\[(\d+)\]/)?.[1] || "");
      const numB = parseInt(nameB.match(/\[(\d+)\]/)?.[1] || "");

      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA) && isNaN(numB)) return -1;
      if (isNaN(numA) && !isNaN(numB)) return 1;

      return nameA.localeCompare(nameB, "ko", { numeric: true });
    });

    setEventOrders(sorted);

    await Promise.all(
      sorted.map((row, i) =>
        supabase.from("orders").update({ order_index: i }).eq("id", row.id)
      )
    );

    alert("옵션이 오름차순으로 정렬되었습니다.");
  };

  // 삭제
  const handleDelete = async (rowId) => {
    if (!window.confirm("이 항목을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", rowId);
    if (!error) await refreshCurrentEvent();
  };

  // 옵션 추가
  const handleAddOption = async () => {
  if (!newOptionName.trim()) {
    alert("옵션명을 입력해주세요!");
    return;
  }

  const validIndexes = eventOrders
    .map((o) => o.order_index)
    .filter((n) => Number.isFinite(n));
  const maxIndex = validIndexes.length ? Math.max(...validIndexes) + 1 : 0;

  const newRow = {
    event_name: selectedEvent,
    option_name: newOptionName.trim(),
    needed_qty: Number(newOptionQty) || 0,
    received_qty: 0,
    quantity: Number(newOptionQty) || 0,
    order_index: maxIndex,
  };

  const { error } = await supabase.from("orders").insert([newRow]);
  if (!error) {
    await refreshCurrentEvent();

    // 🔥 새로 추가된 옵션을 빨간색 강조 표시
    setHighlightedOptions((prev) => [...prev, newOptionName.trim()]);
  }

  setNewOptionName("");
  setNewOptionQty("");
};

  return (
    <div className="order-left-panel">
      <h3
        className="hide-on-mobile"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>📦 {selectedEvent} 주문 내역</span>
        <span style={{ fontSize: "15px", fontWeight: "600", color: "#4a764c" }}>
          환율 {exchangeRate} 기준, 마진: {totalProfit.toLocaleString()}円  
          (≈ {totalProfitKRW.toLocaleString()}원) / 수고비 {totalFee.toLocaleString()}₩
        </span>
      </h3>

      <table className="order-table">
        <thead>
          <tr>
            <th className="hide-on-mobile ">삭제</th>
            <th>옵션명</th>
            <th>구매필요</th>
            <th>대리완료</th>
            <th className="hide-on-mobile ">수령완료</th>
            <th className="hide-on-mobile ">전체</th>
          </tr>
        </thead>

        <tbody>
          {eventOrders.map((row, idx) => {
            const needed = row.needed_qty ?? row.quantity ?? 0;
            const proxy = row.proxy_qty ?? 0;
            const received = row.received_qty ?? 0;
            const total = needed + proxy + received;

            return (
              <tr
                key={row.id || idx}
                className={
                  highlightedOptions.includes(row.option_name)
                    ? "highlight-merged"
                    : ""
                }
              >
                <td className="delete-cell hide-on-mobile">
                  <button className="delete-btn" onClick={() => handleDelete(row.id)}>
                    🗑
                  </button>
                </td>

                <td className="option-name">
  {row.option_name.includes("TYPE:")
    ? (
      <>
        {/* TYPE 부분 줄바꿈 */}
        <div className="type-line">
          {row.option_name.split(" / ")[0]}
        </div>

        {/* OPTION 또는 MEMBER 부분 */}
        <div className="sub-line">
          {row.option_name.split(" / ").slice(1).join(" / ")}
        </div>
      </>
    )
    : row.option_name}
</td>


                {/* 구매필요 */}
                <td className="qty-cell1 ">
                  <button
                    className="qty-btn"
                    onClick={() => {
                      const updated = [...eventOrders];
                      updated[idx].needed_qty = needed - 1;

                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]); // 🔥 자동 저장
                    }}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={needed}
                    min="0"
                    className="qty-input"
                    onChange={(e) => {
                      const updated = [...eventOrders];
                      updated[idx].needed_qty = Number(e.target.value);
                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]);
                    }}
                  />

                  <button
                    className="qty-btn"
                    onClick={() => {
                      const updated = [...eventOrders];
                      updated[idx].needed_qty = needed + 1;
                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]);
                    }}
                  >
                    ＋
                  </button>
                </td>

                {/* 대리완료 */}
                <td className="qty-cell2">
                  <button
                    className="qty-btn"
                    onClick={() => {
                      const updated = [...eventOrders];
                      updated[idx].proxy_qty = proxy - 1;
                      updated[idx].needed_qty = needed + 1;
                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]);
                    }}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={proxy}
                    min="0"
                    className="qty-input"
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      const diff = newValue - proxy;

                      const updated = [...eventOrders];
                      updated[idx].proxy_qty = newValue;
                      updated[idx].needed_qty = Math.max(0, needed - diff);

                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]);
                    }}
                  />

                  <button
                    className="qty-btn"
                    onClick={() => {
                      const updated = [...eventOrders];
                      updated[idx].proxy_qty = proxy + 1;
                      updated[idx].needed_qty = needed - 1;


                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]);
                    }}
                  >
                    ＋
                  </button>
                </td>

                {/* 수령완료 */}
                <td className="qty-cell hide-on-mobile">
                  <button
                    className="qty-btn"
                    onClick={() => {
                      const updated = [...eventOrders];
                      const newReceived = received - 1;

                      updated[idx].received_qty = newReceived;
                      updated[idx].proxy_qty = proxy + 1;

                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]);
                    }}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={received}
                    min="0"
                    className="qty-input"
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      const diff = newValue - received;

                      const updated = [...eventOrders];
                      updated[idx].received_qty = newValue;
                      updated[idx].proxy_qty = Math.max(0, proxy - diff);

                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]);
                    }}
                  />

                  <button
                    className="qty-btn"
                    onClick={() => {
                      const updated = [...eventOrders];
                      const newReceived = received + 1;

                      updated[idx].received_qty = newReceived;
                      updated[idx].proxy_qty = proxy - 1;

                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                      autoSave(updated[idx]);
                    }}
                  >
                    ＋
                  </button>
                </td>

                <td className="hide-on-mobile" style={{ textAlign: "center" }}>
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 옵션 추가 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          margin: "12px 0",
        }}
      >
        <input
          type="text"
          placeholder="옵션명 입력"
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          style={{
            flex: 1,
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <input
          type="number"
          placeholder="구매필요 수량"
          value={newOptionQty}
          onChange={(e) => setNewOptionQty(e.target.value)}
          style={{
            width: "100px",
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            textAlign: "center",
          }}
        />

        <button className="mc-btn mc-btn-blue" onClick={handleAddOption}>
          항목 추가
        </button>
      </div>

      {lastSavedTime && (
        <p className="last-saved">마지막 저장 시각: {lastSavedTime}</p>
      )}

      {/* 자동 저장이므로 '저장하기' 대신 확인 버튼 */}
      <div className="order-bottom-actions">
        <button className="mc-btn mc-btn-green" onClick={handleSort}>
          오름차순 정렬
        </button>
        <button className="mc-btn mc-btn-green" onClick={handleSortByNeeded}>
        구매필요 정렬
        </button>

        <button
          className="mc-btn mc-btn-green"
          onClick={() => setHighlightedOptions([])}
        >
          확인하기
        </button>
      </div>
    </div>
  );
}

export default OrderTable;
