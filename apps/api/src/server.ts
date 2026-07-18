import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) throw new Error('MONGO_URI and JWT_SECRET are required');
const port = Number(process.env.PORT ?? 5000);
mongoose.connect(process.env.MONGO_URI).then(() => app.listen(port, () => console.log(`FoodHub API running on port ${port}`))).catch(err => { console.error(err); process.exit(1); });
