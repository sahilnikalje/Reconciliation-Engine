const mongoose=require('mongoose')

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  asset: { type: String, required: true },
  normalizedAsset: { type: String, required: true }, 
  quantity: { type: Number, required: true },
  transactionType: { type: String, required: true },
  normalizedType: { type: String, required: true }, 
  source: { type: String, enum: ["user", "exchange"], required: true }, 
},{ 
    timestamps: true 
}) 

module.exports=mongoose.model('Transaction', transactionSchema)