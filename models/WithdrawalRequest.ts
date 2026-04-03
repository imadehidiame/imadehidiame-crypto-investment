import mongoose, { Schema, Document } from 'mongoose';
//import { number } from 'zod';

interface IWithdrawalRequest extends Document {
    userId: mongoose.Types.ObjectId; // Link to the user
    investment: mongoose.Types.ObjectId;
    amount: number;
    status: number;
    currency: mongoose.Types.ObjectId;
}

const WithdrawalRequestSchema:Schema = new Schema<IWithdrawalRequest>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    investment: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true },
    currency:{type:mongoose.Schema.Types.ObjectId,ref:'Wallet',required:true},
    amount:{type:Number,required:true},
    status:{required:true,default:0,type:Number}
}, { timestamps: true });

const WithdrawalRequest = mongoose.models.WithdrawalRequest || mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);

export default WithdrawalRequest;