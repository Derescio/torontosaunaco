function seriesName(heater) {
  return typeof heater?.series === "string" ? heater.series.trim() : "";
}

export function groupHeatersBySeries(heaters) {
  const groups = [];
  const bySeries = new Map();

  for (const heater of heaters ?? []) {
    const series = seriesName(heater);
    if (!series) {
      groups.push({
        series: null,
        variants: [heater],
        representative: heater,
      });
      continue;
    }

    let group = bySeries.get(series);
    if (!group) {
      group = { series, variants: [], representative: null };
      bySeries.set(series, group);
      groups.push(group);
    }
    group.variants.push(heater);
  }

  for (const group of groups) {
    if (!group.series) continue;
    group.variants.sort(
      (a, b) => (Number(a.power) || 0) - (Number(b.power) || 0)
    );
    group.representative = group.variants[0];
  }

  return groups;
}
