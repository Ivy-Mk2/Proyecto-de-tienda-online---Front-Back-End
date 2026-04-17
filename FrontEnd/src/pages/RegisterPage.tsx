import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../hooks/useApiError';
import { loadFacebookSdk, loadGoogleSdk } from '../lib/social/sdk';

export const RegisterPage = () => {
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined, []);
  const facebookAppId = useMemo(() => import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined, []);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let active = true;

    const setupGoogle = async () => {
      try {
        await loadGoogleSdk();
        if (!active || !window.google || !googleButtonRef.current) return;

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) return;
            try {
              setError('');
              setLoadingGoogle(true);
              await loginWithGoogle(response.credential);
              navigate('/', { replace: true });
            } catch (err) {
              setError(getApiErrorMessage(err));
            } finally {
              setLoadingGoogle(false);
            }
          },
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
          width: 320,
        });
      } catch {
        setError('No se pudo cargar Google Identity Services.');
      }
    };

    void setupGoogle();

    return () => {
      active = false;
    };
  }, [googleClientId, loginWithGoogle, navigate]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('La confirmación de contraseña no coincide.');
      return;
    }

    try {
      setError('');
      setLoadingLocal(true);
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoadingLocal(false);
    }
  };

  const onFacebookRegister = async () => {
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
            navigate('/', { replace: true });
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
    <main className="container">
      <h1>Crear cuenta</h1>
      <p>Regístrate para comprar y gestionar tus pedidos.</p>

      <form className="card" onSubmit={onSubmit}>
        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label>
          Confirmar password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loadingLocal || loadingGoogle || loadingFacebook}>
          {loadingLocal ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <section className="card" style={{ marginTop: 12 }}>
        <h2>O regístrate con</h2>
        <div ref={googleButtonRef} />
        {!googleClientId ? (
          <p className="error">Configura VITE_GOOGLE_CLIENT_ID para habilitar Google.</p>
        ) : null}

        <button
          type="button"
          style={{ marginTop: 12 }}
          onClick={onFacebookRegister}
          disabled={loadingLocal || loadingGoogle || loadingFacebook}
        >
          {loadingFacebook ? 'Conectando con Facebook...' : 'Continuar con Facebook'}
        </button>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <p>
        ¿Ya tienes cuenta? Inicia sesión desde el icono de usuario en el Header. También puedes volver al{' '}
        <Link to="/">inicio</Link>.
      </p>
    </main>
  );
};
