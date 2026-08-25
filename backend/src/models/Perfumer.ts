import mongoose, { Document, Schema } from 'mongoose';

export interface IPerfumer extends Document {
  id: string;
  name: string;
  title: string;
  quote: string;
  bio: string;
  image: string;
  avatar: string;
  award: string;
  active: boolean;
}

const PerfumerSchema = new Schema<IPerfumer>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    title: { type: String, default: '' },
    quote: { type: String, default: '' },
    bio: { type: String, default: '' },
    image: { type: String, required: true },
    avatar: { type: String, required: true },
    award: { type: String, default: '' },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Perfumer = mongoose.model<IPerfumer>('Perfumer', PerfumerSchema);
