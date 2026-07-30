import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  host: mongoose.Types.ObjectId;
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  photos: string[];
  amenities?: string[];
  unavailableDates?: Date[];
  isActive: boolean;
  createdAt: Date;
}

const propertySchema = new Schema<IProperty>({
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  pricePerNight: { type: Number, required: true, min: 0 },
  location: { type: String, required: true, trim: true },
  photos: {
    type: [String],
    validate: { validator: (v: string[]) => v.length > 0, message: 'At least one photo required' },
  },
  amenities: [{ type: String }],
  unavailableDates: [{ type: Date }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProperty>('Property', propertySchema);
