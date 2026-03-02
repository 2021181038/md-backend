import React from "react";
import { useUploadTab } from "../hooks/useUploadTab";
import { generateAllKeywords } from "../utils/keywordUtils";
import { downloadGroupExcel } from "../utils/excelUtils";
import FormSection from "./upload/FormSection";
import BonusSection from "./upload/BonusSection";
import MainNameSection from "./upload/MainNameSection";
import DescriptionSection from "./upload/DescriptionSection";
import ProductTableSection from "./upload/ProductTableSection";
import GroupSection from "./upload/GroupSection";
import KeywordSection from "./upload/KeywordSection";

const UploadTab = () => {
  const {
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
    memberText,
    setMemberText,
    keywords,
    setKeywords,
    isKeywordLoading,
    setIsKeywordLoading,
    bonusSets,
    setBonusSets,
    isLoading,
    errorMsg,
    hasAlbum,
    setHasAlbum,
    hasPreorder,
    setHasPreorder,
    preorderShippingDate,
    setPreorderShippingDate,
    handleImageUpload,
    handlePaste,
    handleOnetoThree,
    handleGroup,
    handleCopy,
    convertToYen,
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

      <FormSection
        images={images}
        groupName={groupName}
        thumbnailShippingDate={thumbnailShippingDate}
        eventName={eventName}
        hasBonus={hasBonus}
        hasAlbum={hasAlbum}
        hasPreorder={hasPreorder}
        preorderShippingDate={preorderShippingDate}
        handleImageUpload={handleImageUpload}
        handlePaste={handlePaste}
        setGroupName={setGroupName}
        setThumbnailShippingDate={setThumbnailShippingDate}
        setEventName={setEventName}
        setHasBonus={setHasBonus}
        setHasAlbum={setHasAlbum}
        setHasPreorder={setHasPreorder}
        setPreorderShippingDate={setPreorderShippingDate}
      />

      {hasBonus && (
        <BonusSection bonusSets={bonusSets} setBonusSets={setBonusSets} />
      )}

      <hr />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '10px' }}>
        <button
          className="pretty-button"
          style={{ marginTop: '20px' }}
          onClick={handleOnetoThree}
        >
          위에 모두 입력 후 눌러주세요
        </button>

        {isLoading && (
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <div className="spinner"></div>
            <p>상품 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {errorMsg && (
          <div style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}
      </div>

      <MainNameSection mainName={mainName} handleCopy={handleCopy} />

      <DescriptionSection detailDescription={detailDescription} />

      <ProductTableSection
        mdList={mdList}
        setMdList={setMdList}
        convertToYen={convertToYen}
      />

      <GroupSection
        grouped={grouped}
        handleGroup={handleGroup}
        handleDownloadExcelByGroup={handleDownloadExcelByGroup}
      />

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

