import express, { Request, Response } from "express";
import Transaction from "../models/transactionModel";
import moment from "moment";
import User from "../models/userModel";
const transactionRouter=express.Router();

//USE THIS API TO POPULATE DATA INTO TRANSANCTION COLLECTION
transactionRouter.post('/transaction', async (req: Request, res: Response): Promise<void> => {
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
        }

        if (!validTypes.includes(type)) {
            res.status(400).json({ message: `'type' must be one of the following values: ${validTypes.join(', ')}` });
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
  
transactionRouter.get('/transactions/:userId', async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { status, type, fromDate, toDate } = req.query;  

    
    let filters: any = { userId: userId };

    if (status) {
        filters.status = status;
    }

    if (type) {
        filters.type = type;
    }

    if (fromDate && toDate) {
        //I am doing this to make sure both dates are strings
        const fromDateStr = Array.isArray(fromDate) ? fromDate[0] : fromDate;
        const toDateStr = Array.isArray(toDate) ? toDate[0] : toDate;

        
        filters.transactionDate = {
          $gte: moment(fromDateStr, "YYYY-MM-DD").startOf('day').toDate(), 
          $lte: moment(toDateStr, "YYYY-MM-DD").endOf('day').toDate() 
        };
    }

    try {
        const transactions = await Transaction.find(filters);
        if (!transactions || transactions.length === 0) {
            res.status(404).json({ message: 'No transactions found' });
        }
        res.json({message:"Here are the Requested transactions" , data:transactions});
    } catch (error) {
        res.status(400).json({ message: 'Server error' });
    }
});

transactionRouter.get('/transactions-with-user', async (req: Request, res: Response): Promise<void> => {
  const { status, type, fromDate, toDate } = req.query;  

  
  let filters: any = {};

  if (status) {
      filters.status = status;
  }

  if (type) {
      filters.type = type;
  }

  if (fromDate && toDate) {
      //Again, doing this to make sure both dates are strings!
      const fromDateStr = Array.isArray(fromDate) ? fromDate[0] : fromDate;
      const toDateStr = Array.isArray(toDate) ? toDate[0] : toDate;

      
      filters.transactionDate = {
        $gte: moment(fromDateStr, "YYYY-MM-DD").startOf('day').toDate(), 
        $lte: moment(toDateStr, "YYYY-MM-DD").endOf('day').toDate() 
      };
  }

  try {
      
      const transactions = await Transaction.find(filters).populate('userId', 'name phoneNumber');  // Populate userId field with user details

      if (!transactions || transactions.length === 0) {
          res.status(404).json({ message: 'No transactions found' });
      } else {
          res.json({
              message: "Here are the requested transactions with user details",
              data: transactions
          });
      }
  } catch (error) {
      res.status(400).json({ message: 'Server error' });
  }
});


export default transactionRouter;