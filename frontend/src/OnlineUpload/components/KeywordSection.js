import React from "react";

const KeywordSection = ({
  keywordType,
  setKeywordType,
  handleGenerateKeywords,
  keywords,
  handleCopy,
}) => {
  return (
    <div style={{ marginTop: '30px' }}>
      <h3>🔎 검색 키워드 추출</h3>

      <div>
        <label>
          <input
            type="radio"
            name="keywordType"
            value="ペンライト"
            checked={keywordType === "ペンライト"}
            onChange={(e) => setKeywordType(e.target.value)}
          /> 응원봉
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            name="keywordType"
            value="アルバム"
            checked={keywordType === "アルバム"}
            onChange={(e) => setKeywordType(e.target.value)}
          /> 앨범
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            name="keywordType"
            value="MD"
            checked={keywordType === "MD"}
            onChange={(e) => setKeywordType(e.target.value)}
          /> MD
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            name="keywordType"
            value="フォトカード"
            checked={keywordType === "フォトカード"}
            onChange={(e) => setKeywordType(e.target.value)}
          /> 포카
        </label>
      </div>

      <button
        className="pretty-button"
        style={{ marginTop: '10px' }}
        onClick={handleGenerateKeywords}
      >
        키워드 생성하기
      </button>

      {keywords.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h4>검색키워드</h4>
          <ul>
            {keywords.map((kw, idx) => (
              <li key={idx} style={{ marginBottom: '10px' }}>
                <div>
                  {kw.keyword || kw.en || kw}
                  <button
                    className="COPY-button"
                    style={{ marginLeft: '10px' }}
                    onClick={() => handleCopy(kw.keyword || kw.en || kw, "키워드")}
                  >
                    복사하기
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KeywordSection;

