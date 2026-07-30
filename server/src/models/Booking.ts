import mongoose, { Schema, Document } from 'mongoose';
import { BookingStatus } from '../types';

export interface IBooking extends Document {
  property: mongoose.Types.ObjectId;
  guest: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  guest: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.index({ property: 1, startDate: 1, endDate: 1 });

export default mongoose.model<IBooking>('Booking', bookingSchema);
