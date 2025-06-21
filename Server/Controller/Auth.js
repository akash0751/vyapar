const express = require('express')
const Register = require('../Model/register')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser'); 
dotenv.config()

const adminRegister = async (req, res) => {
  try{
    const { name, email, password, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ message: "Unauthorized to create an admin" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Register({ name, email, password: hashedPassword, role: "admin" });

    
        await newAdmin.save();

        const token = jwt.sign(
            { id: newAdmin._id, role: newAdmin.role },
            process.env.SECRET_CODE, 
            { expiresIn: "1h" } 
        );

       res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
      });

      

        res.status(201).json({
            message: "Admin registered successfully!",token:token
             // Frontend should store and use this token in requests
        });
    } catch (error) {
        res.status(400).json({ message: "Error registering admin" });
    }
};

const Adminlogin = async(req,res)=>{
    const { email, password,secretKey } = req.body;

  try {
    const user = await Register.findOne({ email });
    if (!user) return res.status(400).json({ message: "You're not an Admin" });
    

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        // res.clearCookie('jwt');
        return res.status(400).json({ message: "Invalid credentials" });}

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        // res.clearCookie('jwt');
        return res.status(403).json({ message: "You're not an admin" });
    }
    // if(req.user.role!="admin"){
    //     res.clearCookie('jwt');
    //     return res.status(401).json({message:'You are not authorized to perform this action'})
    // }

    const token = jwt.sign({ id: user._id,role:"admin"}, process.env.SECRET_CODE, { expiresIn: "1h" });
    
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
      });

      
    // res.clearCookie('jwt');
    
    res.json({ message:'Logged in successfully',token:token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {adminRegister,Adminlogin};