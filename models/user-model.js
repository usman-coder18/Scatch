const mongoose = require('mongoose');
const productModel = require('./product-model');

const userSchema=mongoose.Schema({
    fullname:String,
    email:String,
    contact:Number,
    password:String,
    cart:[{
        type:mongoose.Schema.Types.ObjectId,
ref:"product"    }],
role: {
    type: String,
    default: "user", // ✅ Ensure role is set to "user"
  },
    orders:{
        type:Array,
        default:[]
    },
    picture:String

})
module.exports =mongoose.model("user", userSchema)