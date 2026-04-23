import { FormEvent, useEffect, useState } from 'react';
import { Product, Banner, AdminOrder } from '../types/api';
import { adminProductsService, adminBannersService, adminOrdersService } from '../services/admin.service';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { getApiErrorMessage } from '../hooks/useApiError';
import './AdminPage.css';

type AdminTab = 'products' | 'banners' | 'orders';

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  sizes: string;
  colors: string;
  featured: boolean;
};

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  sizes: '',
  colors: '',
  featured: false,
};

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(price));

// ─── Products Tab ─────────────────────────────────────────────────────────────

const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      setProducts(await adminProductsService.list());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: String(product.stock),
      category: product.category,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      featured: product.featured,
    });
    setEditingId(product.id);
    setFormError('');
    setShowForm(true);
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFormError('');

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price.trim(),
        stock: Number(form.stock),
        category: form.category.trim(),
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        featured: form.featured,
      };

      if (editingId) {
        await adminProductsService.update(editingId, payload);
      } else {
        await adminProductsService.create(payload);
      }

      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      setDeletingId(id);
      await adminProductsService.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const field = (key: keyof ProductFormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <div className="admin-section-header">
        <h2>Productos <span className="admin-badge">{products.length}</span></h2>
        <button className="admin-btn" onClick={openCreate}>+ Nuevo producto</button>
      </div>

      {error ? <p className="error admin-error">{error}</p> : null}

      {showForm ? (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
            <form onSubmit={onSave} className="admin-form">
              <label>Nombre *<input required value={form.name} onChange={(e) => field('name', e.target.value)} /></label>
              <label>Descripción<textarea rows={3} value={form.description} onChange={(e) => field('description', e.target.value)} /></label>
              <div className="admin-form__row">
                <label>Precio (PEN) *<input required type="number" step="0.01" value={form.price} onChange={(e) => field('price', e.target.value)} /></label>
                <label>Stock *<input required type="number" min="0" value={form.stock} onChange={(e) => field('stock', e.target.value)} /></label>
              </div>
              <label>Categoría<input value={form.category} onChange={(e) => field('category', e.target.value)} /></label>
              <label>Tallas (separadas por coma)<input value={form.sizes} onChange={(e) => field('sizes', e.target.value)} placeholder="S, M, L, XL" /></label>
              <label>Colores (separados por coma)<input value={form.colors} onChange={(e) => field('colors', e.target.value)} placeholder="Rojo, Negro, Blanco" /></label>
              <label className="admin-form__checkbox">
                <input type="checkbox" checked={form.featured} onChange={(e) => field('featured', e.target.checked)} />
                Producto destacado
              </label>
              {formError ? <p className="error">{formError}</p> : null}
              <div className="admin-form__actions">
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="admin-btn" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-table-wrap">
          {[1, 2, 3].map((n) => <div key={n} className="admin-skeleton" />)}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Destacado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const img = resolveImageUrl(product.images[0]?.imageUrl);
                return (
                  <tr key={product.id}>
                    <td>
                      {img ? (
                        <img src={img} alt={product.name} className="admin-table__thumb" />
                      ) : (
                        <div className="admin-table__no-img">–</div>
                      )}
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td>{product.category || '–'}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      <span className={product.stock === 0 ? 'admin-stock admin-stock--out' : 'admin-stock'}>
                        {product.stock}
                      </span>
                    </td>
                    <td>{product.featured ? '⭐' : '–'}</td>
                    <td>
                      <div className="admin-table__row-actions">
                        <button className="admin-btn admin-btn--sm" onClick={() => openEdit(product)}>Editar</button>
                        <button
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => void onDelete(product.id)}
                          disabled={deletingId === product.id}
                        >
                          {deletingId === product.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 ? <p className="admin-empty">No hay productos.</p> : null}
        </div>
      )}
    </div>
  );
};

// ─── Banners Tab ──────────────────────────────────────────────────────────────

