import express, { Request, Response } from "express";
import Transaction from "../models/transactionModel";
import User from "../models/userModel";
import mongoose from "mongoose";
import { buildTransactionFilter, handlePagination } from "../utils/helperFunctions";
const transactionRouter=express.Router();

//I HAVE USED THIS API TO POPULATE DATA INTO TRANSANCTIONS COLLECTION
transactionRouter.post('/transactions', async (req: Request, res: Response): Promise<void> => {
    const { status, type, transactionDate, amount, userId } = req.body;

    try {
        
        const user = await User.findById(userId);
        if (!user) {
            res.status(400).json({ message: 'Invalid userId. User does not exist.' });
            return;
        }

        const validStatuses = ['success', 'pending', 'failed'];
        const validTypes = ['debit', 'credit'];

        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: `'status' must be one of the following values: ${validStatuses.join(', ')}` });
            return;
        }

        if (!validTypes.includes(type)) {
            res.status(400).json({ message: `'type' must be one of the following values: ${validTypes.join(', ')}` });
            return;
        }

        const newTransaction = new Transaction({
            status,
            type,
            transactionDate,
            amount,
            userId,  
        });

        
        await newTransaction.save();

        
        res.status(201).json({
            message: 'Transaction Successful!',
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
 
// API-2 : Get all transactions for a user by user Id having filters like status,
//  date range (to and from) and type.
transactionRouter.get('/transactions/:userId', async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params; 
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const { skip, limit: pageLimit } = handlePagination(req.query);
    const filter = buildTransactionFilter(req.query);
    filter.userId = new mongoose.Types.ObjectId(userId);
    const pipeline: any[] = [
        {
            $match: filter
        },
        { $skip: skip },
        { $limit: pageLimit },
       ];
    

    try {

        const transactions = await Transaction.aggregate(pipeline);
        if (!transactions || transactions.length === 0) {
            res.status(404).json({ message: 'No transactions found for the given user!' });
            return;
        }
        res.json({message:"Here are the Requested transactions" , 
            data:transactions});
    } catch (error) {
        res.status(400).json({ message: 'Server error' });
    }
});

// API-3 : Get all transactions with user details by filters like status, 
// date range (to and from) and type.
transactionRouter.get('/transactions', async (req: Request, res: Response): Promise<void> => {
    const { skip, limit: pageLimit } = handlePagination(req.query);
    const filter = buildTransactionFilter(req.query);
    const pipeline: any[] = [
        {
            $match: filter
        },
        {
            $lookup: {
                from: 'users', 
                localField: 'userId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true }
        },
        { $skip: skip },
        { $limit: pageLimit },
    ];

  try {
      
      const transactions = await Transaction.aggregate(pipeline);

      if (!transactions || transactions.length === 0) {
          res.status(404).json({ message: 'No transactions found' });
          return;
      } 
      res.json({
        message: "Here are the requested transactions with user details",
        data: transactions.map(transaction => ({
            ...transaction,
            userDetails: {
                name: transaction.userDetails.name,
                phoneNumber: transaction.userDetails.phoneNumber
            }
        }))
    });
      
        } catch (error) {
            res.status(400).json({ message: 'Server error' });
        }
});


export default transactionRouter;