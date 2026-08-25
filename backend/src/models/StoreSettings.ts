import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreSettings extends Document {
  announcementText: string;
  announcementCode: string;
  announcementDiscount: string;
  freeGiftThreshold: number;
  contactEmail: string;
  contactPhone: string;
  trustBanner: {
    returns: { title: string; subtitle: string };
    delivery: { title: string; subtitle: string };
    longevity: { title: string; subtitle: string };
  };
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    announcementText: { type: String, default: 'FLAT 15% OFF | USE CODE: LUXE15' },
    announcementCode: { type: String, default: 'LUXE15' },
    announcementDiscount: { type: String, default: '15%' },
    freeGiftThreshold: { type: Number, default: 3500 },
    contactEmail: { type: String, default: 'concierge@neesh.com' },
    contactPhone: { type: String, default: '+91 (800) 555-NEESH' },
    trustBanner: {
      returns: {
        title: { type: String, default: 'No Questions Asked Returns' },
        subtitle: { type: String, default: 'Applicable on first order of 100ml and 50ml perfume bottles only' }
      },
      delivery: {
        title: { type: String, default: 'Free & Fast Delivery' },
        subtitle: { type: String, default: 'on your doorsteps in 3-5 days, with a surprise' }
      },
      longevity: {
        title: { type: String, default: 'The Lingering Effect You Want' },
        subtitle: { type: String, default: 'NEESH™ perfumes are blended with proven ingredients to last 10+ hours (Guaranteed)' }
      }
    }
  },
  { timestamps: true }
);

export const StoreSettings = mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);
