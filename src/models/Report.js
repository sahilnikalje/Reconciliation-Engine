const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  runId: { type: String, required: true },
  category: { type: String, enum: ["matched", "conflicting", "unmatched_user", "unmatched_exchange"], required: true },
  reason: { type: String, required: true },
  userTransaction: { type: Object, default: null },
  exchangeTransaction: { type: Object, default: null },
},{
     timestamps: true 
}
)

module.exports = mongoose.model("Report", reportSchema);