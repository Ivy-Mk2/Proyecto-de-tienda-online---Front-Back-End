import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import Featured from '../components/Featured/Featured';
import { useShopStore } from '../store/useShopStore';

describe('Featured component', () => {
  beforeEach(() => {
    useShopStore.setState({ cart: [], favorites: [] });
    window.localStorage.clear();
  });

  it('toggles favorite and adds product to cart', () => {
    const { container } = render(
      <MemoryRouter>
        <Featured title="Featured" />
      </MemoryRouter>,
    );

    const firstHeart = container.querySelector('.fa-heart');
    expect(firstHeart).toBeTruthy();

    fireEvent.click(firstHeart as Element);
    expect(useShopStore.getState().favorites.length).toBe(1);

    const cartIcon = container.querySelector('.fa-cart-shopping');
    fireEvent.click(cartIcon as Element);

    expect(useShopStore.getState().cart.length).toBe(1);
    expect(screen.getByText('Yeezy collection')).toBeInTheDocument();
  });
});
