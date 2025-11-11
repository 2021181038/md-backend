import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function AgentList({
  selectedEvent,
  agents,
  setAgents,
  eventOrders,
  setEventOrders,
  refreshCurrentEvent,
  openAddAgentModal,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [partialMode, setPartialMode] = useState(false);

  if (!selectedEvent) {
    return (
      <div className="order-right-panel">
        <p className="placeholder-text">이벤트를 선택하면 대리 구매자 목록이 표시됩니다.</p>
      </div>
    );
  }

  // ✅ 일부수령 (체크 시 바로 반영, 수량 포함)
  // ✅ 일부수령 토글 기능 (체크/해제 둘 다 반영)
const handlePartialReceive = async (agentId, optionName, qty, newValue) => {
  const updatedOrders = [...eventOrders];
  const target = updatedOrders.find((o) => o.option_name === optionName);
  if (!target) return;

  const needed = target.needed_qty ?? target.quantity ?? 0;
  const received = target.received_qty ?? 0;

  // ✅ 체크 여부에 따라 수량 조정
  const newNeeded = newValue
    ? Math.max(0, needed - qty) // 일부수령 시
    : needed + qty; // 취소 시 원상복귀
  const newReceived = newValue ? received + qty : Math.max(0, received - qty);

  // 프론트 반영
  target.needed_qty = newNeeded;
  target.received_qty = newReceived;
  target.quantity = newNeeded;
  setEventOrders(updatedOrders);

  // DB 반영
  await supabase
    .from("orders")
    .update({
      needed_qty: newNeeded,
      received_qty: newReceived,
      quantity: newNeeded,
    })
    .eq("event_name", selectedEvent)
    .eq("option_name", optionName);

  // Agent item 상태 업데이트
  const agent = agents.find((a) => a.id === agentId);
  if (agent) {
    const updatedItems = agent.items.map((it) =>
      it.option_name === optionName
        ? { ...it, is_partially_received: newValue }
        : it
    );

    await supabase.from("agents").update({ items: updatedItems }).eq("id", agentId);

    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, items: updatedItems } : a))
    );
  }
};


  // ✅ 수령 완료 (일부수령된 항목 제외)
  const handleReceive = async (agent) => {
  await supabase
    .from("agents")
    .update({ is_received: true, status: "배송완료" })
    .eq("id", agent.id);

  const updatedOrders = [...eventOrders];

  await Promise.all(
    agent.items.map(async (it) => {
      if (it.is_partially_received) return;

      const target = updatedOrders.find((o) => o.option_name === it.option_name);
      if (target) {
        const proxy = target.proxy_qty ?? 0;
        const received = target.received_qty ?? 0;

        // ✅ 대리완료 → 수령완료
        const newProxy = Math.max(0, proxy - it.qty);
        const newReceived = received + it.qty;

        // ✅ 구매필요는 그대로 두기
        const newNeeded = target.needed_qty ?? target.quantity ?? 0;

        target.proxy_qty = newProxy;
        target.received_qty = newReceived;
        target.needed_qty = newNeeded; // 변경 없음
        target.quantity = newNeeded;

        await supabase
          .from("orders")
          .update({
            proxy_qty: newProxy,
            received_qty: newReceived,
            needed_qty: newNeeded, // ❗ 변경 없이 그대로 저장
            quantity: newNeeded,
          })
          .eq("event_name", selectedEvent)
          .eq("option_name", target.option_name);
      }
    })
  );

  setEventOrders(updatedOrders);
  setAgents((prev) =>
    prev.map((a) =>
      a.id === agent.id ? { ...a, is_received: true, status: "배송완료" } : a
    )
  );

  await refreshCurrentEvent();
};



  // ✅ 수량 업데이트
  // ✅ 수량 업데이트 (Agent + OrderTable 연동)
