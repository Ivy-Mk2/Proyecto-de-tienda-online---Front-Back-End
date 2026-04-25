import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../hooks/useApiError';
import { tokens } from '../lib/api/tokens';
import '../styles/808xhz-pages.css';

const AUTH_IMG = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=85';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const searchParams = new URLSearchParams(location.search);
  const oauthToken = searchParams.get('accessToken');
  const oauthSource = searchParams.get('oauth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oauthToken) return;
    tokens.setAccessToken(oauthToken);
    navigate(from, { replace: true });
  }, [oauthToken, navigate, from]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h808-page">
      <div className="auth">
        <div className="auth__visual">
          <img className="auth__visual-img" src={AUTH_IMG} alt="" />
          <div className="auth__visual-overlay" />
          <div className="auth__visual-grid" />
          <div className="auth__visual-body">
            <div className="auth__visual-top">
              <span className="h808-mark" style={{ fontSize: 22 }}>808<em>xHz</em></span>
              <span>Miembros 808 · Beneficios</span>
            </div>
            <div className="auth__visual-main">
              <div className="auth__visual-kicker">Únete al club</div>
              <h2 className="auth__visual-title">Entra<br />al club<em>.</em></h2>
              <p className="auth__visual-desc">
                Acceso anticipado a drops, beneficios exclusivos y descuentos de hasta{' '}
                <strong>80%</strong> en colecciones pasadas.
              </p>
              <div className="auth__visual-stats">
                <div className="auth__visual-stat"><div className="n">−80%</div><div className="l">Hasta descuento</div></div>
                <div className="auth__visual-stat"><div className="n">48h</div><div className="l">Acceso anticipado</div></div>
                <div className="auth__visual-stat"><div className="n">+12k</div><div className="l">Miembros activos</div></div>
              </div>
            </div>
            <div className="auth__visual-foot">© 2026 · 808xHz Apparel Club</div>
          </div>
        </div>

        <div className="auth__panel">
          <div className="auth__panel-inner">
            <div className="auth__tabs">
              <button className="auth__tab auth__tab--active">Iniciar sesión</button>
              <button className="auth__tab" onClick={() => navigate('/register')}>Crear cuenta</button>
            </div>

            <div className="auth__kicker">Bienvenido de vuelta</div>
            <h1 className="auth__title">Entra al club.</h1>
            <p className="auth__sub">Ingresa a tu cuenta 808xHz para ver tus pedidos, favoritos y drops guardados.</p>

            <div className="auth__social">
              <button
                className="auth__social-btn"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'}/auth/google`;
                }}
              >
                <i className="fa-brands fa-google"></i>
                <span>Continuar con Google</span>
              </button>
            </div>

            <div className="auth__divider">o con email</div>

            <form className="auth__form" onSubmit={(e) => void onSubmit(e)}>
              <div className="auth__field">
                <label>Correo electrónico</label>
                <div className="auth__input">
                  <i className="fa-regular fa-envelope"></i>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="auth__field">
                <label>Contraseña</label>
                <div className="auth__input">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>}
              {oauthSource === 'google' && !oauthToken && (
                <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>No se pudo completar el login con Google.</p>
              )}

              <button className="auth__submit" type="submit" disabled={loading}>
                <span>{loading ? 'Entrando…' : 'Iniciar sesión'}</span>
                {!loading && <i className="fa-solid fa-arrow-right"></i>}
              </button>
            </form>

            <p className="auth__legal">
              ¿Olvidaste tu contraseña? <a>Recupérala aquí</a>. ¿Nuevo aquí?{' '}
              <a onClick={() => navigate('/register')}>Crea una cuenta</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
