import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function AddOptionModal({ closeModal, eventOrders, agent, setAgents, setEventOrders, selectedEvent }) {
  const [localQty, setLocalQty] = useState(
    eventOrders.reduce((acc, o) => ({ ...acc, [o.option_name]: 0 }), {})
  );

  const handleConfirm = async () => {
    let updatedOrders = [...eventOrders];

    for (const optionName in localQty) {
      const qty = Number(localQty[optionName] || 0);
      if (qty <= 0) continue;

      const target = updatedOrders.find((o) => o.option_name === optionName);
      if (!target) continue;

      const newNeeded = Math.max(0, target.needed_qty - qty);
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
      prev.map((a) => (a.id === agent.id ? { ...a, items: updatedItems } : a))
    );

    setEventOrders(updatedOrders);
    closeModal();
  };

  return (
    <div className="modal-overlay simple">
      <div className="modal-container simple">
        <h2 className="modal-title">옵션 추가</h2>

        <div>
          {eventOrders.map((o) => (
            <div key={o.option_name} style={{ marginBottom: "8px" }}>
              <strong>{o.option_name}</strong>
              <input
                type="number"
                min="0"
                value={localQty[o.option_name]}
                onChange={(e) =>
                  setLocalQty({ ...localQty, [o.option_name]: Number(e.target.value) })
                }
                style={{ marginLeft: "10px", width: "60px" }}
              />
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={closeModal}>취소</button>
          <button className="mc-btn mc-btn-blue" onClick={handleConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddOptionModal;
