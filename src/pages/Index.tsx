import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { ServiceCategories } from '@/components/home/ServiceCategories';
import { FeaturedProviders } from '@/components/home/FeaturedProviders';
import { HowItWorks } from '@/components/home/HowItWorks';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServiceCategories />
      <FeaturedProviders />
      <HowItWorks />
    </Layout>
  );
};

export default Index;
