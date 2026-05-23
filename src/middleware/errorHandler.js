const errorHandler=(err, req, res, next)=>{
    res.status(500).json({sucess:false, error:'Something went wrong'})
}

module.exports=errorHandler