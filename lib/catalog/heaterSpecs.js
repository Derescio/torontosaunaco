const CLONED_WARRANTY =
  "3-year manufacturer warranty on electrical components";

function hasNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function formatAmount(value) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function roomSizeLabel(roomSize) {
  if (!roomSize) return null;
  if (hasNumber(roomSize.imperial_min) && hasNumber(roomSize.imperial_max)) {
    return `${formatAmount(roomSize.imperial_min)}–${formatAmount(roomSize.imperial_max)} cu ft`;
  }
  if (hasNumber(roomSize.imperial_max)) {
    return `up to ${formatAmount(roomSize.imperial_max)} cu ft`;
  }
  if (hasNumber(roomSize.min) && hasNumber(roomSize.max)) {
    return `${formatAmount(roomSize.min)}–${formatAmount(roomSize.max)} m³`;
  }
  return null;
}

function sizeLabel(specifications) {
  const dimensions = specifications?.dimensions;
  const emptyWeight = specifications?.weight?.imperial;
  let size = null;

  if (dimensions) {
    const height = dimensions.height?.imperial;
    const diameter = dimensions.diameter?.imperial;
    const width = dimensions.width?.imperial;
    const depth = dimensions.depth?.imperial;

    if (hasNumber(diameter) && hasNumber(height)) {
      size = `${formatAmount(diameter)} in diameter × ${formatAmount(height)} in H`;
    } else if (hasNumber(width) && hasNumber(depth) && hasNumber(height)) {
      size = `${formatAmount(width)} in W × ${formatAmount(depth)} in D × ${formatAmount(height)} in H`;
    } else if (hasNumber(width) && hasNumber(height)) {
      size = `${formatAmount(width)} in W × ${formatAmount(height)} in H`;
    } else if (
      hasNumber(dimensions.width?.metric) &&
      hasNumber(dimensions.depth?.metric)
    ) {
      const heightMm = dimensions.height?.metric;
      size = hasNumber(heightMm)
        ? `${dimensions.width.metric} × ${dimensions.depth.metric} × ${heightMm} mm`
        : `${dimensions.width.metric} × ${dimensions.depth.metric} mm`;
    }
  }

  if (!hasNumber(emptyWeight)) return size;
  const empty = `${formatAmount(emptyWeight)} lbs empty`;
  return size ? `${size}; ${empty}` : empty;
}

function stonesLabel(stoneCapacity) {
  if (!hasNumber(stoneCapacity?.imperial_weight)) return null;
  const pounds = `${formatAmount(stoneCapacity.imperial_weight)} lbs`;
  const note =
    typeof stoneCapacity.note === "string" ? stoneCapacity.note.trim() : "";
  return note ? `${pounds} (${note})` : pounds;
}

function electricalLines(electrical) {
  if (!Array.isArray(electrical)) return null;
  const lines = electrical
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean);
  return lines.length > 0 ? lines : null;
}

function textValue(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function warrantyLabel(warranty) {
  if (!hasNumber(warranty?.duration) || warranty.duration <= 0) return null;
  const description =
    typeof warranty.description === "string" ? warranty.description.trim() : "";
  if (description === CLONED_WARRANTY) return null;
  return warranty.duration === 1 ? "1 year" : `${warranty.duration} years`;
}

export function heaterSpecRows(heater) {
  const specifications = heater?.specifications ?? {};
  const rows = [];
  const add = (label, value) => {
    if (value == null || value === "") return;
    rows.push({ label, value });
  };

  if (hasNumber(heater?.power) && heater.power > 0) {
    add("Output", `${formatAmount(heater.power)} kW`);
  } else if (heater && heater.power === 0) {
    add("Output", "Wood burning");
  }

  add("Room size", roomSizeLabel(specifications.roomSize));
  add("Stones", stonesLabel(specifications.stoneCapacity));
  add("Size", sizeLabel(specifications));

  const electrical = electricalLines(specifications.electrical);
  if (electrical) rows.push({ label: "Electrical", value: electrical });

  add("Clearance", textValue(specifications.clearance));
  add("Mounting", textValue(specifications.mounting));
  add("Controls", textValue(specifications.controls));
  add("Warranty", warrantyLabel(heater?.warranty));

  return rows;
}
