import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Banner from '../components/Banner/Banner';
import Featured from '../components/Featured/Featured';
import './Layout.css';

export const Layout = () => {
  return (
    <>
      <Header />
      <Banner />
      <Featured />
      
    </>
  );
};
