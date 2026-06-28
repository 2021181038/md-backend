import React from "react";

const KEYWORD_OPTIONS = [
  { value: "ペンライト", label: "응원봉" },
  { value: "アルバム", label: "앨범" },
  { value: "MD", label: "MD" },
  { value: "フォトカード", label: "포카" },
];

const KeywordSection = ({
  keywordType,
  setKeywordType,
  handleGenerateKeywords,
  keywords,
  handleCopy,
}) => {
  return (
    <section className="ui-card">
      <h2 className="ui-card-title">검색 키워드 추출</h2>
      <p className="ui-card-desc">카테고리를 선택하고 키워드를 생성하세요.</p>

      <div className="chip-group">
        {KEYWORD_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`chip${keywordType === option.value ? " active" : ""}`}
          >
            <input
              type="radio"
              name="keywordType"
              value={option.value}
              checked={keywordType === option.value}
              onChange={(e) => setKeywordType(e.target.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: "16px" }}
        onClick={handleGenerateKeywords}
      >
        키워드 생성하기
      </button>

      {keywords.length > 0 && (
        <ul className="keyword-list">
          {keywords.map((kw, idx) => (
            <li key={idx} className="keyword-item">
              <span>{kw.keyword || kw.en || kw}</span>
              <button
                type="button"
                className="btn-copy"
                onClick={() => handleCopy(kw.keyword || kw.en || kw, "키워드")}
              >
                복사
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default KeywordSection;
