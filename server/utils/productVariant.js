const isValidWeightUnit = (value) => {
  const unit = String(value || "").trim();
  return /^[A-Za-z][A-Za-z.\s]{0,19}$/.test(unit);
};

const formatVariantLabel = (itemName, packageWeight, weightUnit) => {
  const name = (itemName || "").trim();
  const weight = Number(packageWeight);
  const unit = String(weightUnit || "").trim();

  if (!name) return "";
  if (!weight || Number.isNaN(weight) || !unit) return name;

  const weightLabel = Number.isInteger(weight)
    ? String(weight)
    : String(weight).replace(/\.?0+$/, "");

  const unitLabel = unit.length <= 2 ? unit : ` ${unit}`;
  return `${name} ${weightLabel}${unitLabel}`.replace(/\s+/g, " ").trim();
};

module.exports = {
  isValidWeightUnit,
  formatVariantLabel,
};
