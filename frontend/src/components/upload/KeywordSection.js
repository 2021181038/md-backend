import React from "react";

const KeywordSection = ({
  keywordType,
  setKeywordType,
  memberText,
  setMemberText,
  isKeywordLoading,
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

      <div style={{ marginTop: '10px' }}>
        <textarea
          placeholder="멤버명을 쉼표로 구분해 입력하세요 (예: 리쿠, 쇼타, 유타) + 4명까지만 입력 가능합니다."
          value={memberText}
          onChange={(e) => {
            const value = e.target.value;
            const members = value.split(",").map(m => m.trim()).filter(Boolean);
            if (members.length <= 4) {
              setMemberText(value);
            } else {
              alert("최대 4명까지만 입력할 수 있다!");
            }
          }}
          style={{ width: '100%', height: '60px' }}
        />
      </div>

      <button
        className="pretty-button"
        disabled={isKeywordLoading}
        onClick={handleGenerateKeywords}
      >
        {isKeywordLoading ? "키워드 생성 중..." : "생성하기"}
      </button>

      {keywords.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h4>검색키워드</h4>
          <ul>
            {keywords.map((kw, idx) => (
              <li key={idx} style={{ marginBottom: '10px' }}>
                <div>
                  {kw.en}
                  <button
                    className="COPY-button"
                    style={{ marginLeft: '10px' }}
                    onClick={() => handleCopy(kw.en, "영어 키워드")}
                  >
                    복사하기
                  </button>
                </div>
                <div>
                  {kw.jp}
                  <button
                    className="COPY-button"
                    style={{ marginLeft: '10px' }}
                    onClick={() => handleCopy(kw.jp, "일본어 키워드")}
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

