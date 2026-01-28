const API_BASE = process.env.REACT_APP_API_BASE;

// 멤버 번역 (영어)
export const translateMembersEn = async (members) => {
  const response = await fetch(`${API_BASE}/translate-members-en`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members }),
  });
  return response.json();
};

// 멤버 번역 (일본어)
export const translateMembersJp = async (members) => {
  const response = await fetch(`${API_BASE}/translate-members-jp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members }),
  });
  return response.json();
};

// 키워드 생성
export const generateKeywords = async (keywordType, memberText, groupName) => {
  if (!keywordType || !memberText || !groupName) {
    throw new Error("필수 입력값이 없습니다.");
  }

  const members = memberText
    .split(",")
    .map(m => m.trim())
    .filter(Boolean);

  if (members.length === 0) {
    throw new Error("멤버명을 올바르게 입력하세요.");
  }

  const [enRes, jpRes, groupRes] = await Promise.all([
    translateMembersEn(members),
    translateMembersJp(members),
    translateMembersJp([groupName]),
  ]);

  const { translatedMembersEn = [] } = enRes;
  const { translatedMembersJp = [] } = jpRes;
  const { translatedMembersJp: groupNameJpArr = [] } = groupRes;

  if (!translatedMembersEn.length || !translatedMembersJp.length) {
    throw new Error("키워드 생성에 실패했습니다.");
  }

  const groupNameJp = groupNameJpArr[0] || groupName;
  const groupNameEn = groupName;

  let extraKeywordEn = "";
  let extraKeywordJp = "";

  if (keywordType === "アルバム") {
    extraKeywordEn = "CD";
    extraKeywordJp = "CD";
  } else if (keywordType === "포카" || keywordType === "フォトカード") {
    extraKeywordEn = "POCA";
    extraKeywordJp = "ポカ";
  }

  const memberKeywords = members.map((_, idx) => ({
    en: translatedMembersEn[idx] || "",
    jp: translatedMembersJp[idx] || "",
    type: "member",
  }));

  return [
    {
      en: `${groupNameEn} ${keywordType} ${extraKeywordEn}`.trim(),
      jp: `${groupNameJp} ${keywordType} ${extraKeywordJp}`.trim(),
      type: "main",
    },
    ...memberKeywords,
  ];
};

