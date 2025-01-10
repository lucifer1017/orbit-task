import express, { Express, Request, Response } from "express";
import { connectToDb } from "./config/database";
import dotenv from "dotenv";
import userRouter from "./routes/user";
import transactionRouter from "./routes/transaction";
dotenv.config();
const app: Express = express();
app.use(express.json());
app.use('/',userRouter)
app.use('/',transactionRouter)


connectToDb()
    .then(() => {
        console.log("Connected to DB successfully");
        app.listen(process.env.PORT || 7070, () => {
            console.log(`Server running successfully on port:${process.env.PORT}`);
        });
    })
    .catch((err: unknown) => {  
        if (err instanceof Error) {
            console.error(`Cannot establish connection: ${err.message}`);
        } else {
            console.error("An unknown error occurred during DB connection");
        }
    });

