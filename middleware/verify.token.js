const jwt = require("jsonwebtoken")
const Blacklist = require("../model/Blacklist")

module.exports = async function (req,res,next){
    const token = req.header('Authorization');
    const blacklistedToken = await Blacklist.findOne({token: req.header('Authorization')})
    if(blacklistedToken){
        console.log('true')
    }
    if(!token){
        return res.status(401).json({error:'Access Denied'})
    }
    if(blacklistedToken){
        return res.status(401).json({error:'please login'})
    }
    try{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        req.user = verified
        next();
    }catch(err){
        res.status(400).json({error:'Invalid Token'})
    }
}