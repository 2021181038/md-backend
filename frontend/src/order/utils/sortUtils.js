// 옵션명에서 숫자 추출
export const extractOptionNumber = (optionName) => {
  const match = optionName?.trim().match(/\[(\d+)\]/);
  return match ? parseInt(match[1], 10) : null;
};

// 오름차순 정렬
export const sortByAscending = (orders) => {
  return [...orders].sort((a, b) => {
    const nameA = a.option_name?.trim() || "";
    const nameB = b.option_name?.trim() || "";

    const numA = extractOptionNumber(nameA);
    const numB = extractOptionNumber(nameB);

    if (numA !== null && numB !== null) return numA - numB;
    if (numA !== null && numB === null) return -1;
    if (numA === null && numB !== null) return 1;

    return nameA.localeCompare(nameB, "ko", { numeric: true });
  });
};

// 구매필요 기준 정렬
export const sortByNeeded = (orders) => {
  return [...orders].sort((a, b) => {
    const neededA = a.needed_qty ?? a.quantity ?? 0;
    const neededB = b.needed_qty ?? b.quantity ?? 0;

    // 구매필요 1 이상 항목을 최상단으로
    if (neededA > 0 && neededB === 0) return -1;
    if (neededA === 0 && neededB > 0) return 1;

    // 그 안에서는 오름차순 규칙 적용
    const nameA = a.option_name?.trim() || "";
    const nameB = b.option_name?.trim() || "";
    const numA = extractOptionNumber(nameA);
    const numB = extractOptionNumber(nameB);

    if (numA !== null && numB !== null) return numA - numB;
    if (numA !== null && numB === null) return -1;
    if (numA === null && numB !== null) return 1;

    return nameA.localeCompare(nameB, "ko", { numeric: true });
  });
};

