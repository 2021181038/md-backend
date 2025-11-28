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
  openAddOptionModal,
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
const handlePartialReceive = async (agentId, itemIndex, optionName, qty, newValue) => {
  const updatedOrders = [...eventOrders];
  const target = updatedOrders.find((o) => o.option_name === optionName);
  if (!target) return;

  const proxy = target.proxy_qty ?? 0;
  const received = target.received_qty ?? 0;

  // 음수 허용 버전
  const newProxy = newValue ? proxy - qty : proxy + qty;
  const newReceived = newValue ? received + qty : received - qty;

  target.proxy_qty = newProxy;
  target.received_qty = newReceived;
  setEventOrders(updatedOrders);

  // 🔥 여기! option_name 기준 → index 기준
  const agent = agents.find((a) => a.id === agentId);
  if (agent) {
    const updatedItems = agent.items.map((it, idx) =>
      idx === itemIndex
        ? { ...it, is_partially_received: newValue }
        : it
    );

    await supabase.from("agents").update({ items: updatedItems }).eq("id", agentId);

    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, items: updatedItems } : a
      )
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
        const newProxy = proxy - it.qty;
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
// ✅ 수량 업데이트 (Agent + OrderTable 연동)
const updateQty = async (agentId, itemIndex, newQty) => {
  // 프론트 반영
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
  const diff = newQty - oldQty; // +1 또는 -1

  // Supabase - agents 업데이트
  const updatedItems = agent.items.map((it, i) =>
    i === itemIndex ? { ...it, qty: newQty } : it
  );
  await supabase.from("agents").update({ items: updatedItems }).eq("id", agentId);

  // Supabase - orders 반영
  const { data: order } = await supabase
    .from("orders")
    .select("id, proxy_qty, needed_qty")
    .eq("event_name", selectedEvent)
    .eq("option_name", targetItem.option_name)
    .maybeSingle();

  if (order) {
    const newProxy = (order.proxy_qty ?? 0) + diff;
    const newNeeded = (order.needed_qty ?? 0) - diff;

    await supabase
      .from("orders")
      .update({
        proxy_qty: newProxy,
        needed_qty: newNeeded,
        quantity: newNeeded, // quantity = needed
      })
      .eq("id", order.id);

    // 프론트 eventOrders 업데이트
    setEventOrders((prev) =>
      prev.map((o) =>
        o.option_name === targetItem.option_name
          ? { ...o, proxy_qty: newProxy, needed_qty: newNeeded, quantity: newNeeded }
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
              openAddOptionModal(agent);
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
    <div className="order-right-panel hide-on-mobile">
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
  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
>
  {/* ⭐ 상단: 연락수단 / 닉네임 / 수고비 / 결제상태 / 담당자 */}
  <div className="agent-header-line">
    <div className="agent-left-info">
      <span className="agent-title">
        [{a.contact_type}] {a.nickname} -
      </span>

      <input
        type="number"
        className="agent-fee-input"
        value={a.fee === 0 ? "" : a.fee}
        placeholder={a.fee === 0 ? "수고비입력 X" : ""}
        onClick={(e) => e.stopPropagation()}
        onChange={async (e) => {
          const newFee = Number(e.target.value) || 0;
          await supabase.from("agents").update({ fee: newFee }).eq("id", a.id);

          setAgents((prev) =>
            prev.map((ag) =>
              ag.id === a.id ? { ...ag, fee: newFee } : ag
            )
          );
        }}
      />

      <select
        className="agent-status-select"
        value={a.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          handleStatusChange(a.id, e.target.value);
        }}
      >
        <option value="입금전">입금전</option>
        <option value="입금완료">입금완료</option>
        <option value="배송완료">배송완료</option>
      </select>
    </div>

    <div className="agent-right-info">by {a.manager}</div>
  </div>

  {/* ⭐ 옵션 리스트 */}
  {expandedId === a.id && (
    <div className="agent-option-list">
      {a.items.map((it, i) => (
  <div
    key={i}
    className="agent-option-row"
    style={{
      textDecoration: it.is_partially_received ? "line-through" : "none",
      opacity: it.is_partially_received ? 0.5 : 1,
    }}
  >

    {/* ✅ 일부수령 체크박스 */}
    {partialMode && (
      <input
        type="checkbox"
        checked={!!it.is_partially_received}
        style={{ marginRight: "8px", cursor: "pointer" }}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const checked = e.target.checked;
          handlePartialReceive(a.id, i, it.option_name, it.qty, checked);
        }}

      />
    )}

    {/* 옵션명 */}
    <span className="opt-name">{it.option_name}</span>

    {/* 수량 조절 */}
    <div className="opt-qty-box">
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
          updateQty(a.id, i, it.qty - 1);
        }}
      >
        −
      </button>

      <span className="qty-num">{it.qty}</span>

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
          updateQty(a.id, i, it.qty + 1);
        }}
      >
        ＋
      </button>
    </div>
  </div>
))}

    </div>
  )}

  {/* ⭐ 하단 버튼들 */}
  {expandedId === a.id && (
    <div className="agent-footer-line">
      <button
        className="delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(a.id);
        }}
      >
        🗑
      </button>

      <button
        className="footer-btn blue"
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
              openAddOptionModal(a); 
            }}
          >
            옵션 추가
          </button>

      <button
        className="footer-btn green"
        onClick={(e) => {
          e.stopPropagation();
          handleReceive(a);
        }}
      >
        수령완료
      </button>
    </div>
  )}
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
