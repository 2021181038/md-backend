import React from "react";

const BonusSection = ({ bonusSets, setBonusSets }) => {
  return (
    <div style={{ marginTop: '0px', marginBottom: '10px' }}>
      <h3>🎁 특전조건 입력</h3>

      {bonusSets.map((set, idx) => (
        <div key={idx} style={{ marginBottom: "10px" }}>
          <label>기준 숫자: </label>
          <input
            type="number"
            value={set.base}
            onChange={(e) => {
              const newSets = [...bonusSets];
              newSets[idx].base = e.target.value;
              setBonusSets(newSets);
            }}
            placeholder="예: 5"
            style={{ width: "100px", marginLeft: "8px" }}
          />

          {bonusSets.length > 1 && (
            <>
              <label style={{ marginLeft: "10px" }}>특전 이름: </label>
              <input
                type="text"
                value={set.label}
                onChange={(e) => {
                  const newSets = [...bonusSets];
                  newSets[idx].label = e.target.value;
                  setBonusSets(newSets);
                }}
                placeholder="예: FRAGILE ver."
                style={{ width: "200px", marginLeft: "8px" }}
              />
            </>
          )}

          {bonusSets.length > 1 && idx === bonusSets.length - 1 && (
            <span style={{ marginLeft: "15px", color: "blue" }}>
              {(() => {
                const validSets = bonusSets.filter(s => s.base && s.label);
                if (validSets.length > 1) {
                  const maxBase = Math.max(...validSets.map(s => Number(s.base)));
                  const maxPrice = maxBase * 1600 - 100;
                  return `例: ${maxPrice}円の場合 → ` +
                    validSets.map(s => {
                      const count = Math.floor(maxPrice / (s.base * 1600 - 100));
                      return `${s.label} ${count}枚`;
                    }).join(" + ");
                }
                return null;
              })()}
            </span>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setBonusSets([...bonusSets, { base: "", label: "" }])}
      >
        특전 추가 +
      </button>
      {bonusSets.length > 1 && (
        <button
          type="button"
          onClick={() => setBonusSets(bonusSets.slice(0, -1))}
          style={{ marginLeft: "10px", color: "red" }}
        >
          특전 삭제 -
        </button>
      )}
      {bonusSets.length === 1 && bonusSets[0].base && (
        <div>
          <p>{bonusSets[0].base * 1600 - 100}円以上 : 公式特典1枚</p>
          <p>{bonusSets[0].base * 3200 - 200}円以上 : 公式特典2枚</p>
          <p>{bonusSets[0].base * 4800 - 300}円以上 : 公式特典3枚 (以降も…)</p>
        </div>
      )}
    </div>
  );
};

export default BonusSection;

