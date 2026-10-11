import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js';
import router from './routes/billing.route.js';
dotenv.config();
import billingRouter from "./routes/billing.route.js";

const port = process.env.PORT;
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Billing routes
app.use("/api/billing", billingRouter);

app.get("/",(req,res)=>{
    res.status(200).json({message:"Hello from billing service"});
})
app.listen(port,async()=>{
    console.log(`Billing services Started at ${port}`);
    await connectDb();
})