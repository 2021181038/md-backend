const API_BASE = process.env.REACT_APP_API_BASE;

export const generateKeywordsByGPT = async (rawKeywords) => {
  if (!rawKeywords.trim()) {
    throw new Error("키워드를 입력해주세요.");
  }

  const res = await fetch(
    `${API_BASE}/generate-album-keywords`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords: rawKeywords,
      }),
    }
  );

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
};

export const translateMembersEn = async (members) => {
  const res = await fetch(`${API_BASE}/translate-members-en`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members }),
  });
  const data = await res.json();
  return data.translatedMembersEn;
};

export const translateMembersJp = async (members) => {
  const res = await fetch(`${API_BASE}/translate-members-jp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members }),
  });
  const data = await res.json();
  return data.translatedMembersJp;
};

