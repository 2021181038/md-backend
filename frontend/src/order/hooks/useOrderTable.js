import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchMargins, fetchLastSavedTime, updateOrder, deleteOrder, insertOrder, updateOrderIndices } from "../api/orderApi";
import { sortByAscending, sortByNeeded } from "../utils/sortUtils";
import { formatLastSavedTime } from "../utils/dateUtils";
import { calculateTotalProfit } from "../utils/calculationUtils";
import { EXCHANGE_RATES } from "../../constants/config";

const EXCHANGE_RATE = EXCHANGE_RATES.ORDER;

export const useOrderTable = (selectedEvent, eventOrders, setEventOrders, refreshCurrentEvent, agents) => {
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionQty, setNewOptionQty] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [margins, setMargins] = useState([]);
  const [mobileMode, setMobileMode] = useState("daejjik");
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const loadLastSavedTime = async () => {
      if (!selectedEvent) return;
      const { data } = await fetchLastSavedTime(selectedEvent);
      if (data?.last_saved_time) {
        setLastSavedTime(formatLastSavedTime(data.last_saved_time));
      } else {
        setLastSavedTime(null);
      }
    };
    loadLastSavedTime();
  }, [selectedEvent]);

  useEffect(() => {
    const loadMargins = async () => {
      if (!selectedEvent) return;
      const { data, error } = await fetchMargins(selectedEvent);
      if (!error) setMargins(data || []);
    };
    loadMargins();
  }, [selectedEvent, refreshCurrentEvent]);

  const autoSave = useCallback(async (row) => {
    await updateOrder(row.id, {
      needed_qty: row.needed_qty ?? 0,
      proxy_qty: row.proxy_qty ?? 0,
      received_qty: row.received_qty ?? 0,
      quantity: row.needed_qty ?? 0,
      proxy_daejjik_qty: row.proxy_daejjik_qty ?? 0,
    });
  }, []);

  const handleSort = useCallback(async () => {
    const sorted = sortByAscending(eventOrders);
    setEventOrders(sorted);
    await updateOrderIndices(sorted);
    alert("옵션이 오름차순으로 정렬되었습니다.");
  }, [eventOrders, setEventOrders]);

  const handleSortByNeeded = useCallback(async () => {
    const sorted = sortByNeeded(eventOrders);
    setEventOrders(sorted);
    await updateOrderIndices(sorted);
  }, [eventOrders, setEventOrders]);

  const handleDelete = useCallback(async (rowId) => {
    if (!window.confirm("이 항목을 삭제하시겠습니까?")) return;
    const { error } = await deleteOrder(rowId);
    if (!error) await refreshCurrentEvent();
  }, [refreshCurrentEvent]);

  const handleAddOption = useCallback(async () => {
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
      proxy_daejjik_qty: 0,
    };

    const { error } = await insertOrder(newRow);
    if (!error) {
      await refreshCurrentEvent();
      setNewOptionName("");
      setNewOptionQty("");
    }
  }, [newOptionName, newOptionQty, eventOrders, selectedEvent, refreshCurrentEvent]);

  const totalProfit = useMemo(() => 
    calculateTotalProfit(eventOrders, margins, EXCHANGE_RATE),
    [eventOrders, margins]
  );
  const totalProfitKRW = useMemo(() => 
    Math.round(totalProfit * EXCHANGE_RATE),
    [totalProfit]
  );

  return {
    newOptionName,
    setNewOptionName,
    newOptionQty,
    setNewOptionQty,
    lastSavedTime,
    margins,
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
  };
};

