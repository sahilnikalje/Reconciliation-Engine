const Report = require("../../models/Report");
const logger = require("../../utils/logger");

const generateReport = async (runId, matchingResults) => {
  const { matched, conflicting, unmatchedUser, unmatchedExchange } = matchingResults;
  const entries = [];

  for (const { userTx, exchangeTx } of matched) {
    entries.push({
      runId,
      category: "matched",
      reason: "Transaction matched within tolerance",
      userTransaction: userTx,
      exchangeTransaction: exchangeTx,
    });
  }

  for (const { userTx, exchangeTx } of conflicting) {
    entries.push({
      runId,
      category: "conflicting",
      reason: "Transaction matched by asset and type but exceeded timestamp or quantity tolerance",
      userTransaction: userTx,
      exchangeTransaction: exchangeTx,
    });
  }

  //* */ Unmatched user transactions
  for (const userTx of unmatchedUser) {
    entries.push({
      runId,
      category: "unmatched_user",
      reason: "No matching exchange transaction found",
      userTransaction: userTx,
      exchangeTransaction: null,
    });
  }

  //* Unmatched exchange transactions
  for (const exchangeTx of unmatchedExchange) {
    entries.push({
      runId,
      category: "unmatched_exchange",
      reason: "No matching user transaction found",
      userTransaction: null,
      exchangeTransaction: exchangeTx,
    });
  }

  //* Bulk insert all report entries
  await Report.insertMany(entries);
  logger.info(`Report generated for runId: ${runId} — total entries: ${entries.length}`);

  return entries.length;
};

module.exports = { generateReport };