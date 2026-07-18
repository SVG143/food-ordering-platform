import { describe, expect, it } from 'vitest';
import { cartSubtotal, formatCurrency } from './utils';

describe('cart utilities', () => {
  it('calculates a quantity-aware subtotal', () => {
    expect(cartSubtotal([{ item: { _id: '1', name: 'Bowl', description: '', price: 12.5, category: 'Bowls', isAvailable: true }, quantity: 2 }])).toBe(25);
  });

  it('formats US currency', () => expect(formatCurrency(25)).toBe('$25.00'));
});
