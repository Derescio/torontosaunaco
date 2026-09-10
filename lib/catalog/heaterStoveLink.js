const POWER_REQUIRED_FAMILIES = new Set([
  "huum-drop",
  "harvia-kip",
  "homecraft-revive",
  "designer-b",
  "huum-hive",
]);

export function normalizeHeaterText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/wi-?fi/g, "wifi")
    .replace(/[_+/(),-]+/g, " ")
    .replace(/[^\w.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getHeaterFamily(...parts) {
  const n = normalizeHeaterText(parts.filter(Boolean).join(" "));
  if (!n) return null;
  if (/\b(chiller|penguin|coldture)\b/.test(n) || n === "no chiller") {
    return null;
  }
  if (n.includes("huum") && n.includes("hive") && n.includes("mini")) {
    return "huum-hive-mini";
  }
  if (n.includes("huum") && n.includes("hive")) return "huum-hive";
  if (n.includes("huum") && n.includes("drop")) return "huum-drop";
  if (n.includes("harvia") && n.includes("kip")) return "harvia-kip";
  if (n.includes("narvi") && (/\bnc\s*20\b/.test(n) || /\bnarvi\s*20\b/.test(n))) {
    return "narvi-nc-20";
  }
  if (n.includes("narvi") && (/\bnc\s*16\b/.test(n) || /\bnarvi\s*16\b/.test(n))) {
    return "narvi-nc-16";
  }
  if (n.includes("homecraft") || n.includes("home craft")) {
    return "homecraft-revive";
  }
  if (n.includes("designer") && /\bb\b/.test(n)) return "designer-b";
  return null;
}

export function getHeaterPowerKw(...parts) {
  const text = normalizeHeaterText(
    parts
      .filter((part) => part != null && typeof part !== "number")
      .join(" ")
  );

  if (text) {
    const kwMatch = text.match(/(\d+(?:\.\d+)?)\s*k\s*w/);
    if (kwMatch) return Number(kwMatch[1]);

    const modelMatch = text.match(
      /\b(?:drop|kip|hc|nc|kuru)[\s-]*(\d+(?:\.\d+)?)\b/
    );
    if (modelMatch) return Number(modelMatch[1]);
  }

  for (const part of parts) {
    if (typeof part === "number" && Number.isFinite(part) && part > 0) {
      return part;
    }
  }

  return null;
}

export function stoveOptionMatchesHeater(optionKey, option, heater) {
  if (!heater || !optionKey) return false;

  const optionFamily = getHeaterFamily(optionKey, option?.name, option?.model);
  const heaterFamily = getHeaterFamily(
    heater.name,
    heater.model,
    heater.slug
  );
  if (!optionFamily || !heaterFamily || optionFamily !== heaterFamily) {
    return false;
  }

  const optionPower = getHeaterPowerKw(
    optionKey,
    option?.power,
    option?.name,
    option?.model
  );
  const heaterPower = getHeaterPowerKw(
    heater.power,
    heater.name,
    heater.model,
    heater.slug
  );

  if (optionPower != null && heaterPower != null) {
    return optionPower === heaterPower;
  }

  if (POWER_REQUIRED_FAMILIES.has(heaterFamily)) {
    return false;
  }

  return true;
}

function cloneOption(rawValue) {
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return { price: rawValue };
  }
  if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
    return { ...rawValue };
  }
  return { price: 0 };
}

function applyHeaterFieldsToOption(option, heater, previousHeater) {
  const next = { ...option, heaterId: String(heater._id) };
  const previousBase = previousHeater?.basePrice;
  const nextBase = heater.basePrice;

  if (typeof next.priceOffset !== "number") {
    const baseForOffset =
      typeof previousBase === "number" ? previousBase : nextBase;
    if (typeof next.price === "number" && typeof baseForOffset === "number") {
      next.priceOffset = next.price - baseForOffset;
    } else {
      next.priceOffset = 0;
    }
  }

  if (typeof nextBase === "number") {
    next.price = nextBase + next.priceOffset;
  }

  return next;
}

export function applyHeaterToStoveType(
  stoveType,
  heater,
  previousHeater = heater
) {
  if (!stoveType || typeof stoveType !== "object" || Array.isArray(stoveType)) {
    return { stoveType, changed: false, matchedKeys: [] };
  }

  const heaterId = String(heater?._id || "");
  if (!heaterId) {
    return { stoveType, changed: false, matchedKeys: [] };
  }

  const previousName = previousHeater?.name;
  const nextName = heater?.name;
  const shouldRenameExactKey =
    typeof previousName === "string" &&
    typeof nextName === "string" &&
    previousName.trim() !== "" &&
    nextName.trim() !== "" &&
    previousName !== nextName;

  const next = {};
  const matchedKeys = [];
  let changed = false;

  for (const [key, rawValue] of Object.entries(stoveType)) {
    const option = cloneOption(rawValue);
    const linkedId = option.heaterId ? String(option.heaterId) : "";
    const linkedToOther = Boolean(linkedId && linkedId !== heaterId);
    const matches =
      linkedId === heaterId ||
      (!linkedToOther && stoveOptionMatchesHeater(key, option, heater));

    if (!matches) {
      next[key] = rawValue;
      continue;
    }

    const updatedOption = applyHeaterFieldsToOption(
      option,
      heater,
      previousHeater
    );
    const nextKey =
      shouldRenameExactKey && key === previousName ? nextName : key;
    next[nextKey] = updatedOption;
    matchedKeys.push(nextKey);

    if (
      JSON.stringify({ key, value: option }) !==
      JSON.stringify({ key: nextKey, value: updatedOption })
    ) {
      changed = true;
    }
  }

  return {
    stoveType: changed ? next : stoveType,
    changed,
    matchedKeys,
  };
}
