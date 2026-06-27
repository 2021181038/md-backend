import React from "react";
import { useUploadTab } from "../hooks/useUploadTab";
import { generateAllKeywords } from "../utils/keywordUtils";
import { downloadGroupExcel } from "../utils/excelUtils";
import ImageUploadSection from "./upload/ImageUploadSection";
import MetadataFormSection from "./upload/MetadataFormSection";
import BonusSection from "./upload/BonusSection";
import MainNameSection from "./upload/MainNameSection";
import DescriptionSection from "./upload/DescriptionSection";
import ProductTableSection from "./upload/ProductTableSection";
import GroupSection from "./upload/GroupSection";
import KeywordSection from "./upload/KeywordSection";

const UploadTab = () => {
  const {
    uploadMode,
    setUploadMode,
    groupName,
    setGroupName,
    eventName,
    setEventName,
    hasBonus,
    setHasBonus,
    images,
    mdList,
    setMdList,
    grouped,
    thumbnailShippingDate,
    setThumbnailShippingDate,
    mainName,
    detailDescription,
    keywordType,
    setKeywordType,
    keywords,
    setKeywords,
    bonusSets,
    setBonusSets,
    isLoading,
    loadingMessage,
    errorMsg,
    hasAlbum,
    setHasAlbum,
    handleImageUpload,
    handlePaste,
    handleFetchPrices,
    handleGenerateContent,
    handleGroup,
    handleCopy,
    convertToYen,
    addEmptyProduct,
  } = useUploadTab();

  const handleGenerateKeywords = () => {
    if (!keywordType) {
      alert("응원봉/앨범/MD/포카 중 하나를 선택하세요!");
      return;
    }

    if (!groupName) {
      alert("그룹명을 입력하세요!");
      return;
    }

    const keywordList = generateAllKeywords(groupName, keywordType);
    const formattedKeywords = keywordList.map(keyword => ({
      keyword: keyword,
      en: keyword,
      jp: keyword,
    }));

    setKeywords(formattedKeywords);
  };

  const handleDownloadExcelByGroup = (group, groupIdx) => {
    downloadGroupExcel(group, groupIdx);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>상품 등록</h2>

      <ImageUploadSection
        images={images}
        handleImageUpload={handleImageUpload}
        handlePaste={handlePaste}
        onFetchPrices={handleFetchPrices}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        errorMsg={errorMsg}
      />

      <ProductTableSection
        mdList={mdList}
        setMdList={setMdList}
        convertToYen={convertToYen}
        uploadMode={uploadMode}
        setUploadMode={setUploadMode}
        addEmptyProduct={addEmptyProduct}
      />

      <GroupSection
        grouped={grouped}
        handleGroup={handleGroup}
        handleDownloadExcelByGroup={handleDownloadExcelByGroup}
      />

      <hr style={{ margin: "30px 0" }} />

      <MetadataFormSection
        groupName={groupName}
        thumbnailShippingDate={thumbnailShippingDate}
        eventName={eventName}
        hasBonus={hasBonus}
        hasAlbum={hasAlbum}
        setGroupName={setGroupName}
        setThumbnailShippingDate={setThumbnailShippingDate}
        setEventName={setEventName}
        setHasBonus={setHasBonus}
        setHasAlbum={setHasAlbum}
      />

      {hasBonus && (
        <BonusSection
          bonusSets={bonusSets}
          setBonusSets={setBonusSets}
          uploadMode={uploadMode}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '20px' }}>
        <button
          className="pretty-button"
          onClick={handleGenerateContent}
        >
          글 추출하기
        </button>
        <p style={{ textAlign: "center", color: "#666", fontSize: "14px", margin: "8px 0 0" }}>
          현재 {uploadMode === "online" ? "온라인" : "현장"} 버전 기준으로 메인상품명·상세페이지 글이 생성됩니다.
        </p>
      </div>

      <MainNameSection mainName={mainName} handleCopy={handleCopy} />

      <DescriptionSection detailDescription={detailDescription} />

      <KeywordSection
        keywordType={keywordType}
        setKeywordType={setKeywordType}
        handleGenerateKeywords={handleGenerateKeywords}
        keywords={keywords}
        handleCopy={handleCopy}
      />
    </div>
  );
};

export default UploadTab;
