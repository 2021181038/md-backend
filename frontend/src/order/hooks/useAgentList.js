import { useState } from "react";
import { updateAgent, deleteAgent, getOrderByOptionName, updateOrderByEventAndOption } from "../api/orderApi";

export const useAgentList = (selectedEvent, agents, setAgents, eventOrders, setEventOrders, refreshCurrentEvent) => {
  const [expandedId, setExpandedId] = useState(null);
  const [partialMode, setPartialMode] = useState(false);

  const handlePartialReceive = async (agentId, itemIndex, optionName, qty, newValue) => {
    const updatedOrders = [...eventOrders];
    const target = updatedOrders.find((o) => o.option_name === optionName);
    if (!target) return;

    const proxy = target.proxy_qty ?? 0;
    const newProxy = newValue ? proxy - qty : proxy + qty;

    target.proxy_qty = newProxy;
    setEventOrders(updatedOrders);

    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      const updatedItems = agent.items.map((it, idx) =>
        idx === itemIndex
          ? { ...it, is_partially_received: newValue }
          : it
      );

      await updateAgent(agentId, { items: updatedItems });

      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId ? { ...a, items: updatedItems } : a
        )
      );
    }
  };

  const handleReceive = async (agent) => {
    await updateAgent(agent.id, { is_received: true, status: "배송완료" });

    const updatedOrders = [...eventOrders];

    await Promise.all(
      agent.items.map(async (it) => {
        if (it.is_partially_received) return;

        const target = updatedOrders.find((o) => o.option_name === it.option_name);
        if (target) {
          const proxy = target.proxy_qty ?? 0;
          const newProxy = proxy - it.qty;
          const newNeeded = target.needed_qty ?? target.quantity ?? 0;

          target.proxy_qty = newProxy;
          target.needed_qty = newNeeded;
          target.quantity = newNeeded;

          await updateOrderByEventAndOption(selectedEvent, target.option_name, {
            proxy_qty: newProxy,
            needed_qty: newNeeded,
            quantity: newNeeded,
          });
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

  const updateQty = async (agentId, itemIndex, newQty) => {
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
    const diff = newQty - oldQty;

    const updatedItems = agent.items.map((it, i) =>
      i === itemIndex ? { ...it, qty: newQty } : it
    );
    await updateAgent(agentId, { items: updatedItems });

    const { data: order } = await getOrderByOptionName(selectedEvent, targetItem.option_name);

    if (order) {
      const newProxy = (order.proxy_qty ?? 0) + diff;
      const newNeeded = (order.needed_qty ?? 0) - diff;

      await updateOrderByEventAndOption(selectedEvent, targetItem.option_name, {
        proxy_qty: newProxy,
        needed_qty: newNeeded,
        quantity: newNeeded,
      });

      setEventOrders((prev) =>
        prev.map((o) =>
          o.option_name === targetItem.option_name
            ? { ...o, proxy_qty: newProxy, needed_qty: newNeeded, quantity: newNeeded }
            : o
        )
      );
    }
  };

  const handleStatusChange = async (agentId, newStatus) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: newStatus } : a))
    );
    await updateAgent(agentId, { status: newStatus });
  };

  const handleDelete = async (agentId) => {
    const target = agents.find((a) => a.id === agentId);
    if (!target) return;

    if (target.is_received) {
      alert("이미 수령완료된 구매자는 삭제할 수 없습니다.");
      return;
    }

    if (target.items.some((it) => it.is_partially_received)) {
      alert("일부수령된 항목이 있어 삭제할 수 없습니다.");
      return;
    }

    if (!window.confirm(`'${target.nickname}' 구매자를 삭제하시겠습니까?`)) return;

    let updatedOrders = [...eventOrders];

    for (const it of target.items) {
      const optionName = it.option_name;
      const qty = it.qty;

      const orderRow = updatedOrders.find((o) => o.option_name === optionName);
      if (!orderRow) continue;

      const newNeeded = (orderRow.needed_qty ?? 0) + qty;
      const newProxy = Math.max(0, (orderRow.proxy_qty ?? 0) - qty);

      orderRow.needed_qty = newNeeded;
      orderRow.proxy_qty = newProxy;
      orderRow.quantity = newNeeded;

      await updateOrderByEventAndOption(selectedEvent, optionName, {
        needed_qty: newNeeded,
        proxy_qty: newProxy,
        quantity: newNeeded,
      });
    }

    setEventOrders(updatedOrders);

    const { error } = await deleteAgent(agentId);

    if (!error) {
      alert("삭제 완료 ✅");
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
    } else {
      alert("삭제 실패 ❌");
    }
  };

  return {
    expandedId,
    setExpandedId,
    partialMode,
    setPartialMode,
    handlePartialReceive,
    handleReceive,
    updateQty,
    handleStatusChange,
    handleDelete,
  };
};

