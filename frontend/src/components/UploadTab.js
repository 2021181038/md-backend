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
    <div className="page-container">
      <h1 className="page-title">상품 등록</h1>

      <ImageUploadSection
        images={images}
        handleImageUpload={handleImageUpload}
        handlePaste={handlePaste}
        onFetchPrices={handleFetchPrices}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        errorMsg={errorMsg}
      />

      <section className="ui-card">
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
      </section>

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

      <section className="ui-card">
        <button
          type="button"
          className="btn-primary"
          onClick={handleGenerateContent}
        >
          글 추출하기
        </button>
        <p className="hint-text">
          현재 {uploadMode === "online" ? "온라인" : "현장"} 버전 기준으로 메인상품명·상세페이지 글이 생성됩니다.
        </p>

        <MainNameSection mainName={mainName} handleCopy={handleCopy} />
        <DescriptionSection detailDescription={detailDescription} />
      </section>

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
