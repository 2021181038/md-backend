import React, { useMemo } from "react";
import { useAgentList } from "../hooks/useAgentList";
import AgentItem from "./AgentItem";

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
  const {
    expandedId,
    setExpandedId,
    partialMode,
    setPartialMode,
    handlePartialReceive,
    handleReceive,
    updateQty,
    handleStatusChange,
    handleDelete,
  } = useAgentList(
    selectedEvent,
    agents,
    setAgents,
    eventOrders,
    setEventOrders,
    refreshCurrentEvent
  );

  const pendingAgents = useMemo(() => agents.filter((a) => !a.is_received), [agents]);
  const receivedAgents = useMemo(() => agents.filter((a) => a.is_received), [agents]);

  if (!selectedEvent) {
    return (
      <div className="order-right-panel">
        <p className="placeholder-text">이벤트를 선택하면 대리 구매자 목록이 표시됩니다.</p>
      </div>
    );
  }

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

      <h4 className="agent-section-title">수령 전</h4>
      <div className="agent-section-box">
        <div className="agent-list-wrapper">
          {pendingAgents.length > 0 ? (
            <ul className="product-list">
              {pendingAgents.map((a) => (
                <AgentItem
                  key={a.id}
                  agent={a}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  partialMode={partialMode}
                  setPartialMode={setPartialMode}
                  handlePartialReceive={handlePartialReceive}
                  handleReceive={handleReceive}
                  updateQty={updateQty}
                  handleStatusChange={handleStatusChange}
                  handleDelete={handleDelete}
                  openAddOptionModal={openAddOptionModal}
                  setAgents={setAgents}
                />
              ))}
            </ul>
          ) : (
            <p className="placeholder-text">수령 전 구매자가 없습니다.</p>
          )}
        </div>
      </div>

      <h4 className="agent-section-title">수령 완료</h4>
      <div className="agent-section-box">
        <div className="agent-list-wrapper">
          {receivedAgents.length > 0 ? (
            <ul className="product-list">
              {receivedAgents.map((a) => (
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
