const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
        },
        offerDescription:{
            type:String,
            },
        category:{
            type:String,
            required:true
        },
        stock:{
            type:Number,
            default:0
        },
        image:{
            type:String,
            required:true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId, // Reference to User model
            ref: 'Register', // The name of the User model
            required: true // You can set this to false if the product isn't required to have a user
        }
},{
    timestamps:true
})
const Product = mongoose.model('Product',productSchema);
module.exports = Product;