import mongoose, { Document, Schema } from "mongoose";

interface IInvestmentProfit extends Document {
    investmentId:mongoose.Types.ObjectId;
    profit:number;
    createdAt:Date;
    updatedAt:Date
}

const InvestmentProfitSchema = new Schema<IInvestmentProfit>({
    investmentId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    profit:{
        type:Number,
        required:true
    }
},{timestamps:true});

const InvestmentProfit = mongoose.models.InvestmentProfit || mongoose.model<IInvestmentProfit>('InvestmentProfit',InvestmentProfitSchema);
export default InvestmentProfit;