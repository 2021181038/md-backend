import { useState, useEffect } from "react";
import { extractMd, ExtractMdError } from "../api/mdApi";
import { formatExtractError } from "../api/extractApi";
import { generateMainName, generateDescription } from "../utils/descriptionUtils";
import { groupByCustomPrice } from "../utils/priceUtils";
import { convertKrwToYenOffline, convertKrwToYenOnline } from "../utils/priceUtils";
import { extractImagesFromClipboard } from "../utils/imageUtils";

export const useUploadTab = () => {
  const [uploadMode, setUploadMode] = useState("offline");
  const [groupName, setGroupName] = useState('');
  const [eventName, setEventName] = useState('');
  const [hasBonus, setHasBonus] = useState(false);
  const [images, setImages] = useState([]);
  const [mdList, setMdList] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [thumbnailShippingDate, setThumbnailShippingDate] = useState('');
  const [mainName, setMainName] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [keywordType, setKeywordType] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [isKeywordLoading, setIsKeywordLoading] = useState(false);
  const [bonusSets, setBonusSets] = useState([{ base: "", label: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState('');
  const [hasAlbum, setHasAlbum] = useState(false);

  useEffect(() => {
    if (bonusSets.length === 1 && bonusSets[0].base) {
      // 특전 조건 변경 시 처리
    }
  }, [bonusSets]);

  const handleImageUpload = (e) => {
    setImages([...e.target.files]);
  };

  const handlePaste = (e) => {
    const newFiles = extractImagesFromClipboard(e.clipboardData);
    if (newFiles.length > 0) {
      setImages([...images, ...newFiles]);
    }
  };

  const handleSubmit = async () => {
    if (!images.length) {
      setErrorMsg("이미지를 업로드해주세요.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("시작 중...");
    setErrorMsg('');

    try {
      const results = await extractMd(images, uploadMode, {
        onProgress: setLoadingMessage,
      });
      setMdList(results);
    } catch (error) {
      console.error("에러 발생:", error);

      if (error instanceof ExtractMdError && error.partialResults.length > 0) {
        setMdList(error.partialResults);
      }

      setErrorMsg(`❌ ${formatExtractError(error)}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGenerateMainName = () => {
    const result = generateMainName(
      groupName,
      thumbnailShippingDate,
      eventName,
      hasBonus,
      uploadMode
    );
    setMainName(result);
  };

  const handleGenerateDescription = () => {
    const result = generateDescription(
      thumbnailShippingDate,
      hasBonus,
      hasAlbum,
      bonusSets,
      uploadMode
    );
    setDetailDescription(result);
  };

  const handleOnetoThree = async () => {
    handleGenerateMainName();
    handleGenerateDescription();
    await handleSubmit();
  };

  const handleGroup = () => {
    const result = groupByCustomPrice(mdList, uploadMode);
    setGrouped(result);
  };

  const handleCopy = (text, label) => {
    if (!text) {
      alert(`${label}이(가) 없습니다.`);
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {})
      .catch((err) => {
        console.error("복사 실패:", err);
      });
  };

  const convertToYen = (idx) => {
    const newList = [...mdList];
    const rawPrice = Number(newList[idx].price);

    if (!isNaN(rawPrice) && rawPrice > 0) {
      const finalPrice =
        uploadMode === "online"
          ? convertKrwToYenOnline(rawPrice)
          : convertKrwToYenOffline(rawPrice);

      newList[idx].originalPriceKrw = rawPrice.toString();
      newList[idx].price = finalPrice.toString();
      setMdList(newList);
    } else {
      alert("숫자를 올바르게 입력해주세요!");
    }
  };

  return {
    uploadMode,
    setUploadMode,
    groupName,
    setGroupName,
    eventName,
    setEventName,
    hasBonus,
    setHasBonus,
    images,
    setImages,
    mdList,
    setMdList,
    grouped,
    setGrouped,
    thumbnailShippingDate,
    setThumbnailShippingDate,
    mainName,
    setMainName,
    detailDescription,
    setDetailDescription,
    keywordType,
    setKeywordType,
    keywords,
    setKeywords,
    isKeywordLoading,
    setIsKeywordLoading,
    bonusSets,
    setBonusSets,
    isLoading,
    loadingMessage,
    setIsLoading,
    errorMsg,
    setErrorMsg,
    hasAlbum,
    setHasAlbum,
    handleImageUpload,
    handlePaste,
    handleSubmit,
    handleGenerateMainName,
    handleGenerateDescription,
    handleOnetoThree,
    handleGroup,
    handleCopy,
    convertToYen,
  };
};
