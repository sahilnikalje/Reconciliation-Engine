const express=require('express')
const{triggerReconciliation, getReport, getReportSummary, getUnmatched}=require('./reconciliation.controller')

const reconciliationRouter=express.Router()

//todo POST /api/reconcile — trigger a new reconciliation run
reconciliationRouter.post("/reconcile", triggerReconciliation)

//todo GET /api/report/:runId — fetch full report
reconciliationRouter.get("/report/:runId", getReport)

//todo GET /api/report/:runId/summary — fetch counts summary
reconciliationRouter.get("/report/:runId/summary", getReportSummary)

//todo GET /api/report/:runId/unmatched — fetch unmatched transactions
reconciliationRouter.get("/report/:runId/unmatched", getUnmatched)

module.exports=reconciliationRouter