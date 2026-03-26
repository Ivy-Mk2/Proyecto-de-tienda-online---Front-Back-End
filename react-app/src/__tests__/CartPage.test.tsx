import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CartPage from '../pages/CartPage';
import { useShopStore } from '../store/useShopStore';

vi.mock('../components/Header/Header', () => ({ default: () => <div>Header</div> }));
vi.mock('../components/Footer/Footer', () => ({ default: () => <div>Footer</div> }));
vi.mock('../components/Featured/Featured', () => ({ default: () => <div>Featured</div> }));

describe('Cart page', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useShopStore.setState({
      cart: [{ id: '1', productId: 1, quantity: 1 }],
      favorites: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates quantity and removes items from cart', async () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );

    vi.advanceTimersByTime(400);

    expect(await screen.findByText('Carrito de compras')).toBeInTheDocument();

    const quantityInput = screen.getByDisplayValue('1');
    fireEvent.change(quantityInput, { target: { value: '2' } });

    expect(screen.getByText('Cantidad actualizada')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Eliminar'));

    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument();
  });
});
