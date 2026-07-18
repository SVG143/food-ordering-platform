import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Restaurant, User } from './models.js';

if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
await mongoose.connect(process.env.MONGO_URI);
await Promise.all([Restaurant.deleteMany({}), User.deleteMany({ email: 'admin@foodhub.dev' })]);
await User.create({ name: 'FoodHub Admin', email: 'admin@foodhub.dev', passwordHash: await bcrypt.hash('Admin123!', 12), role: 'admin' });
await Restaurant.create([
  { name: 'Bombay Bowl', description: 'Modern Indian comfort food made fresh.', cuisine: ['Indian'], deliveryTime: '25-35 min', deliveryFee: 2.49, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80', menu: [
    { name: 'Butter Chicken Bowl', description: 'Creamy tomato curry, basmati rice and herbs.', price: 15.99, category: 'Bowls' },
    { name: 'Paneer Tikka Bowl', description: 'Charred paneer, peppers, rice and mint chutney.', price: 14.49, category: 'Bowls' },
    { name: 'Garlic Naan', description: 'Tandoor baked flatbread with garlic butter.', price: 3.99, category: 'Sides' }
  ]},
  { name: 'Green Fork Kitchen', description: 'Bright, wholesome food for busy days.', cuisine: ['Healthy', 'American'], deliveryTime: '20-30 min', deliveryFee: 1.99, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', menu: [
    { name: 'Harvest Chicken Salad', description: 'Greens, roasted chicken, apple, pecans and cider vinaigrette.', price: 13.99, category: 'Salads' },
    { name: 'Spicy Tofu Grain Bowl', description: 'Quinoa, tofu, vegetables and sesame sauce.', price: 12.99, category: 'Bowls' }
  ]}
]);
console.log('Seeded demo restaurants and admin: admin@foodhub.dev / Admin123!');
await mongoose.disconnect();
