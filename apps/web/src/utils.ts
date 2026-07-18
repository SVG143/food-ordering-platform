import type { CartLine } from './types';

export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((total, line) => total + line.item.price * line.quantity, 0);

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
