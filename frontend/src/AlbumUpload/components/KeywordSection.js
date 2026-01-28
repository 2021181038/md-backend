import React from "react";

const KeywordSection = ({
  memberText,
  setMemberText,
  handleGenerateKeywordsAlbum,
  keywords,
  groupName,
  albumNameEn,
  albumNameJp,
}) => {
  return (
    <div className="section-box">
      <h3>🔍 검색 키워드 (앨범)</h3>
      <input
        type="text"
        placeholder="멤버명 (콤마 구분)"
        value={memberText}
        onChange={(e) => setMemberText(e.target.value)}
      />
      <button onClick={handleGenerateKeywordsAlbum}>
        검색 키워드 생성
      </button>

      {keywords.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          {(() => {
            const main = keywords.find(k => k.type === "main");
            if (!main) return null;
            const groupEn = groupName;
            const groupJp = main.jp.split(" ")[0];

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <strong style={{ width: "70px" }}>그룹명</strong>
                  <span style={{ flex: 1 }}>{groupEn}</span>
                  <button
                    className="btn-secondary small"
                    onClick={() => navigator.clipboard.writeText(groupJp)}
                  >
                    JP
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <strong style={{ width: "70px" }}>앨범명</strong>
                  <span style={{ flex: 1 }}>{albumNameEn}</span>
                  <button
                    className="btn-secondary small"
                    onClick={() => navigator.clipboard.writeText(albumNameJp)}
                  >
                    JP
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <strong style={{ width: "70px" }}>앨범</strong>
                  <span style={{ flex: 1 }}>CD</span>
                  <button
                    className="btn-secondary small"
                    onClick={() => navigator.clipboard.writeText("CD")}
                  >
                    EN
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {keywords.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          {keywords
            .filter(k => k.type === "member")
            .map((k, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: "14px"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div>
                    <strong>[EN]</strong> {k.en}
                  </div>
                  <div style={{ color: "#666", marginTop: "2px" }}>
                    <strong>[JP]</strong> {k.jp}
                  </div>
                </div>
                <button
                  className="btn-secondary small"
                  onClick={() => navigator.clipboard.writeText(k.en)}
                >
                  EN
                </button>
                <button
                  className="btn-secondary small"
                  onClick={() => navigator.clipboard.writeText(k.jp)}
                >
                  JP
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default KeywordSection;

