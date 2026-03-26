import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../pages/Home';

vi.mock('../components/Header/Header', () => ({ default: () => <div>Header</div> }));
vi.mock('../components/Banner/Banner', () => ({ default: () => <div>Banner</div> }));
vi.mock('../components/Footer/Footer', () => ({ default: () => <div>Footer</div> }));
vi.mock('../components/Featured/Featured', () => ({ default: () => <div>Featured</div> }));
vi.mock('../components/SpecialBanner/SpecialBanner', () => ({ default: () => <div>Special</div> }));
vi.mock('../components/Section/Section', () => ({ default: () => <div>Section</div> }));
vi.mock('../components/BodySection/BodySection', () => ({ default: () => <div>Body</div> }));
vi.mock('../components/Marquee/Marquee', () => ({ default: () => <div>Marquee</div> }));

describe('Home page', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state first and then renders content', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    vi.advanceTimersByTime(400);

    expect(await screen.findByText('ÚNETE A NUESTRA COMUNIDAD Y RECIBE LAS ÚLTIMAS NOTICIAS')).toBeInTheDocument();
  });
});
