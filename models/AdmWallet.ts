import mongoose, { Document, Schema } from "mongoose";

interface IAdmWWallet extends Document {
    type:string;
    address:string;
    createdAt:Date;
    updatedAt:Date
}

const AdminWalletSchema = new Schema<IAdmWWallet>({
    type:{
        type:String,
        required:true,
        trim:true
    },
    address:{
        type:String,
        required:true,
    }
},{timestamps:true});

const AdmWallet = mongoose.models.AdmWallet || mongoose.model<IAdmWWallet>('AdmWallet',AdminWalletSchema);

export default AdmWallet;

