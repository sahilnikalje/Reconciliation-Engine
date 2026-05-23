const { runIngestion } = require("./ingestion.service");
const logger = require("../../utils/logger");

const ingestTransactions = async (req, res, next) => {
  try {
    logger.info("Ingestion triggered via API")
    const results = await runIngestion()

    res.json({
      success: true,
      message: "Ingestion completed",
      results,
    });
  } catch (error) {
    logger.error(`Ingestion failed: ${error.message}`)
    next(error)
  }
};

module.exports = { ingestTransactions }