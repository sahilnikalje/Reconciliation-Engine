const { runReconciliation } = require("./reconciliation.service");
const logger = require("../../utils/logger");

const triggerReconciliation = async (req, res, next) => {
  try {
    const toleranceSeconds = req.body?.timestampToleranceSeconds || Number(process.env.TIMESTAMP_TOLERANCE_SECONDS) || 300;
    const tolerancePct = req.body?.quantityTolerancePct || Number(process.env.QUANTITY_TOLERANCE_PCT) || 0.01;

    const run = await runReconciliation(toleranceSeconds, tolerancePct);

    res.json({ success: true, message: "Reconciliation completed", run });
  } catch (error) {
    logger.error(`Reconciliation failed: ${error.message}`);
    next(error);
  }
};

module.exports = { triggerReconciliation };