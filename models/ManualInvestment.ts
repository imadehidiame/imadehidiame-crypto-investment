import mongoose, { Document, Schema } from "mongoose";

interface IManualInvestment extends Document {
    userId:mongoose.Types.ObjectId;
    profits?:mongoose.Types.ObjectId[];
    plan:string;
    duration:number;
    durationFlag:string;
    eth?:string;
    btc?:string;
    amount:number;
    stage:number;
    //isWithdrawalPaid:boolean;
    //isUpgradeFeePaid:boolean;
    withdrawalCode:string;
    investmentDate?:Date;
    maxUpgrade?:number;
    //isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const ManualInvestmentSchema = new Schema<IManualInvestment>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    stage:{
        type:Number,
        default:0
    },
    profits:[{
        ref:'ManualProfit',
        type:mongoose.Schema.Types.ObjectId
    }],
    plan:{
        type:String,
        required:true,
        trim:true
    },
    btc:{
        type:String,
        required:false,
        trim:true
    },
    eth:{
        type:String,
        required:false,
        trim:true
    },
    duration:{
        type:Number,
        required:true,
        default:1
    },
    durationFlag:{
        type:String,
        required:true,
        trim:true,
        default:'hours'
    },
    amount:{
        type:Number,
        required:true,
        default:500
    },
    investmentDate:{
        type:Date,
        default:Date.now
    },
    maxUpgrade:{
        type:Number,
        required:false,
        default:1
    },
    withdrawalCode:{
        type:String,
        required:true,
        trim:true
    }
},{timestamps:true});

if (mongoose.models.ManualInvestment) {
    //delete mongoose.models.ManualInvestment; 
    //console.log('Deleted existing Manual investment model to prevent conflict');
}

const ManualInvestment = mongoose.models.ManualInvestment 
|| mongoose.model<IManualInvestment>('ManualInvestment',ManualInvestmentSchema);

export default ManualInvestment;