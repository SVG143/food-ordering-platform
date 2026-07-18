import mongoose, { Schema } from 'mongoose';

export type Role = 'customer' | 'admin';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
}, { timestamps: true });

const menuItemSchema = new Schema({
  name: { type: String, required: true }, description: String,
  price: { type: Number, required: true, min: 0 }, category: { type: String, required: true },
  imageUrl: String, isAvailable: { type: Boolean, default: true }
});

const restaurantSchema = new Schema({
  name: { type: String, required: true }, description: String, cuisine: [String],
  deliveryTime: { type: String, default: '25-35 min' }, deliveryFee: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 4.5 }, imageUrl: String,
  isOpen: { type: Boolean, default: true }, menu: [menuItemSchema]
}, { timestamps: true });

const orderSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{ menuItemId: Schema.Types.ObjectId, name: String, price: Number, quantity: Number }],
  subtotal: { type: Number, required: true }, deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
  deliveryAddress: { street: String, city: String, state: String, zipCode: String },
  status: { type: String, enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], default: 'placed' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export const Order = mongoose.model('Order', orderSchema);
