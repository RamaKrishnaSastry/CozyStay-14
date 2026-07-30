import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  booking: mongoose.Types.ObjectId;
  rating: number;
  text?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>('Review', reviewSchema);
