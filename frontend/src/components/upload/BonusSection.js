import React from "react";
import { getBonusMultiplier } from "../../utils/descriptionUtils";

const BonusSection = ({ bonusSets, setBonusSets, uploadMode = "offline" }) => {
  const multiplier = getBonusMultiplier(uploadMode);

  return (
    <section className="ui-card">
      <h2 className="ui-card-title">특전조건 입력</h2>
      <p className="ui-card-desc">
        현재 {uploadMode === "online" ? "온라인" : "현장"} 버전 기준으로 미리보기가 표시됩니다.
      </p>

      {bonusSets.map((set, idx) => (
        <div key={idx} className="bonus-row">
          <label className="ui-label" style={{ marginBottom: 0 }}>기준 숫자</label>
          <input
            type="number"
            className="ui-input"
            value={set.base}
            onChange={(e) => {
              const newSets = [...bonusSets];
              newSets[idx].base = e.target.value;
              setBonusSets(newSets);
            }}
            placeholder="예: 5"
          />

          {bonusSets.length > 1 && (
            <>
              <label className="ui-label" style={{ marginBottom: 0 }}>특전 이름</label>
              <input
                type="text"
                className="ui-input ui-input--wide"
                value={set.label}
                onChange={(e) => {
                  const newSets = [...bonusSets];
                  newSets[idx].label = e.target.value;
                  setBonusSets(newSets);
                }}
                placeholder="예: FRAGILE ver."
              />
            </>
          )}

          {bonusSets.length > 1 && idx === bonusSets.length - 1 && (
            <span className="bonus-preview-hint">
              {(() => {
                const validSets = bonusSets.filter(s => s.base && s.label);
                if (validSets.length > 1) {
                  const maxBase = Math.max(...validSets.map(s => Number(s.base)));
                  const maxPrice = maxBase * multiplier - 100;
                  return `例: ${maxPrice}円の場合 → ` +
                    validSets.map(s => {
                      const count = Math.floor(maxPrice / (s.base * multiplier - 100));
                      return `${s.label} ${count}枚`;
                    }).join(" + ");
                }
                return null;
              })()}
            </span>
          )}
        </div>
      ))}

      <div className="btn-row">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setBonusSets([...bonusSets, { base: "", label: "" }])}
        >
          특전 추가 +
        </button>
        {bonusSets.length > 1 && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setBonusSets(bonusSets.slice(0, -1))}
          >
            특전 삭제 -
          </button>
        )}
      </div>

      {bonusSets.length === 1 && bonusSets[0].base && (
        <div className="bonus-preview">
          <p>{bonusSets[0].base * multiplier - 100}円以上 : 公式特典1枚</p>
          <p>{bonusSets[0].base * multiplier * 2 - 200}円以上 : 公式特典2枚</p>
          <p>{bonusSets[0].base * multiplier * 3 - 300}円以上 : 公式特典3枚 (以降も…)</p>
        </div>
      )}
    </section>
  );
};

export default BonusSection;
