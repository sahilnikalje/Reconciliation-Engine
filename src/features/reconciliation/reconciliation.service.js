const { v4: uuidv4 } = require("uuid");
const ReconciliationRun = require("../../models/ReconciliationRun");
const Transaction = require("../../models/Transaction");
const InvalidTransaction = require("../../models/InvalidTransaction");
const { runIngestion } = require("../ingestion/ingestion.service");
const { runMatching } = require("../matching/matching.service");
const { generateReport } = require("../reports/reports.service");
const logger = require("../../utils/logger");

const runReconciliation = async (toleranceSeconds, tolerancePct) => {
  const runId = uuidv4();

  const run = await ReconciliationRun.create({
    runId,
    status: "pending",
    timestampToleranceSeconds: toleranceSeconds,
    quantityTolerancePct: tolerancePct,
    startedAt: new Date(),
  });

  logger.info(`Reconciliation run started — runId: ${runId}`);

  try {
    //todo Clear previous transaction data before fresh ingestion
    await Transaction.deleteMany({});
    await InvalidTransaction.deleteMany({});

    //* Ingest
    const { userResults, exchangeResults } = await runIngestion();

    //* Match
    const matchingResults = await runMatching(toleranceSeconds, tolerancePct);

    // *Generate report
    await generateReport(runId, matchingResults);

    run.status = "completed";
    run.completedAt = new Date();
    run.totalUserTransactions = userResults.valid;
    run.totalExchangeTransactions = exchangeResults.valid;
    run.matchedCount = matchingResults.matched.length;
    run.conflictingCount = matchingResults.conflicting.length;
    run.unmatchedUserCount = matchingResults.unmatchedUser.length;
    run.unmatchedExchangeCount = matchingResults.unmatchedExchange.length;
    await run.save();

    logger.info(`Reconciliation run completed — runId: ${runId}`);

    return run;
  } 
  catch (error) {
    run.status = "failed";
    await run.save();
    logger.error(`Reconciliation run failed — runId: ${runId}, error: ${error.message}`);
    throw error;
  }
};

module.exports = { runReconciliation };