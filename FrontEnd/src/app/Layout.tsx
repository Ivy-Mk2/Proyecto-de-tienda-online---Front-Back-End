import Header from '../components/Header/Header';
import Banner from '../components/Banner/Banner';
import SpecialBanner from '../components/SpecialBanner/SpecialBanner';
import Featured from '../components/Featured/Featured';
import Marquee from '../components/Marquee/Marquee';
import SaleBanner from  '../components/SaleBanner/SaleBanner';
import BodySection from '../components/BodySection/BodySection';
import Announcement from '../components/Announcement/Announcement';
import Newsletter from '../components/Newsletter/Newsletter';
import Footer from '../components/Footer/Footer';
import './Layout.css';

export const Layout = () => {
  return (
    <>
      <Header />
      <Banner />
      <Featured />
      <SpecialBanner />
      <Marquee />
      <SaleBanner />  
      <BodySection />
      <Announcement />
      <Newsletter />
      <Footer />
    </>
  );
};
