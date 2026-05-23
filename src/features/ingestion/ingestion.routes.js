const express = require("express");
const { ingestTransactions } = require("./ingestion.controller");

const ingestionRouter = express.Router();

ingestionRouter.post("/ingest", ingestTransactions);

module.exports = ingestionRouter;