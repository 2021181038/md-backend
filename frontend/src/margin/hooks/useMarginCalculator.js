import { useState } from "react";
import { parseSettlementCSV, exportToCSV } from "../utils/csvUtils";
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

  const handleSettlementUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 정산 CSV 하나만으로도 주문+정산 정보를 모두 활용할 수 있도록 통합 처리
    parseSettlementCSV(file, (data) => {
      // 1) 정산용 원본 데이터
      setSettlementData(data);

      // 2) 주문 CSV 없이도 옵션/수량 요약이 가능하도록,
      //    정산 데이터를 그대로 주문 데이터(csvData)로도 사용
      setCsvData(data);

      // 3) 상품명 리스트를 정산 파일에서 바로 추출
      const names = extractProductNames(data);
      setProductNames(names);

      // 4) 새 파일 업로드 시 이전 상태 초기화 (선택/요약/매칭/마진)
      setSelectedNames([]);
      setSummary([]);
      setMatchedSummary([]);
      setTotalMargin(null);
      setExtractedText("");
      setCosts({});
      setDutyApplied({});
      setProxyApplied({});
      setTotalProxyFee(0);
      setDivideMap({});
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
    // 1) 선택한 상품의 주문(정산) 데이터를 옵션별로 수합
    const summaryArr = summarizeOrders(csvData, selectedNames);
    setSummary(summaryArr);

    // 2) 바로 정산 금액 매칭까지 한 번에 수행
    if (summaryArr.length > 0 && settlementData.length > 0) {
      const result = matchSettlement(summaryArr, settlementData);
      setMatchedSummary(result);
    } else {
      // 정산 데이터가 없는 경우에는 매칭 결과를 비워둔다
      setMatchedSummary([]);
    }
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

  // 옵션명에서 숫자 추출
  const extractOptionNumber = (optionName) => {
    const match = optionName?.trim().match(/\[(\d+)\]/);
    return match ? parseInt(match[1], 10) : null;
  };

  // 옵션명 오름차순 정렬
  const handleSortByOption = () => {
    const sorted = [...matchedSummary].sort((a, b) => {
      const nameA = a.option?.trim() || "";
      const nameB = b.option?.trim() || "";

      const numA = extractOptionNumber(nameA);
      const numB = extractOptionNumber(nameB);

      if (numA !== null && numB !== null) return numA - numB;
      if (numA !== null && numB === null) return -1;
      if (numA === null && numB !== null) return 1;

      return nameA.localeCompare(nameB, "ko", { numeric: true });
    });

    // 정렬된 matchedSummary를 업데이트하면서 summary도 함께 정렬
    setMatchedSummary(sorted);
    
    // summary도 같은 순서로 정렬
    const sortedSummary = [...summary].sort((a, b) => {
      const nameA = a.option?.trim() || "";
      const nameB = b.option?.trim() || "";

      const numA = extractOptionNumber(nameA);
      const numB = extractOptionNumber(nameB);

      if (numA !== null && numB !== null) return numA - numB;
      if (numA !== null && numB === null) return -1;
      if (numA === null && numB !== null) return 1;

      return nameA.localeCompare(nameB, "ko", { numeric: true });
    });
    setSummary(sortedSummary);
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
    handleSettlementUpload,
    toggleSelect,
    handleSummarize,
    handleExtractText,
    handleTotalMargin,
    handleOptionChange,
    handleQtyChange,
    handleCostChange,
    handleExportCSV,
    calculateMarginForRow,
    handleSortByOption,
  };
};

