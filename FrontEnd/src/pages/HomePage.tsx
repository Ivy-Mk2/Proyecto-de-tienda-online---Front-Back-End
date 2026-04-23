import Banner from '../components/Banner/Banner';
import SpecialBanner from '../components/SpecialBanner/SpecialBanner';
import Featured from '../components/Featured/Featured';
import Marquee from '../components/Marquee/Marquee';
import SaleBanner from '../components/SaleBanner/SaleBanner';
import BodySection from '../components/BodySection/BodySection';
import Announcement from '../components/Announcement/Announcement';
import Newsletter from '../components/Newsletter/Newsletter';

export const HomePage = () => {
  return (
    <>
      <Banner />
      <Featured />
      <SpecialBanner />
      <Marquee />
      <SaleBanner />
      <BodySection />
      <Announcement />
      <Newsletter />
    </>
  );
};
