import React from "react";
import "./MarginCalculator.css";
import { useMarginCalculator } from "./hooks/useMarginCalculator";
import FileUploadSection from "./components/FileUploadSection";
import ProductSelectionSection from "./components/ProductSelectionSection";
import ActionButtonsSection from "./components/ActionButtonsSection";
import SummarySection from "./components/SummarySection";
import ResultTable from "./components/ResultTable";
import TotalMarginSection from "./components/TotalMarginSection";

function MarginCalculator() {
  const {
    productNames,
    selectedNames,
    summary,
    settlementData,
    matchedSummary,
    totalMargin,
    totalProxyFee,
    dutyApplied,
    proxyApplied,
    divideMap,
    setSelectedNames,
    setDutyApplied,
    setProxyApplied,
    setDivideMap,
    handleSettlementUpload,
    toggleSelect,
    handleSummarize,
    handleTotalMargin,
    handleOptionChange,
    handleQtyChange,
    handleCostChange,
    calculateMarginForRow,
    handleSortByOption,
  } = useMarginCalculator();

  return (
    <div className="margin-container">
      <FileUploadSection handleSettlementUpload={handleSettlementUpload} />

      <ProductSelectionSection
        productNames={productNames}
        selectedNames={selectedNames}
        toggleSelect={toggleSelect}
        setSelectedNames={setSelectedNames}
      />

      <ActionButtonsSection
        selectedNames={selectedNames}
        summary={summary}
        settlementData={settlementData}
        matchedSummary={matchedSummary}
        handleSummarize={handleSummarize}
        handleTotalMargin={handleTotalMargin}
        proxyApplied={proxyApplied}
        setProxyApplied={setProxyApplied}
        handleSortByOption={handleSortByOption}
      />

      <TotalMarginSection totalMargin={totalMargin} totalProxyFee={totalProxyFee} />

      {matchedSummary.length > 0 ? (
        <ResultTable
          matchedSummary={matchedSummary}
          calculateMarginForRow={calculateMarginForRow}
          dutyApplied={dutyApplied}
          setDutyApplied={setDutyApplied}
          proxyApplied={proxyApplied}
          setProxyApplied={setProxyApplied}
          divideMap={divideMap}
          setDivideMap={setDivideMap}
          handleOptionChange={handleOptionChange}
          handleQtyChange={handleQtyChange}
          handleCostChange={handleCostChange}
        />
      ) : (
        <SummarySection summary={summary} />
      )}
    </div>
  );
}

export default MarginCalculator;
