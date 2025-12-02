// 옵션 추가 모달
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function AddOptionModal({
  closeModal,
  eventOrders,
  agent,
  setAgents,
  setEventOrders,
  selectedEvent,
}) {
  const [localQty, setLocalQty] = useState(
    eventOrders.reduce((acc, o) => ({ ...acc, [o.option_name]: 0 }), {})
  );

  // ================================
  // 저장 로직
  // ================================
  const handleConfirm = async () => {
    let updatedOrders = [...eventOrders];

    for (const optionName in localQty) {
      const qty = Number(localQty[optionName] || 0);
      if (qty <= 0) continue;

      const target = updatedOrders.find((o) => o.option_name === optionName);
      if (!target) continue;

      // 🔥 needed_qty 감소 (0 미만 허용)
      const newNeeded = target.needed_qty - qty;
      const newProxy = (target.proxy_qty ?? 0) + qty;

      target.needed_qty = newNeeded;
      target.proxy_qty = newProxy;
      target.quantity = newNeeded;

      await supabase
        .from("orders")
        .update({
          needed_qty: newNeeded,
          proxy_qty: newProxy,
          quantity: newNeeded,
        })
        .eq("event_name", selectedEvent)
        .eq("option_name", optionName);
    }

    // 🔥 Agent에 옵션 추가
    const updatedItems = [
      ...agent.items,
      ...Object.keys(localQty)
        .filter((k) => localQty[k] > 0)
        .map((k) => ({
          option_name: k,
          qty: localQty[k],
          is_partially_received: false,
        })),
    ];

    await supabase.from("agents").update({ items: updatedItems }).eq("id", agent.id);

    setAgents((prev) =>
      prev.map((a) =>
        a.id === agent.id ? { ...a, items: updatedItems } : a
      )
    );

    setEventOrders(updatedOrders);
    closeModal();
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="modal-overlay simple">
      <div className="modal-container simple">
        <h2 className="modal-title">옵션 추가</h2>

        <div className="option-list">
          {eventOrders.map((o) => (
            <div className="option-item-row" key={o.option_name}>
              <span className="option-name">{o.option_name}</span>

              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                className="option-input"
                value={localQty[o.option_name]}
                placeholder="0"
                onChange={(e) =>
                  setLocalQty({
                    ...localQty,
                    [o.option_name]: Number(e.target.value),
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="mc-btn" onClick={closeModal}>
            취소
          </button>
          <button className="mc-btn mc-btn-blue" onClick={handleConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddOptionModal;
