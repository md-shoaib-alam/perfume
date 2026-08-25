import mongoose, { Document, Schema } from 'mongoose';

export interface ICelebrity extends Document {
  id: string;
  name: string;
  perfume: string;
  bottleThumb: string;
  image: string;
  order: number;
}

const CelebritySchema = new Schema<ICelebrity>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    perfume: { type: String, required: true },
    bottleThumb: { type: String, required: true },
    image: { type: String, required: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Celebrity = mongoose.model<ICelebrity>('Celebrity', CelebritySchema);
