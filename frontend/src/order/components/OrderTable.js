import React, { useMemo, useCallback } from "react";
import { useOrderTable } from "../hooks/useOrderTable";
import { calculateTotalFee } from "../utils/calculationUtils";
import OrderTableRow from "./OrderTableRow";
import { EXCHANGE_RATES } from "../../constants/config";

const EXCHANGE_RATE = EXCHANGE_RATES.ORDER;

function OrderTable({
  selectedEvent,
  eventOrders,
  setEventOrders,
  refreshCurrentEvent,
  highlightedOptions,
  setHighlightedOptions,
  agents,
}) {
  const {
    newOptionName,
    setNewOptionName,
    newOptionQty,
    setNewOptionQty,
    lastSavedTime,
    mobileMode,
    setMobileMode,
    isMobile,
    totalProfit,
    totalProfitKRW,
    autoSave,
    handleSort,
    handleSortByNeeded,
    handleDelete,
    handleAddOption,
  } = useOrderTable(selectedEvent, eventOrders, setEventOrders, refreshCurrentEvent, agents);

  const totalFee = useMemo(() => calculateTotalFee(agents), [agents]);

  const markAsChanged = useCallback((optionName) => {
    setHighlightedOptions((prev) =>
      prev.includes(optionName) ? prev : [...prev, optionName]
    );
  }, [setHighlightedOptions]);

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
          환율 {EXCHANGE_RATE} 기준, 마진: {totalProfit.toLocaleString()}円 (≈{" "}
          {totalProfitKRW.toLocaleString()}원) / 수고비 {totalFee.toLocaleString()}₩
        </span>
      </h3>

      <table className="order-table">
        {isMobile && (
          <div style={{ marginBottom: "14px" }}>
            <select
              value={mobileMode}
              onChange={(e) => setMobileMode(e.target.value)}
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                border: "2px solid #8faaff",
                width: "100%",
                fontSize: "18px",
                fontWeight: "600",
                backgroundColor: "#f8faff",
                color: "#333",
              }}
            >
              <option value="sung">대찍아님!!!!!성한나강유나손현서</option>
              <option value="daejjik">대찍</option>
            </select>
          </div>
        )}

        <thead>
          <tr>
            <th className="hide-on-mobile">삭제</th>
            <th>옵션명</th>
            <th>구매필요</th>
            {!isMobile && <th>대리완료</th>}
            {isMobile && mobileMode === "sung" && <th>대리완료</th>}
            {!isMobile && <th>대찍완료</th>}
            {isMobile && mobileMode === "daejjik" && <th>대찍완료</th>}
            <th className="hide-on-mobile">정산완료</th>
            <th className="hide-on-mobile">전체</th>
          </tr>
        </thead>

        <tbody>
          {eventOrders.map((row, idx) => (
            <OrderTableRow
              key={row.id || idx}
              row={row}
              idx={idx}
              highlightedOptions={highlightedOptions}
              isMobile={isMobile}
              mobileMode={mobileMode}
              eventOrders={eventOrders}
              setEventOrders={setEventOrders}
              markAsChanged={markAsChanged}
              autoSave={autoSave}
              handleDelete={handleDelete}
            />
          ))}
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
