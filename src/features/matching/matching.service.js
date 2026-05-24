const Transaction = require("../../models/Transaction");
const { areTypesEquivalent } = require("../normalization/typeMapper");
const logger = require("../../utils/logger");

//todo Check if two timestamps are within allowed tolerance
const isTimestampMatch = (tsA, tsB, toleranceSeconds) => {
  const diffSeconds = Math.abs(new Date(tsA) - new Date(tsB)) / 1000;
  return diffSeconds <= toleranceSeconds;
};

//todo Check if two quantities are within allowed percentage tolerance
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
  const matchedExchangeIds = new Set();

  for (const userTx of userTransactions) {
    let bestMatch = null;

    for (const exchangeTx of exchangeTransactions) {
      //todo Skip already matched exchange transactions
      if (matchedExchangeIds.has(exchangeTx._id.toString())) continue;

      if (userTx.normalizedAsset !== exchangeTx.normalizedAsset) continue;

      if (!areTypesEquivalent(userTx.normalizedType, exchangeTx.normalizedType)) continue;

      const timestampOk = isTimestampMatch(userTx.timestamp, exchangeTx.timestamp, toleranceSeconds);
      const quantityOk = isQuantityMatch(userTx.quantity, exchangeTx.quantity, tolerancePct);

      if (timestampOk && quantityOk) {
        bestMatch = { exchangeTx, status: "matched" };
        break;
      }

      const timeDiff = Math.abs(new Date(userTx.timestamp) - new Date(exchangeTx.timestamp)) / 1000;
      if (timeDiff <= toleranceSeconds * 3) {
        bestMatch = { exchangeTx, status: "conflicting" };
      }
    }

    if (bestMatch) {
      matchedExchangeIds.add(bestMatch.exchangeTx._id.toString());

      if (bestMatch.status === "matched") {
        matched.push({ userTx, exchangeTx: bestMatch.exchangeTx });
      } else {
        conflicting.push({ userTx, exchangeTx: bestMatch.exchangeTx });
      }
    }
  }

  const unmatchedUser = userTransactions.filter(
    (tx) => !matched.find((m) => m.userTx._id.equals(tx._id)) &&
             !conflicting.find((c) => c.userTx._id.equals(tx._id))
  );

  const unmatchedExchange = exchangeTransactions.filter(
    (tx) => !matchedExchangeIds.has(tx._id.toString())
  );

  logger.info(`Matching complete — matched: ${matched.length}, conflicting: ${conflicting.length}, unmatchedUser: ${unmatchedUser.length}, unmatchedExchange: ${unmatchedExchange.length}`);

  return { matched, conflicting, unmatchedUser, unmatchedExchange };
};

module.exports = { runMatching };