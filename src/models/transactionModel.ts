import mongoose, { Document, Schema } from 'mongoose';

export interface TransactionInterface extends Document {
    status: 'success' | 'pending' | 'failed'; 
    type: 'debit' | 'credit'; 
    transactionDate?: Date;
    amount: number;
    userId: mongoose.Schema.Types.ObjectId; 
}

const transactionSchema: Schema<TransactionInterface> = new Schema(
    {
        status: {
            type: String,
            required: true,
            enum: ['success', 'pending', 'failed'], 
        },
        type: {
            type: String,
            required: true,
            enum: ['debit', 'credit'], 
        },
        transactionDate: {
            type: Date,
            default: Date.now, 
        },
        amount: {
            type: Number,
            required: true,
            min: 0, 
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
    },
    {
        timestamps: true, 
    }
);

const Transaction = mongoose.model<TransactionInterface>('Transaction', transactionSchema);

export default Transaction;
