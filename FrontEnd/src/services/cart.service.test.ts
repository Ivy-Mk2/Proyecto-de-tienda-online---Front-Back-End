import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from './cart.service';
import { apiRequest } from '../lib/api/client';
import { tokens } from '../lib/api/tokens';

vi.mock('../lib/api/client');
vi.mock('../lib/api/tokens');

const mockCart = { id: 'cart-1', items: [] };
const GUEST_TOKEN = 'guest_test-uuid';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(tokens.getGuestToken).mockReturnValue(GUEST_TOKEN);
  vi.mocked(apiRequest).mockResolvedValue(mockCart);
});

describe('cartService.getCart', () => {
  it('calls GET /cart with auth:true when authenticated', async () => {
    await cartService.getCart(true);

    expect(apiRequest).toHaveBeenCalledWith('/cart', { auth: true });
  });

  it('calls GET /cart with guestToken query param when guest', async () => {
    await cartService.getCart(false);

    // Guest call: only the URL is passed (no options object) — no auth header
    expect(apiRequest).toHaveBeenCalledWith(`/cart?guestToken=${GUEST_TOKEN}`);
  });
});

describe('cartService.addItem', () => {
  it('calls POST /cart/items with auth when authenticated', async () => {
    await cartService.addItem({ productId: 'prod-1', quantity: 2, isAuthenticated: true });

    expect(apiRequest).toHaveBeenCalledWith('/cart/items', {
      method: 'POST',
      auth: true,
      body: { productId: 'prod-1', quantity: 2 },
    });
  });

  it('includes guestToken in body when not authenticated', async () => {
    await cartService.addItem({ productId: 'prod-1', quantity: 1, isAuthenticated: false });

    expect(apiRequest).toHaveBeenCalledWith('/cart/items', {
      method: 'POST',
      body: { productId: 'prod-1', quantity: 1, guestToken: GUEST_TOKEN },
    });
  });
});

describe('cartService.updateItem', () => {
  it('calls PATCH /cart/items/:id with auth when authenticated', async () => {
    await cartService.updateItem({ itemId: 'item-1', quantity: 3, isAuthenticated: true });

    expect(apiRequest).toHaveBeenCalledWith('/cart/items/item-1', {
      method: 'PATCH',
      auth: true,
      body: { quantity: 3 },
    });
  });

  it('includes guestToken in body when guest', async () => {
    await cartService.updateItem({ itemId: 'item-1', quantity: 2, isAuthenticated: false });

    expect(apiRequest).toHaveBeenCalledWith('/cart/items/item-1', {
      method: 'PATCH',
      body: { quantity: 2, guestToken: GUEST_TOKEN },
    });
  });
});

describe('cartService.removeItem', () => {
  it('calls DELETE /cart/items/:id with auth when authenticated', async () => {
    await cartService.removeItem({ itemId: 'item-1', isAuthenticated: true });

    expect(apiRequest).toHaveBeenCalledWith('/cart/items/item-1', {
      method: 'DELETE',
      auth: true,
    });
  });

  it('includes guestToken query when guest', async () => {
    await cartService.removeItem({ itemId: 'item-1', isAuthenticated: false });

    expect(apiRequest).toHaveBeenCalledWith(
      expect.stringContaining(`guestToken=${GUEST_TOKEN}`),
      { method: 'DELETE' },
    );
  });
});

describe('cartService.mergeGuestCart', () => {
  it('calls POST /cart/merge with guestToken and auth', async () => {
    await cartService.mergeGuestCart();

    expect(apiRequest).toHaveBeenCalledWith('/cart/merge', {
      method: 'POST',
      auth: true,
      body: { guestToken: GUEST_TOKEN },
    });
  });
});
