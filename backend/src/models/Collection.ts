import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  id: string;
  name: string;
  subname: string;
  image: string;
  link: string;
  order: number;
}

const CollectionSchema = new Schema<ICollection>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subname: { type: String, default: 'Collection' },
    image: { type: String, required: true },
    link: { type: String, default: '#' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
