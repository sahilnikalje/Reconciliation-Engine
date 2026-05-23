const fs=require('fs')
const csvParser=require('csv-parser')
const logger=require('../../utils/logger')
const{validateRow}=require('./ingestion.validator')
const Transaction=require('../../models/Transaction')
const InvalidTransaction=require('../../models/InvalidTransaction')

const assetAliases = {
  btc: "Bitcoin",
  bitcoin: "Bitcoin",
  eth: "Ethereum",
  ethereum: "Ethereum",
}

const normalizeType = (type) => type?.trim().toUpperCase()

const normalizeAsset = (asset) => {
  const key = asset?.trim().toLowerCase();
  return assetAliases[key] || asset?.trim();
}

const parseAndStoreCSV = (filePath, source) => {
  return new Promise((resolve, reject) => {
    const results = { valid: 0, invalid: 0 };

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", async (row) => {
        const { isValid, reason } = validateRow(row);

        if (!isValid) {
          //todo Store invalid row with the reason it failed
          logger.warn(`Invalid row in ${source}: ${reason}`);
          await InvalidTransaction.create({ rawRow: row, source, reason });
          results.invalid++;
          return;
        }

        //todo Store valid row after normalization
        await Transaction.create({
          transactionId: row.transaction_id.trim(),
          timestamp: new Date(row.timestamp),
          asset: row.asset.trim(),
          normalizedAsset: normalizeAsset(row.asset),
          quantity: parseFloat(row.quantity),
          transactionType: row.transaction_type.trim(),
          normalizedType: normalizeType(row.transaction_type),
          source,
        });

        results.valid++;
      })
      .on("end", () => {
        logger.info(`${source} CSV parsed — valid: ${results.valid}, invalid: ${results.invalid}`);
        resolve(results);
      })
      .on("error", (err) => {
        logger.error(`Error parsing ${source} CSV: ${err.message}`);
        reject(err);
      });
  });
}

module.exports = { parseAndStoreCSV }