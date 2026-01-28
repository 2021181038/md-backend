export const groupByCustomPrice = (items) => {
  const sorted = [...items].sort((a, b) => Number(a.price) - Number(b.price));
  let remaining = [...sorted];
  const groups = [];

  while (remaining.length > 0) {
    const prices = remaining.map(item => Number(item.price));
    const min = Math.min(...prices);
    const rawStandard = min * 1.6;
    const lowerBound = rawStandard * 0.5;
    const upperBound = rawStandard * 1.5;

    const group = remaining.filter(item => {
      const p = Number(item.price);
      return p >= lowerBound && p <= upperBound;
    });

    let standardPrice;
    if (group.length === 1) {
      standardPrice = Number(group[0].price);
    } else {
      const maxPrice = Math.max(...group.map(g => Number(g.price)));
      let raw = Math.round(maxPrice * 0.68);
      standardPrice = Math.ceil(raw / 100) * 100 - 10;
    }

    const hasStandard = group.some(item => Number(item.price) === standardPrice);
    if (!hasStandard) {
      group.push({
        name: "–",
        price: standardPrice.toString(),
        quantity: 0
      });
    }

    const updatedGroup = group.map(item => ({
      ...item,
      diffFromStandard: Number(item.price) - standardPrice
    }));

    groups.push({ standardPrice, items: updatedGroup });

    const ids = new Set(group.map(g => g.name + g.price));
    remaining = remaining.filter(item => !ids.has(item.name + item.price));
  }

  return groups;
};

