import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Order, Restaurant, User } from './models.js';
import { requireAdmin, requireAuth, signToken, type AuthRequest } from './auth.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const data = credentials.extend({ name: z.string().min(2) }).parse(req.body);
    if (await User.exists({ email: data.email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name: data.name, email: data.email, passwordHash: await bcrypt.hash(data.password, 12) });
    res.status(201).json({ token: signToken(user.id, 'customer'), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const data = credentials.parse(req.body); const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: signToken(user.id, user.role as 'customer'|'admin'), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

app.get('/api/restaurants', async (req, res, next) => {
  try {
    const search = String(req.query.search ?? '');
    const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { cuisine: new RegExp(search, 'i') }] } : {};
    res.json(await Restaurant.find(filter).sort({ rating: -1 }));
  } catch (e) { next(e); }
});
app.get('/api/restaurants/:id', async (req, res, next) => {
  try { const item = await Restaurant.findById(req.params.id); item ? res.json(item) : res.status(404).json({ message: 'Restaurant not found' }); } catch(e) { next(e); }
});

app.post('/api/orders', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const input = z.object({ restaurantId: z.string(), items: z.array(z.object({ menuItemId: z.string(), quantity: z.number().int().positive() })).min(1), deliveryAddress: z.object({ street: z.string().min(3), city: z.string().min(2), state: z.string().length(2), zipCode: z.string().min(5) }) }).parse(req.body);
    const restaurant = await Restaurant.findById(input.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const items = input.items.map(line => {
      const menu = restaurant.menu.id(line.menuItemId);
      if (!menu || !menu.isAvailable) throw new Error('One or more menu items are unavailable');
      return { menuItemId: menu._id, name: menu.name, price: menu.price, quantity: line.quantity };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price! * item.quantity, 0);
    const order = await Order.create({ customer: req.user!.id, restaurant: restaurant.id, items, subtotal, deliveryFee: restaurant.deliveryFee, total: subtotal + restaurant.deliveryFee, deliveryAddress: input.deliveryAddress });
    res.status(201).json(order);
  } catch(e) { next(e); }
});
app.get('/api/orders/mine', requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json(await Order.find({ customer: req.user!.id }).populate('restaurant', 'name').sort({ createdAt: -1 })); } catch(e) { next(e); }
});

app.get('/api/admin/orders', requireAuth, requireAdmin, async (_req, res, next) => {
  try { res.json(await Order.find().populate('customer', 'name email').populate('restaurant', 'name').sort({ createdAt: -1 })); } catch(e) { next(e); }
});
app.patch('/api/admin/orders/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['placed','confirmed','preparing','out_for_delivery','delivered','cancelled']) }).parse(req.body);
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    order ? res.json(order) : res.status(404).json({ message: 'Order not found' });
  } catch(e) { next(e); }
});
app.post('/api/admin/restaurants', requireAuth, requireAdmin, async (req, res, next) => {
  try { res.status(201).json(await Restaurant.create(req.body)); } catch(e) { next(e); }
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof z.ZodError) return res.status(400).json({ message: 'Validation failed', errors: err.flatten() });
  console.error(err); res.status(500).json({ message: err instanceof Error ? err.message : 'Internal server error' });
});
