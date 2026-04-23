import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../hooks/useApiError';
import { loadFacebookSdk, loadGoogleSdk } from '../../lib/social/sdk';
import useDropdown from '../Hooks/hooks';

const User = () => {
  const { isActive, toggleDropdown, dropdownRef, dropdownRefIcon } = useDropdown<HTMLDivElement>();
  const { isAuthenticated, user, login, loginWithGoogle, loginWithFacebook, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);

  const redirectAfterLogin = useCallback(() => {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    if (from && from !== '/') navigate(from, { replace: true });
  }, [location.state, navigate]);

  const googleContainerRef = useRef<HTMLDivElement>(null);

  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined, []);
  const facebookAppId = useMemo(() => import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined, []);

  useEffect(() => {
    if (!isActive || !googleClientId || !googleContainerRef.current || isAuthenticated) return;

    let active = true;

    const setupGoogle = async () => {
      try {
        await loadGoogleSdk();
        if (!active || !window.google || !googleContainerRef.current) return;

        googleContainerRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) return;
            try {
              setError('');
              await loginWithGoogle(response.credential);
              redirectAfterLogin();
            } catch (err) {
              setError(getApiErrorMessage(err));
            }
          },
        });

        window.google.accounts.id.renderButton(googleContainerRef.current, {
          theme: 'outline',
          size: 'medium',
          text: 'signin_with',
          width: 260,
        });
      } catch {
        setError('No se pudo cargar Google Identity Services.');
      }
    };

    void setupGoogle();

    return () => {
      active = false;
    };
  }, [googleClientId, isActive, isAuthenticated, loginWithGoogle]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError('');
      setLoadingLocal(true);
      await login(email.trim().toLowerCase(), password);
      setPassword('');
      setEmail('');
      redirectAfterLogin();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoadingLocal(false);
    }
  };

  const onFacebookLogin = async () => {
    if (!facebookAppId) {
      setError('Configura VITE_FACEBOOK_APP_ID para habilitar Facebook.');
      return;
    }

    try {
      setError('');
      setLoadingFacebook(true);
      await loadFacebookSdk(facebookAppId);

      window.FB.login(
        async (response) => {
          try {
            if (!response.authResponse?.accessToken) {
              throw new Error('No se obtuvo access token de Facebook.');
            }

            await loginWithFacebook(response.authResponse.accessToken);
            redirectAfterLogin();
          } catch (err) {
            setError(getApiErrorMessage(err));
          } finally {
            setLoadingFacebook(false);
          }
        },
        { scope: 'email,public_profile' },
      );
    } catch (err) {
      setLoadingFacebook(false);
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="user">
      <div className="header__icon" onClick={toggleDropdown} ref={dropdownRefIcon}>
        <i className="fa-solid fa-user"></i>
      </div>

      <div className={`header__dropdown ${isActive ? 'header__dropdown--active' : ''}`} ref={dropdownRef}>
        {isAuthenticated ? (
          <div className="header__auth-status">
            <p>Hola, {user?.name}</p>
            <p>Sesión con {user?.authProvider.toLowerCase()}.</p>
            <div className="header__auth-links">
              <Link to="/orders" onClick={toggleDropdown}>Mis pedidos</Link>
              <Link to="/favoritos" onClick={toggleDropdown}>Mis favoritos</Link>
              {user?.role === 'ADMIN' ? (
                <Link to="/admin" onClick={toggleDropdown}>Panel admin</Link>
              ) : null}
            </div>
            <button type="button" onClick={() => void logout()}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
            <form className="header__login-form" onSubmit={onSubmit}>
              <label htmlFor="user-email">Email:</label>
              <input
                type="email"
                id="user-email"
                name="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button type="submit" disabled={loadingLocal || loadingFacebook}>
                {loadingLocal ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="login__options">
              <button
                type="button"
                className="login__social-button"
                onClick={onFacebookLogin}
                disabled={loadingLocal || loadingFacebook}
              >
                {loadingFacebook ? 'Conectando...' : 'Continuar con Facebook'}
              </button>
              <div ref={googleContainerRef} />
              {!googleClientId ? (
                <p className="error">Configura VITE_GOOGLE_CLIENT_ID para Google.</p>
              ) : null}
            </div>

            {error ? <p className="error">{error}</p> : null}

            <div className="header__register-link">
              <p>
                ¿No eres usuario? <Link to="/register">Regístrate aquí</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default User;
