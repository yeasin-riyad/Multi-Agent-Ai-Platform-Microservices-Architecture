import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
dotenv.config();

const port = process.env.PORT;
const app=express();
app.use(express.json());



app.get("/",(req,res)=>{
    res.status(200).json({message:"Hello from chat service"});
})
app.listen(port,async()=>{
    console.log(`Chat services Started at ${port}`);
    await connectDb();
})