const BannersTab = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setBanners(await adminBannersService.list());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const onDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este banner?')) return;
    try {
      setDeletingId(id);
      await adminBannersService.remove(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="admin-skeleton" style={{ height: 200 }} />;

  return (
    <div>
      <div className="admin-section-header">
        <h2>Banners <span className="admin-badge">{banners.length}</span></h2>
        <p className="admin-hint">La gestión completa de imágenes requiere integración con upload.</p>
      </div>
      {error ? <p className="error admin-error">{error}</p> : null}
      <div className="admin-banner-grid">
        {banners.map((banner) => {
          const img = resolveImageUrl(banner.imageUrl);
          return (
            <div key={banner.id} className="admin-banner-card">
              {img ? <img src={img} alt={banner.title} className="admin-banner-card__img" /> : null}
              <div className="admin-banner-card__body">
                <strong>{banner.title}</strong>
                {banner.subtitle ? <p>{banner.subtitle}</p> : null}
                <span className={`admin-badge ${banner.isActive ? 'admin-badge--green' : 'admin-badge--gray'}`}>
                  {banner.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <button
                className="admin-btn admin-btn--sm admin-btn--danger"
                onClick={() => void onDelete(banner.id)}
                disabled={deletingId === banner.id}
              >
                {deletingId === banner.id ? '...' : 'Eliminar'}
              </button>
            </div>
          );
        })}
        {banners.length === 0 ? <p className="admin-empty">No hay banners.</p> : null}
      </div>
    </div>
  );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────

const OrdersTab = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const load = async (p: number) => {
    try {
      setLoading(true);
      const result = await adminOrdersService.list({ page: p });
      setOrders(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(page); }, [page]);

  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Completado',
  };

  if (loading) return <div className="admin-skeleton" style={{ height: 200 }} />;

  return (
    <div>
      <div className="admin-section-header">
        <h2>Pedidos <span className="admin-badge">{meta.total}</span></h2>
      </div>
      {error ? <p className="error admin-error">{error}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Envío a</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><code className="admin-id">{order.id.slice(0, 8).toUpperCase()}</code></td>
                <td>
                  <span>{order.user.name}</span>
                  <br />
                  <small style={{ color: '#888' }}>{order.user.email}</small>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('es-PE')}</td>
                <td><strong>{formatPrice(order.total)}</strong></td>
                <td>
                  <span className={`admin-status admin-status--${order.paymentStatus.toLowerCase()}`}>
                    {STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
                  </span>
                </td>
                <td>
                  {order.shippingAddress
                    ? `${order.shippingAddress.district}, ${order.shippingAddress.city}`
                    : '–'}
                </td>
                <td>{order.items.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? <p className="admin-empty">No hay pedidos registrados.</p> : null}
      </div>
      {meta.pages > 1 ? (
        <div className="admin-pagination">
          <button
            className="admin-btn admin-btn--sm admin-btn--secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          <span className="admin-pagination__info">
            Página {page} de {meta.pages} ({meta.total} pedidos)
          </span>
          <button
            className="admin-btn admin-btn--sm admin-btn--secondary"
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page === meta.pages}
          >
            Siguiente →
          </button>
        </div>
      ) : null}
    </div>
  );
};

// ─── AdminPage ────────────────────────────────────────────────────────────────

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  return (
    <main className="container admin-page">
      <h1 className="admin-page__title">Panel de administración</h1>

      <nav className="admin-tabs">
        {([['products', 'Productos'], ['banners', 'Banners'], ['orders', 'Pedidos']] as [AdminTab, string][]).map(
          ([tab, label]) => (
            <button
              key={tab}
              className={`admin-tabs__btn ${activeTab === tab ? 'admin-tabs__btn--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ),
        )}
      </nav>

      <div className="admin-content">
        {activeTab === 'products' ? <ProductsTab /> : null}
        {activeTab === 'banners' ? <BannersTab /> : null}
        {activeTab === 'orders' ? <OrdersTab /> : null}
      </div>
    </main>
  );
};
