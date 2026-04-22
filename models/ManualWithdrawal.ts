import mongoose, { Document, Schema, Types } from "mongoose";

interface IManualWithdrawal extends Document {
    userId:Types.ObjectId,
    method:string,
    currency?:string,
    address?:string,
    name?:string,
    country?:string,
    bank?:string,
    swift_code?:string,
    account_number?:string,
    amount:number,
    stage:number,
    withdrawalCode:string,
}

const ManualWithdrawalSchema = new Schema<IManualWithdrawal>({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    method:{
        type:String,
        required:true,
    },
    currency:{
        type:String,
        required:false,
        default:null
    },
    address:{
        type:String,
        required:false,
        default:null
    },
    name:{
        type:String,
        required:false,
        default:null
    },
    country:{
        type:String,
        required:false,
        default:null
    },
    bank:{
        type:String,
        required:false,
        default:null
    },
    swift_code:{
        type:String,
        required:false,
        default:null
    },
    account_number:{
        type:String,
        required:false,
        default:null
    },
    amount:{
        type:Number,
        required:true,
        //default:null
    },
    stage:{
        type:Number,
        required:true,
        default:1
    },
    withdrawalCode:{
        type:String,
        required:true,
        //default:null
    },
},{timestamps:true});

if (mongoose.models.ManualWithdrawal) {
    //delete mongoose.models.ManualWithdrawal; 
    //console.log('ManualWithdrawal existing User model to prevent conflict');
}

const ManualWithdrawal = mongoose.models.ManualWithdrawal || mongoose.model<IManualWithdrawal>('ManualWithdrawal',ManualWithdrawalSchema);
export default ManualWithdrawal;