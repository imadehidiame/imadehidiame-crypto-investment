import mongoose, { Document, Schema } from "mongoose";

interface IKyc extends Document {
  userId: mongoose.Types.ObjectId;
  country: string;
  state: string;
  city: string;
  zip: string;
  address: string;
  createdAt: Date;
}

const KycOneSchema = new Schema<IKyc>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  zip: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const KycOne = mongoose.models.KycOne || mongoose.model<IKyc>('KycOne', KycOneSchema);

export default KycOne;