const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  account:{
    type: String
  },
  resetPasswordToken:{
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now()
  },
  balance:{
    type: Number,
    default: 0.00,
},
deposit:[{
  type: mongoose.Schema.Types.ObjectId, ref: 'deposit'
}],
withdrawal:[{
  type: mongoose.Schema.Types.ObjectId, ref: 'withdrawal'
}],
});

// // to signup a user
// userSchema.pre('save',function(next){
//   var user=this;
  
//   if(user.isModified('password')){
//       bcrypt.genSalt(salt,function(err,salt){
//           if(err)return next(err);

//           bcrypt.hash(user.password,salt,function(err,hash){
//               if(err) return next(err);
//               user.password=hash;
//               user.password2=hash;
//               next();
//           })

//       })
//   }
//   else{
//       next();
//   }
// });

// //to login
// userSchema.methods.comparepassword=function(password,cb){
//   bcrypt.compare(password,this.password,function(err,isMatch){
//       if(err) return cb(next);
//       cb(null,isMatch);
//   });
// }


// // generate token

// userSchema.methods.generateToken=function(cb){
//   var user =this;
//   var token=jwt.sign(user._id.toHexString(),process.env.TOKEN_SECRET);

//   user.token=token;
//   user.save(function(err,user){
//       if(err) return cb(err);
//       cb(null,user);
//   })
// }

// // find by token
// userSchema.statics.findByToken=function(token,cb){
//   var user=this;

//   jwt.verify(token,process.env.TOKEN_SECRET,function(err,decode){
//       user.findOne({"_id": decode, "token":token},function(err,user){
//           if(err) return cb(err);
//           cb(null,user);
//       })
//   })
// };

// //delete token

// userSchema.methods.deleteToken=function(token,cb){
//   var user=this;

//   user.update({$unset : {token :1}},function(err,user){
//       if(err) return cb(err);
//       cb(null,user);
//   })
// }

// export model user with UserSchema
module.exports = mongoose.model("user", userSchema);
