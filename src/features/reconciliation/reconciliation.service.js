const { v4: uuidv4 } = require("uuid");
const ReconciliationRun = require("../../models/ReconciliationRun");
const { runIngestion } = require("../ingestion/ingestion.service");
const { runMatching } = require("../matching/matching.service");
const { generateReport } = require("../reports/reports.service");
const logger = require("../../utils/logger");

const runReconciliation = async (toleranceSeconds, tolerancePct) => {
  const runId = uuidv4();

  //todo Create a new reconciliation run record
  const run = await ReconciliationRun.create({
    runId,
    status: "pending",
    timestampToleranceSeconds: toleranceSeconds,
    quantityTolerancePct: tolerancePct,
    startedAt: new Date(),
  });

  logger.info(`Reconciliation run started — runId: ${runId}`);

  try {
    //todo Ingest both CSV files
    const { userResults, exchangeResults } = await runIngestion();

    //todo Run matching engine
    const matchingResults = await runMatching(toleranceSeconds, tolerancePct);

    //todo Generate and store report
    await generateReport(runId, matchingResults);

    //todo Update run record with final counts
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
  } catch (error) {
    //todo Mark run as failed if anything goes wrong
    run.status = "failed";
    await run.save();
    logger.error(`Reconciliation run failed — runId: ${runId}, error: ${error.message}`);
    throw error;
  }
};

module.exports = { runReconciliation };