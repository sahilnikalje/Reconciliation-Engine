const equivalentTypePairs = [
  ["TRANSFER_IN", "TRANSFER_OUT"],
  ["BUY", "SELL"],
];

//todo Normalize type to uppercase for consistent comparison
const normalizeType = (type) => {
  if (!type) return null;
  return type.trim().toUpperCase();
};

//todo Check if two transaction types are considered equivalent
const areTypesEquivalent = (typeA, typeB) => {
  const a = normalizeType(typeA);
  const b = normalizeType(typeB);

  if (a === b) return true;

  //todo Check against known equivalent pairs
  return equivalentTypePairs.some(
    (pair) => (pair[0] === a && pair[1] === b) || (pair[1] === a && pair[0] === b)
  );
};

module.exports = { normalizeType, areTypesEquivalent };