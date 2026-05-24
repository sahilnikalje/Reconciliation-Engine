const path = require("path");
const fs = require("fs");
const { parseAndStoreCSV } = require("./ingestion.parser");
const logger = require("../../utils/logger");

const runIngestion = async () => {
  const userFilePath = path.join(__dirname, "../../../data/user_transactions.csv");
  const exchangeFilePath = path.join(__dirname, "../../../data/exchange_transactions.csv");

  //todo Check if CSV files exist before parsing
  if (!fs.existsSync(userFilePath)) throw new Error("user_transactions.csv not found in /data");
  if (!fs.existsSync(exchangeFilePath)) throw new Error("exchange_transactions.csv not found in /data");

  logger.info("Starting ingestion for user transactions");
  const userResults = await parseAndStoreCSV(userFilePath, "user");

  logger.info("Starting ingestion for exchange transactions");
  const exchangeResults = await parseAndStoreCSV(exchangeFilePath, "exchange");

  return { userResults, exchangeResults };
};

module.exports = { runIngestion };