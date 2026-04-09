import Header from '../components/Header/Header';
import Banner from '../components/Banner/Banner';
import SpecialBanner from '../components/SpecialBanner/SpecialBanner';
import Featured from '../components/Featured/Featured';
import Marquee from '../components/Marquee/Marquee';
import BodySection from '../components/BodySection/BodySection';
import './Layout.css';

export const Layout = () => {
  return (
    <>
      <Header />
      <Banner />
      <Featured />
      <BodySection />
      <Marquee />
      <SpecialBanner />
    </>
  );
};
