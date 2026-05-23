const mongoose = require("mongoose");

const reconciliationRunSchema = new mongoose.Schema({
  runId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  timestampToleranceSeconds: { type: Number, required: true },
  quantityTolerancePct: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  totalUserTransactions: { type: Number, default: 0 },
  totalExchangeTransactions: { type: Number, default: 0 },
  matchedCount: { type: Number, default: 0 },
  conflictingCount: { type: Number, default: 0 },
  unmatchedUserCount: { type: Number, default: 0 },
  unmatchedExchangeCount: { type: Number, default: 0 },
},{ 
    timestamps: true 
})

module.exports = mongoose.model("ReconciliationRun", reconciliationRunSchema);