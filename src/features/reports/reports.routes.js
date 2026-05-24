const express = require("express");
const { getReport, getReportSummary, getUnmatched } = require("./reports.controller");

const reportsRouter = express.Router();

//todo GET /api/reports/:runId
reportsRouter.get("/:runId", getReport);

//todo GET /api/reports/:runId/summary
reportsRouter.get("/:runId/summary", getReportSummary);

//todo GET /api/reports/:runId/unmatched
reportsRouter.get("/:runId/unmatched", getUnmatched);

module.exports = reportsRouter;