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

  // 저장 시간 불러오기
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

  // 마진 데이터 불러오기
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

  // 변경 항목 표시
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

  // 저장 로직
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

  // 오름차순 정렬
  const handleSort = async () => {
    const sorted = [...eventOrders].sort((a, b) => {
      const numA = parseInt(a.option_name.match(/\[(\d+)\]/)?.[1] || 0, 10);
      const numB = parseInt(b.option_name.match(/\[(\d+)\]/)?.[1] || 0, 10);
      return numA - numB;
    });
    setEventOrders(sorted);
    await Promise.all(
      sorted.map((row, i) =>
        supabase.from("orders").update({ order_index: i }).eq("id", row.id)
      )
    );
    alert("옵션이 번호 순으로 정렬되었습니다 ✅");
  };

  // 항목 삭제
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
    if (!error) await refreshCurrentEvent();
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
              <tr key={row.id || idx}>
                <td className="delete-cell">
                  <button className="delete-btn" onClick={() => handleDelete(row.id)}>
                    🗑
                  </button>
                </td>
                <td className="option-name">{row.option_name}</td>

                {/* 구매필요 */}
                <td className="qty-cell1">
                  <span className="qty-label mobile-only">📦 구매필요</span>
                  <button className="qty-btn" onClick={() => {
                    const updated = [...eventOrders];
                    updated[idx].needed_qty = Math.max(0, needed - 1);
                    setEventOrders(updated);
                    markAsChanged(row.option_name);
                  }}>−</button>
                  <input type="number" value={needed} min="0" className="qty-input"
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

                {/* 대리완료 */}
                <td className="qty-cell2">
                  <span className="qty-label mobile-only">✅ 대리완료</span>
                  <button className="qty-btn" onClick={() => {
                    const updated = [...eventOrders];
                    updated[idx].proxy_qty = Math.max(0, proxy - 1);
                    setEventOrders(updated);
                    markAsChanged(row.option_name);
                  }}>−</button>
                  <input type="number" value={proxy} min="0" className="qty-input"
                    onChange={(e) => {
                      const updated = [...eventOrders];
                      updated[idx].proxy_qty = Number(e.target.value);
                      setEventOrders(updated);
                      markAsChanged(row.option_name);
                    }}
                  />
                  <button className="qty-btn" onClick={() => {
                    const updated = [...eventOrders];
                    updated[idx].proxy_qty = proxy + 1;
                    setEventOrders(updated);
                    markAsChanged(row.option_name);
                  }}>＋</button>
                </td>

                {/* 수령완료 */}
                <td className="qty-cell">
                  <button className="qty-btn" onClick={() => {
                    const updated = [...eventOrders];
                    const newReceived = Math.max(0, received - 1);
                    updated[idx].received_qty = newReceived;
                    updated[idx].proxy_qty = proxy + 1; // ✅ 대리완료 복구
                    setEventOrders(updated);
                    markAsChanged(row.option_name);
                  }}>−</button>
                  <input type="number" value={received} min="0" className="qty-input"
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
                  <button className="qty-btn" onClick={() => {
                    const updated = [...eventOrders];
                    const newReceived = received + 1;
                    updated[idx].received_qty = newReceived;
                    updated[idx].proxy_qty = Math.max(0, proxy - 1);
                    setEventOrders(updated);
                    markAsChanged(row.option_name);
                  }}>＋</button>
                </td>

                <td style={{ textAlign: "center" }}>{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="order-bottom-actions">
        <button className="mc-btn mc-btn-green" onClick={handleSort}>오름차순 정렬</button>
        <button className="mc-btn mc-btn-green" onClick={handleSave}>저장하기</button>
      </div>
      {lastSavedTime && (
        <p className="last-saved">마지막 저장 시각: {lastSavedTime}</p>
      )}
    </div>
  );
}

export default OrderTable;
