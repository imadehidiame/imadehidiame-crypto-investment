import mongoose, { Document, Schema, Types } from "mongoose";

interface IManualProfit extends Document {
    profit:number;
    userId:Types.ObjectId;
    investmentId:Types.ObjectId;
    createdAt:Date,
    updatedAt:Date
}

const ManualProfitSchema = new Schema<IManualProfit>({
    profit:{
        type:Number,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    investmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ManualInvestment',
        required:true
    },
},{timestamps:true});

const ManualProfit = mongoose.models.ManualProfit || mongoose.model<IManualProfit>('ManualProfit',ManualProfitSchema);
export default ManualProfit;