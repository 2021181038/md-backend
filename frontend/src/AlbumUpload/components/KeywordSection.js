import React from "react";

const KeywordSection = ({
  handleGenerateKeywordsAlbum,
  keywords,
  groupName,
  handleCopy,
}) => {
  return (
    <div className="section-box">
      <h3>🔍 검색 키워드 (앨범)</h3>
      <button onClick={handleGenerateKeywordsAlbum}>
        검색 키워드 생성
      </button>

      {keywords.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          <h4>검색키워드</h4>
          <ul>
            {keywords.map((kw, idx) => (
              <li key={idx} style={{ marginBottom: '10px' }}>
                <div>
                  {kw.keyword || kw.en || kw}
                  <button
                    className="btn-secondary small"
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

