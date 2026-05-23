require('dotenv').config()
const express=require('express')
const reconciliationRouter=require('./src/features/reconciliation/reconciliation.routes')
const errorHandler=require('./src/middleware/errorHandler')
const connectDB=require('./src/config/db')
const app=express()

app.use('/api', reconciliationRouter)
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