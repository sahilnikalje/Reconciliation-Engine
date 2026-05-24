const Report = require("../../models/Report");
const logger = require("../../utils/logger");

//todo full report
const getReport = async (req, res, next) => {
  try {
    const { runId } = req.params;
    const report = await Report.find({ runId });
    res.json({ success: true, runId, data: report });
  } catch (error) {
    logger.error(`Failed to fetch report: ${error.message}`);
    next(error);
  }
};

//todo counts only
const getReportSummary = async (req, res, next) => {
  try {
    const { runId } = req.params;

    const matched = await Report.countDocuments({ runId, category: "matched" });
    const conflicting = await Report.countDocuments({ runId, category: "conflicting" });
    const unmatchedUser = await Report.countDocuments({ runId, category: "unmatched_user" });
    const unmatchedExchange = await Report.countDocuments({ runId, category: "unmatched_exchange" });

    res.json({ success: true, runId, summary: { matched, conflicting, unmatchedUser, unmatchedExchange } });
  } catch (error) {
    logger.error(`Failed to fetch summary: ${error.message}`);
    next(error);
  }
};

//todo unmatched rows only
const getUnmatched = async (req, res, next) => {
  try {
    const { runId } = req.params;
    const unmatched = await Report.find({
      runId,
      category: { $in: ["unmatched_user", "unmatched_exchange"] },
    });
    res.json({ success: true, runId, data: unmatched });
  } catch (error) {
    logger.error(`Failed to fetch unmatched: ${error.message}`);
    next(error);
  }
};

module.exports = { getReport, getReportSummary, getUnmatched };