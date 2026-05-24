const fs = require("fs");
const csvParser = require("csv-parser");
const logger = require("../../utils/logger");
const { validateRow } = require("./ingestion.validator");
const { normalizeAsset } = require("../normalization/assetNormalizer");
const { normalizeType } = require("../normalization/typeMapper");
const Transaction = require("../../models/Transaction");
const InvalidTransaction = require("../../models/InvalidTransaction");

const parseAndStoreCSV = (filePath, source) => {
  return new Promise((resolve, reject) => {
    const results = { valid: 0, invalid: 0 };
    const validRows = [];
    const invalidRows = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const { isValid, reason } = validateRow(row);

        if (!isValid) {
          logger.warn(`Invalid row from ${source}: ${reason}`);
          invalidRows.push({ rawRow: row, source, reason });
          return;
        }

        validRows.push({
          transactionId: row.transaction_id.trim(),
          timestamp: new Date(row.timestamp),
          asset: row.asset.trim(),
          normalizedAsset: normalizeAsset(row.asset),
          quantity: parseFloat(row.quantity),
          transactionType: row.type.trim(),
          normalizedType: normalizeType(row.type),
          source,
        });
      })
      .on("end", async () => {
        try {
          if (validRows.length > 0) await Transaction.insertMany(validRows);
          if (invalidRows.length > 0) await InvalidTransaction.insertMany(invalidRows);

          results.valid = validRows.length;
          results.invalid = invalidRows.length;

          logger.info(`${source} CSV parsed — valid: ${results.valid}, invalid: ${results.invalid}`);
          resolve(results);
        } 
        catch (error) {
          reject(error);
        }
      })
      .on("error", (err) => {
        logger.error(`Error parsing ${source} CSV: ${err.message}`);
        reject(err);
      });
  });
};

module.exports = { parseAndStoreCSV };