import { useState } from "react";
import { parseOrderCSV, parseSettlementCSV, exportToCSV } from "../utils/csvUtils";
import { extractText } from "../utils/textUtils";
import { calculateMargin, calculateTotalMargin } from "../utils/marginUtils";
import { summarizeOrders, matchSettlement } from "../utils/settlementUtils";
import { extractProductNames } from "../utils/productUtils";
import { EXCHANGE_RATES } from "../../constants/config";

const EXCHANGE_RATE = EXCHANGE_RATES.ONLINE;

export const useMarginCalculator = () => {
  const [csvData, setCsvData] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [summary, setSummary] = useState([]);
  const [settlementData, setSettlementData] = useState([]);
  const [matchedSummary, setMatchedSummary] = useState([]);
  const [costs, setCosts] = useState({});
  const [totalMargin, setTotalMargin] = useState(null);
  const [dutyApplied, setDutyApplied] = useState({});
  const [extractedText, setExtractedText] = useState("");
  const [proxyApplied, setProxyApplied] = useState({});
  const [totalProxyFee, setTotalProxyFee] = useState(0);
  const [divideMap, setDivideMap] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseOrderCSV(file, (data) => {
      setCsvData(data);
      const names = extractProductNames(data);
      setProductNames(names);
    });
  };

  const handleSettlementUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseSettlementCSV(file, (data) => {
      setSettlementData(data);
    });
  };

  const toggleSelect = (name) => {
    setSelectedNames((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  const handleSummarize = () => {
    const summaryArr = summarizeOrders(csvData, selectedNames);
    setSummary(summaryArr);
  };

  const handleMatchSettlement = () => {
    const result = matchSettlement(summary, settlementData);
    setMatchedSummary(result);
  };

  const handleExtractText = () => {
    const text = extractText(summary);
    setExtractedText(text);
  };

  const handleTotalMargin = () => {
    const result = calculateTotalMargin(
      matchedSummary,
      costs,
      EXCHANGE_RATE,
      dutyApplied,
      proxyApplied
    );
    if (result) {
      setTotalMargin({
        total: result.total,
        totalWon: result.totalWon,
      });
      setTotalProxyFee(result.totalProxyFee);
    }
  };

  const handleOptionChange = (index, newOption) => {
    setMatchedSummary((prev) => {
      const updated = [...prev];
      updated[index].option = newOption;
      return updated;
    });
    setSummary((prev) => {
      const updated = [...prev];
      updated[index].option = newOption;
      return updated;
    });
  };

  const handleQtyChange = (index, newQty) => {
    const parsedQty = Number(newQty) || 0;
    setMatchedSummary((prev) => {
      const updated = [...prev];
      updated[index].qty = parsedQty;
      return updated;
    });
    setSummary((prev) => {
      const updated = [...prev];
      updated[index].qty = parsedQty;
      return updated;
    });
  };

  const handleCostChange = (option, value) => {
    setCosts((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleExportCSV = () => {
    exportToCSV(matchedSummary, (row) => calculateMargin(row, costs, EXCHANGE_RATE, divideMap, proxyApplied));
  };

  const calculateMarginForRow = (row) => {
    return calculateMargin(row, costs, EXCHANGE_RATE, divideMap, proxyApplied);
  };

  return {
    // State
    csvData,
    productNames,
    selectedNames,
    summary,
    settlementData,
    matchedSummary,
    costs,
    totalMargin,
    dutyApplied,
    extractedText,
    proxyApplied,
    totalProxyFee,
    divideMap,
    // Setters
    setSelectedNames,
    setDutyApplied,
    setProxyApplied,
    setDivideMap,
    // Handlers
    handleFileUpload,
    handleSettlementUpload,
    toggleSelect,
    handleSummarize,
    handleMatchSettlement,
    handleExtractText,
    handleTotalMargin,
    handleOptionChange,
    handleQtyChange,
    handleCostChange,
    handleExportCSV,
    calculateMarginForRow,
  };
};

