// 주문 목록, 수량 조정, 저장
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

  // ✅ 저장 시간 불러오기
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
      } else setLastSavedTime(null);
    };
    fetchLastSavedTime();
  }, [selectedEvent]);

  // ✅ 마진 데이터 불러오기
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

  // ✅ 변경 항목 표시
  const markAsChanged = (optionName) => {
    setHighlightedOptions((prev) =>
      prev.includes(optionName) ? prev : [...prev, optionName]
    );
  };

  // ✅ 총마진 계산
  const totalProfit = eventOrders.reduce((sum, row) => {
    const marginRow = margins.find((m) => m.option_name === row.option_name);
    const marginValue = marginRow ? marginRow.margin : 0;
    const needed = row.needed_qty ?? row.quantity ?? 0;
    const received = row.received_qty ?? 0;
    const total = needed + received;
    return sum + total * marginValue;
  }, 0);
  const totalProfitKRW = Math.round(totalProfit * exchangeRate);

  // ✅ 저장 로직
  const handleSave = async () => {
    if (!selectedEvent) return;
    let hasError = false;

    await Promise.all(
      eventOrders.map(async (row) => {
        const { error } = await supabase
          .from("orders")
          .update({
            needed_qty: row.needed_qty ?? 0,
            proxy_qty: row.proxy_qty ?? 0,
            received_qty: row.received_qty ?? 0,
            quantity: row.needed_qty ?? 0,
          })
          .eq("id", row.id);
        if (error) hasError = true;
      })
    );

    if (hasError) {
      alert("일부 데이터 저장 오류!");
      return;
    }

    const now = new Date();
    const formattedIso = now.toISOString();
    const formattedDisplay = now.toLocaleString("ko-KR", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    await supabase
      .from("events")
      .update({ last_saved_time: formattedIso })
      .eq("event_name", selectedEvent);

    setLastSavedTime(formattedDisplay);
    setHighlightedOptions([]);
    await refreshCurrentEvent();

    alert("저장 완료 ✅");
  };

  // ✅ 오름차순 정렬
  const handleSort = async () => {
  const sorted = [...eventOrders].sort((a, b) => {
    const nameA = a.option_name?.trim() || "";
    const nameB = b.option_name?.trim() || "";

    // 1️⃣ 숫자 추출
    const numA = parseInt(nameA.match(/\[(\d+)\]/)?.[1] || "");
    const numB = parseInt(nameB.match(/\[(\d+)\]/)?.[1] || "");

    // 2️⃣ 둘 다 숫자 있으면 숫자 우선 정렬
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    // 3️⃣ 하나만 숫자 있으면 숫자가 먼저 오게
    if (!isNaN(numA) && isNaN(numB)) return -1;
    if (isNaN(numA) && !isNaN(numB)) return 1;

    // 4️⃣ 한글, 영어 모두 localeCompare 로 비교
    return nameA.localeCompare(nameB, "ko", { numeric: true });
  });

  setEventOrders(sorted);

  // DB에도 순서 반영
  await Promise.all(
    sorted.map((row, i) =>
      supabase.from("orders").update({ order_index: i }).eq("id", row.id)
    )
  );

  alert("옵션이 오름차순으로 정렬되었습니다 ✅");
};


  // ✅ 항목 삭제
  const handleDelete = async (rowId) => {
    if (!window.confirm("이 항목을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", rowId);
    if (!error) await refreshCurrentEvent();
  };

  // ✅ 옵션 추가
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
    if (!error) await refreshCurrentEvent();
    setNewOptionName("");
    setNewOptionQty("");
  };

  return (
    <div className="order-left-panel">
      {/* 상단 제목 */}
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
            <th>삭제</th>
            <th>옵션명</th>
            <th>구매필요</th>
            <th>대리완료</th>
            <th>수령완료</th>
            <th>전체</th>
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
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(row.id)}
                  >
                    🗑
                  </button>
                </td>

                <td className="option-name">{row.option_name}</td>

                <td className="qty-cell1 hide-on-mobile">
          <button className="qty-btn" onClick={() => {
            const updated = [...eventOrders];
            updated[idx].needed_qty = Math.max(0, needed - 1);
            setEventOrders(updated);
            markAsChanged(row.option_name);
          }}>−</button>
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
            }}
          />
          <button className="qty-btn" onClick={() => {
            const updated = [...eventOrders];
            updated[idx].needed_qty = needed + 1;
            setEventOrders(updated);
            markAsChanged(row.option_name);
          }}>＋</button>
        </td>

        <td className="qty-cell2 hide-on-mobile">
          <button className="qty-btn" onClick={() => {
            const updated = [...eventOrders];
            updated[idx].proxy_qty = Math.max(0, proxy - 1);
            updated[idx].needed_qty = needed + 1;
            setEventOrders(updated);
            markAsChanged(row.option_name);
          }}>−</button>
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
            }}
          />
          <button className="qty-btn" onClick={() => {
            const updated = [...eventOrders];
            updated[idx].proxy_qty = proxy + 1;
            updated[idx].needed_qty = Math.max(0, needed - 1);
            setEventOrders(updated);
            markAsChanged(row.option_name);
          }}>＋</button>
        </td>

        {/* 📱 모바일 전용: 한 줄 정렬 */}
        <td className="show-on-mobile" colSpan="3">
          <div className="mobile-qty-row">
            {/* 📦 구매필요 */}
            <div className="qty-group">
              <span className="qty-label">필요</span>
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => {
                  const updated = [...eventOrders];
                  updated[idx].needed_qty = Math.max(0, needed - 1);
                  setEventOrders(updated);
                  markAsChanged(row.option_name);
                }}>−</button>
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
                  }}
                />
                <button className="qty-btn" onClick={() => {
                  const updated = [...eventOrders];
                  updated[idx].needed_qty = needed + 1;
                  setEventOrders(updated);
                  markAsChanged(row.option_name);
                }}>＋</button>
              </div>
            </div>

            {/* ✅ 대리완료 */}
            <div className="qty-group">
              <span className="qty-label">완료</span>
              <div className="qty-controls">
                <button className="qty-btn" onClick={() => {
                  const updated = [...eventOrders];
                  updated[idx].proxy_qty = Math.max(0, proxy - 1);
                  updated[idx].needed_qty = needed + 1;
                  setEventOrders(updated);
                  markAsChanged(row.option_name);
                }}>−</button>
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
                  }}
                />
                <button className="qty-btn" onClick={() => {
                  const updated = [...eventOrders];
                  updated[idx].proxy_qty = proxy + 1;
                  updated[idx].needed_qty = Math.max(0, needed - 1);
                  setEventOrders(updated);
                  markAsChanged(row.option_name);
                }}>＋</button>
              </div>
            </div>
          </div>
        </td>


                {/* 📦 수령완료 */}
                <td className="qty-cell hide-on-mobile">
                  <button
                    className="qty-btn"
                    onClick={() => {
                      const updated = [...eventOrders];
                      const newReceived = Math.max(0, received - 1);
                      updated[idx].received_qty = newReceived;
                      updated[idx].proxy_qty = proxy + 1;
                      setEventOrders(updated);
                      markAsChanged(row.option_name);
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
                    }}
                  />
                  <button
                    className="qty-btn"
                    onClick={() => {
                      const updated = [...eventOrders];
                      const newReceived = received + 1;
                      updated[idx].received_qty = newReceived;
                      updated[idx].proxy_qty = Math.max(0, proxy - 1);
                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                    }}
                  >
                    ＋
                  </button>
                </td>

                <td 
                className="hide-on-mobile"
                style={{ textAlign: "center" }}>
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ✅ 옵션 추가 입력창 복원 */}
      <div
        className="hide-on-mobile"
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

      <div className="order-bottom-actions">
        <button className="mc-btn mc-btn-green hide-on-mobile" onClick={handleSort}>
          오름차순 정렬
        </button>
        <button className="mc-btn mc-btn-green" onClick={handleSave}>
          저장하기
        </button>
      </div>
    </div>
  );
}

export default OrderTable;
