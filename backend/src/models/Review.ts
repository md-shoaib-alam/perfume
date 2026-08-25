import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  productName: string;
  approved: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: String, default: () => new Date().toLocaleDateString() },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    verified: { type: Boolean, default: true },
    productName: { type: String, required: true },
    approved: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
