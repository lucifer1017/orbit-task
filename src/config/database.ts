
import mongoose from 'mongoose';

export const connectToDb = async (): Promise<void> => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI Environment variable is not defined');
    }
    await mongoose.connect(mongoUri);
}