const mongoose=require('mongoose')

const invalidTransactionSchema = new mongoose.Schema({
  rawRow: { type: Object, required: true },       
  source: { type: String, required: true },        
  reason: { type: String, required: true },        
},{ 
    timestamps: true 
}
) 

module.exports = mongoose.model("InvalidTransaction", invalidTransactionSchema)