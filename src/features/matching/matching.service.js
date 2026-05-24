const Transaction = require("../../models/Transaction");
const { areTypesEquivalent } = require("../normalization/typeMapper");
const logger = require("../../utils/logger");

const isTimestampMatch = (tsA, tsB, toleranceSeconds) => {
  const diffSeconds = Math.abs(new Date(tsA) - new Date(tsB)) / 1000;
  return diffSeconds <= toleranceSeconds;
};

const isQuantityMatch = (qA, qB, tolerancePct) => {
  if (qA === 0 && qB === 0) return true;
  const diff = Math.abs(qA - qB) / Math.max(Math.abs(qA), Math.abs(qB));
  return diff <= tolerancePct;
};

const runMatching = async (toleranceSeconds, tolerancePct) => {
  const userTransactions = await Transaction.find({ source: "user" });
  const exchangeTransactions = await Transaction.find({ source: "exchange" });

  const matched = [];
  const conflicting = [];
  const matchedUserIds = new Set();
  const matchedExchangeIds = new Set();

  for (const userTx of userTransactions) {
    if (matchedUserIds.has(userTx._id.toString())) continue;

    for (const exchangeTx of exchangeTransactions) {
      if (matchedExchangeIds.has(exchangeTx._id.toString())) continue;

      //! Asset must match
      if (userTx.normalizedAsset !== exchangeTx.normalizedAsset) continue;

      //! Type must match or be equivalent
      if (!areTypesEquivalent(userTx.normalizedType, exchangeTx.normalizedType)) continue;

      const timestampOk = isTimestampMatch(userTx.timestamp, exchangeTx.timestamp, toleranceSeconds);
      const quantityOk = isQuantityMatch(userTx.quantity, exchangeTx.quantity, tolerancePct);

      if (timestampOk && quantityOk) {
        matched.push({ userTx, exchangeTx });
        matchedUserIds.add(userTx._id.toString());
        matchedExchangeIds.add(exchangeTx._id.toString());
        break;
      }

      if (!timestampOk || !quantityOk) {
        conflicting.push({ userTx, exchangeTx });
        matchedUserIds.add(userTx._id.toString());
        matchedExchangeIds.add(exchangeTx._id.toString());
        break;
      }
    }
  }

  //todo Transactions with no pair at all
  const unmatchedUser = userTransactions.filter(
    (tx) => !matchedUserIds.has(tx._id.toString())
  );

  const unmatchedExchange = exchangeTransactions.filter(
    (tx) => !matchedExchangeIds.has(tx._id.toString())
  );

  logger.info(
    `Matching complete — matched: ${matched.length}, conflicting: ${conflicting.length}, unmatchedUser: ${unmatchedUser.length}, unmatchedExchange: ${unmatchedExchange.length}`
  );

  return { matched, conflicting, unmatchedUser, unmatchedExchange };
};

module.exports = { runMatching };