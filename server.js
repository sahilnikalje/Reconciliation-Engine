require('dotenv').config()
const express=require('express')
const reconciliationRouter=require('./src/features/reconciliation/reconciliation.routes')
const errorHandler=require('./src/middleware/errorHandler')
const ingestionRouter = require("./src/features/ingestion/ingestion.routes");
const reportsRouter = require('./src/features/reports/reports.routes')
const connectDB=require('./src/config/db')

const app=express()
app.use(express.json())

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Reconciliation Engine is running" });
});

app.use('/api/reconciliation', reconciliationRouter)
app.use('/api/ingestion', ingestionRouter)
app.use('/api/reports', reportsRouter)
app.use(errorHandler)


const PORT=process.env.PORT


const startServer=async()=>{
    try{
        await connectDB()
        app.listen(PORT, ()=>{
            console.log(`Server running on PORT ${PORT}`)
        })
    }
    catch(err){
        console.log(err.message)
        process.exit(1)
    }
}
startServer()
