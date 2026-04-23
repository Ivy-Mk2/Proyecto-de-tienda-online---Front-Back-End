import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CheckoutPage } from './CheckoutPage';
import { cartService } from '../services/cart.service';
import { ordersService } from '../services/orders.service';

vi.mock('../services/cart.service');
vi.mock('../services/orders.service');
// Mock useNavigate to prevent actual navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockCart = {
  id: 'cart-1',
  items: [
    {
      id: 'item-1',
      quantity: 2,
      productId: 'prod-1',
      priceSnapshot: '99.90',
      product: {
        id: 'prod-1',
        name: 'Camiseta Premium',
        description: '',
        price: '99.90',
        stock: 10,
        category: 'Ropa',
        sizes: ['M'],
        colors: ['Blanco'],
        featured: false,
        isActive: true,
        images: [],
      },
    },
  ],
};

const mockOrder = {
  id: 'order-abc123',
  total: '199.80',
  paymentStatus: 'PAID',
  paymentProvider: 'SIMULATED',
  shippingAddress: null,
  createdAt: new Date().toISOString(),
  items: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  vi.mocked(cartService.getCart).mockResolvedValue(mockCart);
  vi.mocked(ordersService.checkout).mockResolvedValue(mockOrder);
});

const renderCheckout = () =>
  render(
    <MemoryRouter>
      <CheckoutPage />
    </MemoryRouter>,
  );

const fillDeliveryForm = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText(/María García/i), 'Ana Torres');
  await user.type(screen.getByPlaceholderText(/\+51/i), '999888777');
  await user.type(screen.getByPlaceholderText(/Av\. Principal/i), 'Calle Los Álamos 456');
  await user.type(screen.getByPlaceholderText(/Miraflores/i), 'San Isidro');
};

describe('CheckoutPage', () => {
  it('renders the delivery step by default after cart loads', async () => {
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Datos de envío')).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument(); // step indicator
  });

  it('redirects to /cart when cart is empty', async () => {
    vi.mocked(cartService.getCart).mockResolvedValue({ id: 'empty-cart', items: [] });

    renderCheckout();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/cart', { replace: true });
    });
  });

  it('shows loading state before cart loads', () => {
    // Keep getCart pending
    vi.mocked(cartService.getCart).mockReturnValue(new Promise(() => {}));

    renderCheckout();

    expect(screen.getByText(/Cargando carrito/i)).toBeInTheDocument();
  });

  it('shows error when cart fails to load', async () => {
    vi.mocked(cartService.getCart).mockRejectedValue({ status: 500, message: 'Server error' });

    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it('advances to payment step after completing delivery form', async () => {
    renderCheckout();

    await waitFor(() => screen.getByText('Datos de envío'));

    await fillDeliveryForm();
    fireEvent.click(screen.getByText(/Continuar al pago/i));

    await waitFor(() => {
      expect(screen.getByText('Método de pago')).toBeInTheDocument();
    });
  });

  it('can navigate back from payment to delivery', async () => {
    renderCheckout();
    await waitFor(() => screen.getByText('Datos de envío'));

    await fillDeliveryForm();
    fireEvent.click(screen.getByText(/Continuar al pago/i));
    await waitFor(() => screen.getByText('Método de pago'));

    fireEvent.click(screen.getByText(/← Volver/i));

    await waitFor(() => {
      expect(screen.getByText('Datos de envío')).toBeInTheDocument();
    });
  });

  it('shows order summary with cart items', async () => {
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Camiseta Premium')).toBeInTheDocument();
    });
  });

  it('advances through all steps and places order', async () => {
    renderCheckout();
    await waitFor(() => screen.getByText('Datos de envío'));

    // Step 1: delivery
    await fillDeliveryForm();
    fireEvent.click(screen.getByText(/Continuar al pago/i));
    await waitFor(() => screen.getByText('Método de pago'));

    // Step 2: payment
    fireEvent.click(screen.getByText(/Revisar pedido/i));
    await waitFor(() => screen.getByText('Resumen del pedido'));

    // Step 3: review & confirm
    fireEvent.click(screen.getByText(/Confirmar pedido/i));

    await waitFor(() => {
      expect(ordersService.checkout).toHaveBeenCalledOnce();
    });

    // Success screen
    await waitFor(() => {
      expect(screen.getByText(/¡Pedido confirmado!/i)).toBeInTheDocument();
    });
  });

  it('shows error message when checkout fails', async () => {
    vi.mocked(ordersService.checkout).mockRejectedValue({ status: 400, message: 'Cart is empty' });

    renderCheckout();
    await waitFor(() => screen.getByText('Datos de envío'));

    await fillDeliveryForm();
    fireEvent.click(screen.getByText(/Continuar al pago/i));
    await waitFor(() => screen.getByText('Método de pago'));
    fireEvent.click(screen.getByText(/Revisar pedido/i));
    await waitFor(() => screen.getByText('Resumen del pedido'));
    fireEvent.click(screen.getByText(/Confirmar pedido/i));

    await waitFor(() => {
      expect(screen.getByText(/Cart is empty/i)).toBeInTheDocument();
    });
  });

  it('passes shippingAddress to ordersService.checkout', async () => {
    renderCheckout();
    await waitFor(() => screen.getByText('Datos de envío'));

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/María García/i), 'Pedro Pérez');
    await user.type(screen.getByPlaceholderText(/\+51/i), '987654321');
    await user.type(screen.getByPlaceholderText(/Av\. Principal/i), 'Jr. Ucayali 200');
    await user.type(screen.getByPlaceholderText(/Miraflores/i), 'Cercado de Lima');

    fireEvent.click(screen.getByText(/Continuar al pago/i));
    await waitFor(() => screen.getByText('Método de pago'));
    fireEvent.click(screen.getByText(/Revisar pedido/i));
    await waitFor(() => screen.getByText('Resumen del pedido'));
    fireEvent.click(screen.getByText(/Confirmar pedido/i));

    await waitFor(() => {
      expect(ordersService.checkout).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Pedro Pérez',
          phone: '987654321',
          address: 'Jr. Ucayali 200',
          district: 'Cercado de Lima',
          city: 'Lima',
        }),
      );
    });
  });
});
