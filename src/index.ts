import express, { Express, Request, Response } from "express";
import { connectToDb } from "./config/database";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel";
import Transaction from "./models/transactionModel";
dotenv.config();
const app: Express = express();
app.use(express.json());

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
    app.post('/user', async (req: Request, res: Response): Promise<void> => {
      const { name, phoneNumber } = req.body;
  console.log(req.body);
      try {
          
          if (!name || !phoneNumber) {
              res.status(400).json({ message: 'Name and Phone Number are required' });
          }
  
          // Create a new user
          const newUser = new User({
              name,
              phoneNumber,
          });
  
          // Save the user to the database (this will trigger MongoDB to create the database if it doesn't exist)
          await newUser.save();
  
          // Return the saved user
          res.status(201).json({
              message: 'User created successfully',
              user: {
                  id: newUser._id,
                  name: newUser.name,
                  phoneNumber: newUser.phoneNumber,
              },
          });
      } catch (error:unknown) {
          
        if (error instanceof mongoose.Error.ValidationError) {
          // Handle Mongoose validation errors
          const errorMessages = Object.values(error.errors).map((err) => err.message);
           res.status(400).json({ message: errorMessages.join(', ') });
      } else if (error instanceof Error) {
          // Handle generic JavaScript errors
           res.status(500).json({ message: error.message });
      } else {
          // For unknown errors
         res.status(500).json({ message: 'An unknown error occurred' });
      }
      }
  });
  app.put('/transaction', async (req: Request, res: Response): Promise<void> => {
    const { status, type, transactionDate, amount, userId } = req.body;

    try {
        // Validate if the userId exists in the User collection
        const user = await User.findById(userId);
        if (!user) {
            res.status(400).json({ message: 'Invalid userId. User does not exist.' });
            return;
        }

        // Custom Enum validation
        const validStatuses = ['success', 'pending', 'failed'];
        const validTypes = ['debit', 'credit'];

        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: `'status' must be one of the following values: ${validStatuses.join(', ')}` });
        }

        if (!validTypes.includes(type)) {
            res.status(400).json({ message: `'type' must be one of the following values: ${validTypes.join(', ')}` });
        }

        // Create a new transaction
        const newTransaction = new Transaction({
            status,
            type,
            transactionDate,
            amount,
            userId,  // This should be a valid ObjectId from the User model
        });

        // Save the transaction to the database
        await newTransaction.save();

        // Return the saved transaction
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: {
                id: newTransaction._id,
                status: newTransaction.status,
                type: newTransaction.type,
                transactionDate: newTransaction.transactionDate,
                amount: newTransaction.amount,
                userId: newTransaction.userId,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error occurred while creating transaction.' });
    }
});
  
  //   app.get('/user/:id', async (req: Request, res: Response): Promise<void> => {
  //     try {
  //         const user = await User.findById(req.params.id);
  //         if (!user) {
  //              res.status(404).json({ message: 'User not found' });
  //         }
  //         res.json({
  //             id: user._id,
  //             name: user.name,  
  //             phoneNumber: user.phoneNumber,
  //         });
  //     } catch (error) {
  //         res.status(500).json({ message: 'Server error' });
  //     }
  // }); 