const updateQty = async (agentId, itemIndex, newQty) => {
  // 프론트에 반영
  setAgents((prev) =>
    prev.map((ag) =>
      ag.id === agentId
        ? {
            ...ag,
            items: ag.items.map((it, i) =>
              i === itemIndex ? { ...it, qty: newQty } : it
            ),
          }
        : ag
    )
  );

  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return;

  const targetItem = agent.items[itemIndex];
  const oldQty = targetItem.qty ?? 0;
  const diff = newQty - oldQty; // 변경된 수량 차이 계산

  // ✅ Supabase - agents 업데이트
  const updatedItems = agent.items.map((it, i) =>
    i === itemIndex ? { ...it, qty: newQty } : it
  );
  await supabase.from("agents").update({ items: updatedItems }).eq("id", agentId);

  // ✅ Supabase - orders 반영
  const { data: order } = await supabase
    .from("orders")
    .select("id, proxy_qty")
    .eq("event_name", selectedEvent)
    .eq("option_name", targetItem.option_name)
    .maybeSingle();

  if (order) {
    const newProxy = Math.max(0, (order.proxy_qty ?? 0) + diff);
    await supabase
      .from("orders")
      .update({ proxy_qty: newProxy })
      .eq("id", order.id);

    // ✅ 프론트 eventOrders도 즉시 반영
    setEventOrders((prev) =>
      prev.map((o) =>
        o.option_name === targetItem.option_name
          ? { ...o, proxy_qty: newProxy }
          : o
      )
    );
  }
};


  // ✅ 상태 변경
  const handleStatusChange = async (agentId, newStatus) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: newStatus } : a))
    );
    await supabase.from("agents").update({ status: newStatus }).eq("id", agentId);
  };

  // ✅ 구매자 삭제
  const handleDelete = async (agentId) => {
    const target = agents.find((a) => a.id === agentId);
    if (!target) return;

    if (!window.confirm(`'${target.nickname}' 구매자를 삭제하시겠습니까?`)) return;

    const { error } = await supabase.from("agents").delete().eq("id", agentId);
    if (!error) {
      alert("삭제 완료 ✅");
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
    } else {
      alert("삭제 실패 ❌");
    }
  };

  // ✅ 구매자 상세 렌더링
  const renderAgentDetail = (agent) => {
    if (!expandedId || expandedId !== agent.id) return null;
    if (!agent.items || agent.items.length === 0)
      return <p className="placeholder-text">항목 없음</p>;

    return (
      <div className="agent-item-detail">
        {agent.items.map((it, i) => (
          <div
            key={i}
            className="agent-item-option"
            style={{
              textDecoration: it.is_partially_received ? "line-through" : "none",
              opacity: it.is_partially_received ? 0.5 : 1,
            }}
          >
            {/* ✅ 체크박스 - 일부수령 */}
            {partialMode && (
              <input
                type="checkbox"
                checked={!!it.is_partially_received}
                style={{ marginRight: "8px", cursor: "pointer" }}
                onClick={(e) => e.stopPropagation()} // 창 닫힘 방지
                onChange={async (e) => {
                  e.stopPropagation();
                  const newValue = e.target.checked; // true → 일부수령 / false → 취소
                  await handlePartialReceive(agent.id, it.option_name, it.qty, newValue);
                }}
              />
            )}



            <span className="option-name">{it.option_name}</span>

            <div className="option-controls">
              <button
                className="qty-btn"
                disabled={it.is_partially_received}
                style={{
                  opacity: it.is_partially_received ? 0.4 : 1,
                  cursor: it.is_partially_received ? "not-allowed" : "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (it.is_partially_received) return;
                  updateQty(agent.id, i, Math.max(0, it.qty - 1));
                }}
              >
                −
              </button>

              <span className="qty-number">{it.qty}</span>

              <button
                className="qty-btn"
                disabled={it.is_partially_received}
                style={{
                  opacity: it.is_partially_received ? 0.4 : 1,
                  cursor: it.is_partially_received ? "not-allowed" : "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (it.is_partially_received) return;
                  updateQty(agent.id, i, it.qty + 1);
                }}
              >
                ＋
              </button>
            </div>
          </div>
        ))}

        {/* 하단 버튼 */}
        <div className="agent-item-actions">
          <button
            className="delete-icon-btn"
            title="삭제하기"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(agent.id);
            }}
          >
            🗑
          </button>

          <button
            className="mc-btn mc-btn-blue"
            onClick={(e) => {
              e.stopPropagation();
              setPartialMode(!partialMode);
            }}
          >
            {partialMode ? "일부수령 OFF" : "일부수령 ON"}
          </button>

          <button
            className="mc-btn mc-btn-blue"
            onClick={(e) => {
              e.stopPropagation();
              openAddAgentModal();
            }}
          >
            옵션 추가
          </button>
          <button
            className="mc-btn mc-btn-green agent-receive-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleReceive(agent);
            }}
          >
            수령완료
          </button>
        </div>
      </div>
    );
  };

  // ✅ 전체 렌더링
  return (
    <div className="order-right-panel">
      <div className="agent-header">
        <h3>👥 대리 구매 리스트</h3>
        <button
          className="mc-btn mc-btn-blue"
          onClick={(e) => {
            e.stopPropagation();
            openAddAgentModal();
          }}
        >
          ＋ 구매자 추가
        </button>
      </div>

      {/* 📦 수령 전 */}
      <h4 className="agent-section-title">수령 전</h4>
      <div className="agent-section-box">
        <div className="agent-list-wrapper">
          {agents.filter((a) => !a.is_received).length > 0 ? (
            <ul className="product-list">
              {agents
                .filter((a) => !a.is_received)
                .map((a) => (
                  <li
                    key={a.id}
                    className="agent-item"
                    onClick={() =>
                      setExpandedId(expandedId === a.id ? null : a.id)
                    }
                  >
                    <div className="agent-row">
                      <div className="agent-info-wrapper">
                        <span className="agent-info-left" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
  <span>[{a.contact_type}] {a.nickname} -</span>
  <select
    value={a.status}
    onClick={(e) => e.stopPropagation()}
    onChange={(e) => {
      e.stopPropagation();
      handleStatusChange(a.id, e.target.value);
    }}
    className="status-select"
    style={{ height: "24px", fontSize: "13px" }}
  >
    <option value="입금전">입금전</option>
    <option value="입금완료">입금완료</option>
    <option value="배송완료">배송완료</option>
  </select>

  {/* ✅ 수고비 입력칸 (옆에 붙이기) */}
  <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    수고비(₩):
    <input
      type="number"
      value={a.fee || 0}
      onClick={(e) => e.stopPropagation()}
      onChange={async (e) => {
        const newFee = Number(e.target.value);
        await supabase.from("agents").update({ fee: newFee }).eq("id", a.id);
        const updated = agents.map((ag) =>
          ag.id === a.id ? { ...ag, fee: newFee } : ag
        );
        setAgents(updated);
      }}
      style={{
        width: "70px",
        textAlign: "right",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "2px 4px",
        height: "20px",
        fontSize: "13px",
      }}
    />
  </label>
</span>

                        <span className="agent-info-right">by {a.manager}</span>
                      </div>
                      
                    </div>
                    {renderAgentDetail(a)}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="placeholder-text">수령 전 구매자가 없습니다.</p>
          )}
        </div>
      </div>

      {/* ✅ 수령 완료 */}
      <h4 className="agent-section-title">수령 완료</h4>
      <div className="agent-section-box">
        <div className="agent-list-wrapper">
          {agents.filter((a) => a.is_received).length > 0 ? (
            <ul className="product-list">
              {agents
                .filter((a) => a.is_received)
                .map((a) => (
                  <li
                    key={a.id}
                    className="agent-item"
                    onClick={() =>
                      setExpandedId(expandedId === a.id ? null : a.id)
                    }
                  >
                    <div className="agent-info-wrapper">
                      <span className="agent-info-left">
                        [{a.contact_type}] {a.nickname}
                      </span>
                      <span className="agent-info-right">by {a.manager}</span>
                    </div>
                    {expandedId === a.id && a.items && (
                      <ul className="agent-item-detail">
                        {a.items.map((it, i) => (
                          <li key={i} className="agent-item-line">
                            ・{it.option_name} × {it.qty}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="placeholder-text">수령 완료된 구매자가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentList;
