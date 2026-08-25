import mongoose, { Document, Schema } from 'mongoose';

export interface IFragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface IProductSizeOption {
  size: string;
  price: number;
  originalPrice?: number;
  isSoldOut?: boolean;
}

export interface IProduct extends Document {
  id: string;
  name: string;
  subtitle: string;
  category: 'extrait-de-parfum' | 'attar' | 'discovery-set' | 'gift-set';
  gender?: 'For Him' | 'For Her' | 'Unisex' | 'Gift Sets';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  volume: string;
  image: string;
  hoverImage: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isPreOrder?: boolean;
  shippingNote?: string;
  buttonText?: string;
  tagline?: string;
  badgeText?: string;
  badgeSubtext?: string;
  notes: IFragranceNotes;
  description: string;
  stockQuantity: number;
  sizeOptions: IProductSizeOption[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    subtitle: { type: String, default: '' },
    category: {
      type: String,
      enum: ['extrait-de-parfum', 'attar', 'discovery-set', 'gift-set'],
      default: 'extrait-de-parfum'
    },
    gender: {
      type: String,
      enum: ['For Him', 'For Her', 'Unisex', 'Gift Sets'],
      default: 'For Him'
    },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    volume: { type: String, default: '100ml' },
    image: { type: String, required: true },
    hoverImage: { type: String, default: '' },
    isBestseller: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isPreOrder: { type: Boolean, default: false },
    shippingNote: { type: String, default: '' },
    buttonText: { type: String, default: 'ADD TO BAG' },
    tagline: { type: String, default: '' },
    badgeText: { type: String, default: '' },
    badgeSubtext: { type: String, default: '' },
    notes: {
      top: [{ type: String }],
      heart: [{ type: String }],
      base: [{ type: String }]
    },
    description: { type: String, default: '' },
    stockQuantity: { type: Number, default: 50 },
    sizeOptions: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        isSoldOut: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
