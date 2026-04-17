import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../hooks/useApiError';
import { tokens } from '../lib/api/tokens';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const searchParams = new URLSearchParams(location.search);
  const oauthToken = searchParams.get('accessToken');
  const oauthSource = searchParams.get('oauth');

  const [email, setEmail] = useState('customer@shop.local');
  const [password, setPassword] = useState('Customer123!');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!oauthToken) return;
    tokens.setAccessToken(oauthToken);
    navigate(from, { replace: true });
  }, [oauthToken, navigate, from]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <main className="container">
      <h1>Iniciar sesión</h1>
      <form className="card" onSubmit={onSubmit}>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit">Entrar</button>
      </form>
      <div className="stack" style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'}/auth/google`;
          }}
        >
          Continuar con Google
        </button>
        {oauthSource === 'google' && !oauthToken ? (
          <p className="error">No se pudo completar el login con Google.</p>
        ) : null}
      </div>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </main>
  );
};
