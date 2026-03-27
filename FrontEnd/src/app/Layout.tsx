import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header/Header';


export const Layout = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <Header />
        <div> 
          {isAuthenticated ? (
            <>
              <span>{user?.email}</span>
              <button onClick={() => void logout()}>Salir</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <Outlet />
    </>
  );
};
