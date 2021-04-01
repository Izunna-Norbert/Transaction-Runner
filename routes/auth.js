const router = require("express").Router();
const User = require("../model/User")
const {registerValidation,loginValidation,depositValidation,withdrawalValidation} = require("../middleware/validation")
const auth = require("../middleware/verify.token")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer');
const crypto = require("crypto")
const mailer = require('../middleware/mailer')
const Blacklist = require("../model/Blacklist");
const Withdrawal = require("../model/Withdrawal");
const Deposit = require("../model/Deposit");
const { nextTick } = require("process");

router.get('/dashboard',auth, async (req,res) =>{
    const user = await User.findOne({_id: req.user._id}).populate('withdrawal').populate('deposit')
        if(user){
            res.json({
                user:user
            })
        }
        else{
            res.status(400).json({error:"User not Found"})
        }
        
    
 })

 router.post('/deposit',auth, async (req,res) =>{
    console.log(req.body)
    const {error} = depositValidation(req.body);
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }
    const deposit = new Deposit ({
        amount: req.body.amount,
        date : new Date()
    })
    await deposit.save()
    await User.findByIdAndUpdate(req.user._id,{
         $inc: {balance : req.body.amount},
         deposit : deposit._id ,
    },{new: true},function (err,user){
        if (err){
            console.log(err)
            res.json({
                error: "An error occured"
            })
        }else{
            res.json({
                message: `Sucessfully deposited ${req.body.amount} to ${user.account} with account name :${user.name}`
            }) 
        }
        
    })
        
    
 })

 router.post('/send-money',auth, async (req,res) =>{
    console.log(req.body)
    const {error} = withdrawalValidation(req.body);
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }
    await User.findOne({account: req.body.account}, async function (err, user) {
        if(err){
            return res.status(400).json({error:err}) 
        }
        if(!user){
            return res.status(400).json({error: "Account details is wrong , enter correct account number!"})
        }
        if(user._id == req.user._id){
            return res.status(400).json({error: "Account details is wrong , cannot transfer to self!"})
        }
        else{
            const sender = await User.findOne({_id: req.user._id})
            console.log(sender)
            if (parseInt(sender.balance) > parseInt(req.body.amount)){
            const deposit = new Withdrawal ({
                receiver_account_number: req.body.account,
                receiver_account_name: user.name,
                amount: req.body.amount,
                date : new Date()
                })
                sender.balance = sender.balance - req.body.amount
                await deposit.save()
                sender.withdrawal.push(deposit._id)
                user.balance += req.body.amount;
                sender.save(async function (err) {
                    if (err){
                        console.log(err)
                        return res.status(400).json({error: err});
                        }
                    await user.save(async function (err) {
                        if (err){
                            console.log(err)
                            return res.status(400).json({error: err});
                           }
                           return res.status(200).json({success: `Successfully transferred ${req.body.amount} to ${user.name}`})
                    })
                })
            }
            else{
                return res.status(400).json({error: "Insufficient Balance"})
            }
        }
    })    
    
 })

router.post('/signup', async (req,res) =>{
    console.log(req.body)
    const {error} = registerValidation(req.body);
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }
    //check if user exists
    const emailExist = await User.findOne({email: req.body.email})
    if(emailExist){
        return res.status(400).json({error:'Email already exists'});
    }
    if(req.body.password != req.body.confirm_password){
        return res.status(400).json({error:"passwords don't match"})
    }
//crypting passwords
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);
//creating a new user

    const user = new User ({
        name: req.body.name,
        email : req.body.email,
        account: Math.floor(Math.random() * 9000000000) + 1000000000,
        password : hashPassword
    })
    try {
       const saveduser = await user.save();
       const tempuser = {
           createdAt: saveduser.createdAt,
           _id: saveduser._id,
           name: saveduser.name,
           email : saveduser.email,
       }

       const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET,{expiresIn: '3h'})
       res.header('Authorization', token);
       res.json({user:tempuser,"Account Number": saveduser.account, token:token});
    }catch(err){
        res.status(400).json(err);
    }
})

//login
router.post('/login', async (req,res) =>{
    const {error} = loginValidation(req.body);
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }
    //check if user exists
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({error:"Email or password doesn't exists"});
    }
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass){
        res.status(400).json({error:"Invalid Password"})
    }
    else{
        
        
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET,{expiresIn: '3h'})
    res.header('Authorization', token);
    res.json({user:user,token:token});
    }
})

router.get('/logout',auth,function(req,res){
    console.log(req.header("Authorization"))
    const blacktoken = new Blacklist({
        token: req.header("Authorization")
    })
    try{
        blacktoken.save();
        res.status(200).json({
            user : "logged out successfully"
        });

    }catch(err){
        res.status(400).json(err)
    }
    
    });


router.post('/forgot-password',(req,res) =>{
          const buf = crypto.randomBytes(20)
          var token = buf.toString('hex')
          User.findOne({ email: req.body.email }, function(err, user) {
            if (!user) {
                res.status(400).json({error:"No account with that email address exists"})
            }
            else{
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
            user
            .save()
            .then(user => {
                // Compose email
                const transport = nodemailer.createTransport({
                    service: 'Sendgrid',
                    auth: {
                      user: 'apikey',
                      pass: process.env.SENDGRID_PASS
                    },
                    tls: {
                      rejectUnauthorized: false
                    }
                  });
                var mailOptions = {
                    from:'no-reply@iqubelabs.com',
                    to: user.email,
                    subject:  'Password Reset!',
                    text: 'Hey there, it’s our first message sent with Nodemailer ;) ', 
                    html : `Hi there,
            <br/>
            This email was sent if you asked for a password reset!
            <br/><br/>
            Please verify your email by typing the following token:
            <br/>
            Token: <b>${token}</b>
            <br/>
            This token expires in 60 minutes
            
            Have a pleasant day.`
                };
            // Send email
            transport.sendMail(mailOptions, (error, info) => {
                 if (error) {
                     return res.status(400).send(error);
            }
            res.json({success:"A mail has been sent for further instructions"})
            });
             
            })
            .catch(err => res.send(err));
        }
         
})
})
router.post('/reset-password', (req,res) =>{
    console.log(req.headers.token)
    User.findOne({ resetPasswordToken: req.headers.token ,resetPasswordExpires: { $gt: Date.now() }}).then(user => {
        if (!user) {
          return res.status(400).json({error:'Password reset token is invalid or has expired.'});
        }
        else{
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        password = req.body.password;
        console.log(password)
        

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) res.status(400).send(err);
            user.password = hash;
            user.save();
            res.json({success:'Password succesfully changed'});
          });
        });
    }
      }); 
})

module.exports = router;