import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { updateAgent } from "../api/orderApi";

const AgentItem = ({
  agent,
  expandedId,
  setExpandedId,
  partialMode,
  setPartialMode,
  handlePartialReceive,
  handleReceive,
  updateQty,
  handleStatusChange,
  handleDelete,
  openAddOptionModal,
  setAgents,
}) => {
  const isExpanded = expandedId === agent.id;

  return (
    <li
      key={agent.id}
      className={`agent-item ${isExpanded ? "selected" : ""}`}
      onClick={() => setExpandedId(isExpanded ? null : agent.id)}
    >
      <div className="agent-header-line">
        <div className="agent-left-info">
          <span className="agent-title">
            [{agent.contact_type}] {agent.nickname} -
          </span>

          <input
            type="number"
            className="agent-fee-input"
            value={agent.fee === 0 ? "" : agent.fee}
            placeholder={agent.fee === 0 ? "수고비입력 X" : ""}
            onClick={(e) => e.stopPropagation()}
            onChange={async (e) => {
              const newFee = Number(e.target.value) || 0;
              await updateAgent(agent.id, { fee: newFee });
              setAgents((prev) =>
                prev.map((ag) =>
                  ag.id === agent.id ? { ...ag, fee: newFee } : ag
                )
              );
            }}
          />

          <select
            className="agent-status-select"
            value={agent.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              handleStatusChange(agent.id, e.target.value);
            }}
          >
            <option value="입금전">입금전</option>
            <option value="입금완료">입금완료</option>
            <option value="배송완료">배송완료</option>
          </select>
        </div>

        <div className="agent-right-info">by {agent.manager}</div>
      </div>

      {isExpanded && (
        <div className="agent-option-list">
          {agent.items.map((it, i) => (
            <div
              key={i}
              className="agent-option-row"
              style={{
                textDecoration: it.is_partially_received ? "line-through" : "none",
                opacity: it.is_partially_received ? 0.5 : 1,
              }}
            >
              {partialMode && (
                <input
                  type="checkbox"
                  checked={!!it.is_partially_received}
                  style={{ marginRight: "8px", cursor: "pointer" }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    handlePartialReceive(agent.id, i, it.option_name, it.qty, checked);
                  }}
                />
              )}

              <span className="opt-name">{it.option_name}</span>

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
                    updateQty(agent.id, i, it.qty - 1);
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
                    updateQty(agent.id, i, it.qty + 1);
                  }}
                >
                  ＋
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="agent-footer-line">
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(agent.id);
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
              openAddOptionModal(agent);
            }}
          >
            옵션 추가
          </button>

          <button
            className="footer-btn green"
            onClick={(e) => {
              e.stopPropagation();
              handleReceive(agent);
            }}
            aria-label={`${agent.nickname} 수령 완료 처리`}
          >
            수령완료
          </button>
        </div>
      )}
    </li>
  );
};

AgentItem.propTypes = {
  agent: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    contact_type: PropTypes.string.isRequired,
    nickname: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    manager: PropTypes.string.isRequired,
    fee: PropTypes.number.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        option_name: PropTypes.string.isRequired,
        qty: PropTypes.number.isRequired,
        is_partially_received: PropTypes.bool,
      })
    ).isRequired,
  }).isRequired,
  expandedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setExpandedId: PropTypes.func.isRequired,
  partialMode: PropTypes.bool.isRequired,
  setPartialMode: PropTypes.func.isRequired,
  handlePartialReceive: PropTypes.func.isRequired,
  handleReceive: PropTypes.func.isRequired,
  updateQty: PropTypes.func.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  openAddOptionModal: PropTypes.func.isRequired,
  setAgents: PropTypes.func.isRequired,
};

export default memo(AgentItem);

