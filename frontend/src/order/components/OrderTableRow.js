import React, { memo, useCallback } from "react";
import { renderOptionName } from "../utils/optionUtils";

const OrderTableRow = ({
  row,
  idx,
  highlightedOptions,
  isMobile,
  mobileMode,
  eventOrders,
  setEventOrders,
  markAsChanged,
  autoSave,
  handleDelete,
}) => {
  const needed = row.needed_qty ?? row.quantity ?? 0;
  const proxy = row.proxy_qty ?? 0;
  const daejjik = row.proxy_daejjik_qty ?? 0;
  const received = row.received_qty ?? 0;
  const total = needed + proxy + daejjik + received;

  const updateQty = useCallback((field, delta) => {
    const updated = [...eventOrders];
    updated[idx][field] = (updated[idx][field] ?? 0) + delta;
    setEventOrders(updated);
    markAsChanged(row.option_name);
    autoSave(updated[idx]);
  }, [eventOrders, idx, setEventOrders, markAsChanged, row.option_name, autoSave]);

  const handleQtyChange = useCallback((field, newValue) => {
    const updated = [...eventOrders];
    const oldValue = updated[idx][field] ?? 0;
    const diff = newValue - oldValue;
    updated[idx][field] = newValue;

    if (field === "proxy_qty") {
      updated[idx].needed_qty = needed - diff;
    } else if (field === "proxy_daejjik_qty") {
      updated[idx].needed_qty = Math.max(0, needed - diff);
    } else if (field === "received_qty") {
      updated[idx].proxy_daejjik_qty = daejjik - diff;
    }

    setEventOrders(updated);
    markAsChanged(row.option_name);
    autoSave(updated[idx]);
  }, [eventOrders, idx, setEventOrders, markAsChanged, row.option_name, autoSave, needed, daejjik]);

  return (
    <tr
      key={row.id || idx}
      className={
        highlightedOptions.includes(row.option_name) ? "highlight-merged" : ""
      }
    >
      <td className="delete-cell hide-on-mobile">
        <button className="delete-btn" onClick={() => handleDelete(row.id)}>
          🗑
        </button>
      </td>

      <td className="option-name">{renderOptionName(row.option_name)}</td>

      {/* 구매필요 */}
      <td className="qty-cell1">
                <button 
                  className="qty-btn" 
                  onClick={() => updateQty("needed_qty", -1)}
                  aria-label={`${row.option_name} 구매필요 수량 감소`}
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
                  aria-label={`${row.option_name} 구매필요 수량`}
                />
                <button 
                  className="qty-btn" 
                  onClick={() => updateQty("needed_qty", 1)}
                  aria-label={`${row.option_name} 구매필요 수량 증가`}
                >
                  ＋
                </button>
      </td>

      {/* 대리완료 */}
      {(!isMobile || mobileMode === "sung") && (
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
            onChange={(e) => handleQtyChange("proxy_qty", Number(e.target.value))}
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
      )}

      {/* 대찍완료 */}
      {(!isMobile || mobileMode === "daejjik") && (
        <td className="qty-cell">
          <button
            className="qty-btn"
            onClick={() => {
              const updated = [...eventOrders];
              updated[idx].proxy_daejjik_qty = daejjik - 1;
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
            value={daejjik}
            min="0"
            className="qty-input"
            onChange={(e) =>
              handleQtyChange("proxy_daejjik_qty", Number(e.target.value))
            }
          />
          <button
            className="qty-btn"
            onClick={() => {
              const updated = [...eventOrders];
              updated[idx].proxy_daejjik_qty = daejjik + 1;
              updated[idx].needed_qty = needed - 1;
              setEventOrders(updated);
              markAsChanged(row.option_name);
              autoSave(updated[idx]);
            }}
          >
            ＋
          </button>
        </td>
      )}

      {/* 수령완료 */}
      <td className="qty-cell hide-on-mobile">
        <button
          className="qty-btn"
          onClick={() => {
            const updated = [...eventOrders];
            updated[idx].received_qty = received - 1;
            updated[idx].proxy_daejjik_qty = daejjik + 1;
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
          onChange={(e) => handleQtyChange("received_qty", Number(e.target.value))}
        />
        <button
          className="qty-btn"
          onClick={() => {
            const updated = [...eventOrders];
            updated[idx].received_qty = received + 1;
            updated[idx].proxy_daejjik_qty = daejjik - 1;
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
};

export default memo(OrderTableRow);

