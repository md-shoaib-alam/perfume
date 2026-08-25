import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ICustomer {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: ICustomer;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true }
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: String, default: '100ml' },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String, default: '' }
      }
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Online' },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Paid'
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing'
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
