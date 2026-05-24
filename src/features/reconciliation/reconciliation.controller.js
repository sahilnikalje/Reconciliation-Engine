const { runReconciliation } = require("./reconciliation.service");
const logger = require("../../utils/logger");

//todo POST /api/reconciliation/reconcile
const triggerReconciliation = async (req, res, next) => {
  try {
    const toleranceSeconds = req.body.timestampToleranceSeconds || Number(process.env.TIMESTAMP_TOLERANCE_SECONDS) 
    const tolerancePct = req.body.quantityTolerancePct || Number(process.env.QUANTITY_TOLERANCE_PCT) 

    const run = await runReconciliation(toleranceSeconds, tolerancePct);

    res.json({ success: true, message: "Reconciliation completed", run });
  } catch (error) {
    logger.error(`Reconciliation failed: ${error.message}`);
    next(error);
  }
};

module.exports = { triggerReconciliation };