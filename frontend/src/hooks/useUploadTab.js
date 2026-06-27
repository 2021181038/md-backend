import { useState, useEffect, useCallback } from "react";
import { extractMd, ExtractMdError } from "../api/mdApi";
import { formatExtractError } from "../api/extractApi";
import { generateMainName, generateDescription } from "../utils/descriptionUtils";
import { groupByCustomPrice, convertKrwToYenOffline, convertKrwToYenOnline } from "../utils/priceUtils";
import { extractImagesFromClipboard } from "../utils/imageUtils";
import { buildMdItem, mapMdListForMode } from "../utils/textUtils";

const computeGrouped = (list, mode) =>
  groupByCustomPrice(mapMdListForMode(list, mode), mode);

export const useUploadTab = () => {
  const [uploadMode, setUploadMode] = useState("offline");
  const [groupName, setGroupName] = useState('');
  const [eventName, setEventName] = useState('');
  const [hasBonus, setHasBonus] = useState(false);
  const [images, setImages] = useState([]);
  const [mdList, setMdList] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [hasGrouped, setHasGrouped] = useState(false);
  const [thumbnailShippingDate, setThumbnailShippingDate] = useState('');
  const [mainName, setMainName] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [keywordType, setKeywordType] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [bonusSets, setBonusSets] = useState([{ base: "", label: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState('');
  const [hasAlbum, setHasAlbum] = useState(false);

  useEffect(() => {
    if (hasGrouped && mdList.length > 0) {
      setGrouped(computeGrouped(mdList, uploadMode));
    }
    // uploadMode 전환 시에만 그룹 재계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadMode]);

  const handleImageUpload = (e) => {
    setImages([...e.target.files]);
  };

  const handlePaste = (e) => {
    const newFiles = extractImagesFromClipboard(e.clipboardData);
    if (newFiles.length > 0) {
      setImages([...images, ...newFiles]);
    }
  };

  const handleFetchPrices = async () => {
    if (!images.length) {
      setErrorMsg("이미지를 업로드해주세요.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("시작 중...");
    setErrorMsg('');
    setGrouped([]);
    setHasGrouped(false);

    try {
      const results = await extractMd(images, {
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

  const handleGenerateContent = () => {
    const main = generateMainName(
      groupName,
      thumbnailShippingDate,
      eventName,
      hasBonus,
      uploadMode
    );
    if (main) setMainName(main);

    const description = generateDescription(
      thumbnailShippingDate,
      hasBonus,
      hasAlbum,
      bonusSets,
      uploadMode
    );
    if (description) setDetailDescription(description);
  };

  const handleGroup = useCallback(() => {
    if (!mdList.length) {
      alert("먼저 가격 정보를 가져와주세요.");
      return;
    }
    setGrouped(computeGrouped(mdList, uploadMode));
    setHasGrouped(true);
  }, [mdList, uploadMode]);

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
    const rawPrice = Number(newList[idx].originalPriceKrw);

    if (!isNaN(rawPrice) && rawPrice > 0) {
      newList[idx] = {
        ...newList[idx],
        originalPriceKrw: rawPrice.toString(),
        priceOffline: convertKrwToYenOffline(rawPrice).toString(),
        priceOnline: convertKrwToYenOnline(rawPrice).toString(),
      };
      setMdList(newList);
      if (hasGrouped) {
        setGrouped(computeGrouped(newList, uploadMode));
      }
    } else {
      alert("원화 가격을 올바르게 입력해주세요!");
    }
  };

  const addEmptyProduct = () => {
    setMdList([...mdList, buildMdItem("", 0)]);
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
  };
};
