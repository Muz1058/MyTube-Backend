//require('dotenv').config({path:'./env'})
import { app } from "./app.js";
import connectDB from "./db/index.js";

import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
})//for this synatx consistency we add an experimental feature in package.json ,script-> dev ->-r dotenv/config --experimental-json-modules

const port=process.env.PORT||5000;
console.log("Server is Running at port :",port)
connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log("Server is Running at port :",port)
    })
})
.catch((error)=>{
   
    console.log("MongoDB connection Failed :",error)
})

 //  app.on("error",(error)=>{
//     console.log("ERROR :",error)
//     throw error
//    })




/*import mongoose from "mongoose";
import { DB_Name } from "./constants";

import express from 'express'
const app=express()


;(async ()=>{
try {
   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);

   app.on("error",(error)=>{
    console.log("ERROR :",error)
    throw error
   })

   app.listen(process.env.PORT,()=>{
    console.log(`App is listinig on port ${process.env.PORT}`)
   })

} catch (error) {
    console.error("ERROR:",error)
    throw error
}
})()

*/