import { useState, useEffect, useCallback } from "react";
import { fetchEventList, fetchEventDetails } from "../api/orderApi";

export const useOrderManager = () => {
  const [eventList, setEventList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventOrders, setEventOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [highlightedOptions, setHighlightedOptions] = useState([]);
  const [modal, setModal] = useState({
    upload: false,
    merge: false,
    addAgent: false,
    addOption: false,
    margin: false,
  });

  const loadEventList = useCallback(async () => {
    const { data, error } = await fetchEventList();
    if (!error) setEventList(data || []);
  }, []);

  const loadEventDetails = useCallback(async (eventName) => {
    if (!eventName) return;

    const { ordersRes, agentsRes } = await fetchEventDetails(eventName);

    if (!ordersRes.error) {
      const cleaned = ordersRes.data.map((row) => ({
        ...row,
        needed_qty: row.needed_qty ?? row.quantity,
        proxy_qty: row.proxy_qty ?? 0,
        received_qty: row.received_qty ?? 0,
      }));
      setEventOrders(cleaned);
    }

    if (!agentsRes.error) setAgents(agentsRes.data || []);
  }, []);

  useEffect(() => {
    loadEventList();
  }, [loadEventList]);

  useEffect(() => {
    loadEventDetails(selectedEvent);
  }, [selectedEvent, loadEventDetails]);

  const refreshCurrentEvent = async () => {
    if (selectedEvent) await loadEventDetails(selectedEvent);
  };

  const openModal = (modalName, data = null) => {
    setModal((prev) => ({ ...prev, [modalName]: data !== null ? data : true }));
  };

  const closeModal = (modalName) => {
    setModal((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleSelectEvent = (eventName) => {
    setHighlightedOptions([]);
    setSelectedEvent(eventName);
  };

  return {
    eventList,
    selectedEvent,
    eventOrders,
    agents,
    highlightedOptions,
    modal,
    setEventOrders,
    setAgents,
    setHighlightedOptions,
    setSelectedEvent: handleSelectEvent,
    refreshCurrentEvent,
    loadEventList,
    openModal,
    closeModal,
    setModal,
  };
};

