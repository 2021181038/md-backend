export const groupByCustomPrice = (items) => {
  const sorted = [...items].sort((a, b) => Number(a.price) - Number(b.price));
  let remaining = [...sorted];
  const groups = [];

  // ⭐ 옵션 상품이 어느 그룹에 들어갔는지 기록
  const optionGroupMap = {};

  while (remaining.length > 0) {
    const prices = remaining.map((i) => Number(i.price));
    const min = Math.min(...prices);

    const rawStandard = min * 2;
    const lowerBound = rawStandard * 0.5;
    const upperBound = rawStandard * 1.5;

    const group = remaining.filter((item) => {
      const p = Number(item.price);
      return p >= lowerBound && p <= upperBound;
    });

    /* ===============================
       ⭐ 여기서 즉시 검사
    =============================== */
    for (const item of group) {
      if (!item.hasOption) continue;

      const baseName = item.name.split(" - ")[0];

      if (!(baseName in optionGroupMap)) {
        // 처음 등장 → 현재 그룹 index 기록
        optionGroupMap[baseName] = groups.length;
      } else if (optionGroupMap[baseName] !== groups.length) {
        // ❌ 다른 그룹으로 들어가려는 순간
        const memberName = item.name.split(" - ")[1] || item.name;
        alert(`${memberName} 가격을 조정해야해요. 같은 앨범이 하나의 그룹으로 묶이지 않아요`);
        return null; // ⭐ 즉시 중단
      }
    }
    /* =============================== */

    let standardPrice;
    if (group.length === 1) {
      standardPrice = Number(group[0].price);
    } else {
      const maxPrice = Math.max(...group.map((g) => Number(g.price)));
      let raw = Math.round(maxPrice * 0.68);
      standardPrice = Math.ceil(raw / 100) * 100 - 10;
    }

    const hasStandard = group.some(
      (item) => Number(item.price) === standardPrice
    );

    if (!hasStandard) {
      group.push({
        name: "–",
        price: standardPrice.toString(),
        hasOption: false,
        isDummy: true, 
      });
    }

    const updatedGroup = group.map((item) => {
      const diff = Number(item.price) - standardPrice;
      const diffText = diff >= 0 ? `+${diff}` : `${diff}`;

      return {
        ...item,
        displayName: `${item.name} ${diffText}`,
        diffFromStandard: diff,
      };
    });

    const sortedGroup = [...updatedGroup].sort(
      (a, b) => a.name.localeCompare(b.name, "ko")
    );

    groups.push({ standardPrice, items: sortedGroup });

    const ids = new Set(group.map((g) => g.name + g.price));
    remaining = remaining.filter((item) => !ids.has(item.name + item.price));
  }

  return groups;
};

export const collectAllItems = (sets) => {
  let all = [];

  sets.forEach((set) => {
    if (set.type === "withOption") {
      set.rows.forEach((r) => {
        all.push({
          name: `${set.productName} - ${r.memberName || "?"}`,
          price: Number(r.priceYen),
          hasOption: true,
        });
      });
    } else {
      set.rows.forEach((r) => {
        all.push({
          name: r.productName,
          price: Number(r.priceYen),
          hasOption: false,
        });
      });
    }
  });

  return all;
};

export const judgeOptionResult = (rows, purchaseCost, expectedSales) => {
  if (rows.length === 1) return "가능 !";
  return expectedSales > purchaseCost
    ? "가능 !"
    : "불가능 ! 가격 조정 다시 하세요";
};

