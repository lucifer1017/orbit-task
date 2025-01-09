import express, { Request, Response } from "express";
import User from "../models/userModel";
import mongoose from "mongoose";
const userRouter=express.Router();


//USE THIS API TO POPULATE DATA INTO USER COLLECTION
userRouter.post('/user', async (req: Request, res: Response): Promise<void> => {
      const { name, phoneNumber } = req.body;
      
      try {
          
          if (!name || !phoneNumber) {
              res.status(400).json({ message: 'Name and Phone Number are required' });
          }
            const newUser = new User({
              name,
              phoneNumber,
          });
  
          await newUser.save();
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
          
          const errorMessages = Object.values(error.errors).map((err) => err.message);
           res.status(400).json({ message: errorMessages.join(', ') });
      } else if (error instanceof Error) {
          
           res.status(500).json({ message: error.message });
      } else {
          
         res.status(500).json({ message: 'An unknown error occurred' });
      }
      }
  });
userRouter.get('/user/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
    });
  } catch (error) {
    res.status(400).json({ message: 'Server error' });
  }
});

export default userRouter;