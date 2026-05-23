const express = require("express");
const {
  triggerReconciliation,
  getReport,
  getReportSummary,
  getUnmatched,
} = require("./reconciliation.controller");

const reconciliationRouter = express.Router();

//todo POST /api/reconciliation/reconcile
reconciliationRouter.post("/reconcile", triggerReconciliation);

//todo GET /api/reconciliation/report/:runId
reconciliationRouter.get("/report/:runId", getReport);

//todo GET /api/reconciliation/report/:runId/summary
reconciliationRouter.get("/report/:runId/summary", getReportSummary);

//todo GET /api/reconciliation/report/:runId/unmatched
reconciliationRouter.get("/report/:runId/unmatched", getUnmatched);

module.exports = reconciliationRouter;