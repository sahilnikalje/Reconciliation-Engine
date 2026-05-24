const express = require("express");
const { triggerReconciliation } = require("./reconciliation.controller");

const reconciliationRouter = express.Router();

//todo POST /api/reconciliation/reconcile
reconciliationRouter.post("/reconcile", triggerReconciliation);

module.exports = reconciliationRouter;