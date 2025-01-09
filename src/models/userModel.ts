import mongoose, { Document, Schema } from 'mongoose';


export interface UserInterface extends Document {
    name: string;
    phoneNumber: string; 
   }

   const userSchema: Schema<UserInterface> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phoneNumber: { 
            type: String,
            required:true,
            unique: true,
            validate: {
                validator: function(value:String) {
                    
                    const phoneRegex = /^[0-9]{10}$/;
                    if(!phoneRegex.test(value.toString())){
                        throw new Error('Invalid phone number, it must be a 10-digit number');
                    }
                    return true;
                },
                
            },
        },
        
    },
    {
        timestamps: true, 
    }
);



const User = mongoose.model<UserInterface>('User', userSchema);


export default User;