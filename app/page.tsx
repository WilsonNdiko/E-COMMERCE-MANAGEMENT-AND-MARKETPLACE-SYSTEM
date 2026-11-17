import CategoryMenu from "@/components/CategoryMenu";
import Hero from "@/components/Hero";
import Incentives from "@/components/Incentives";
import IntroducingSection from "@/components/IntroducingSection";
import Newsletter from "@/components/Newsletter";
import ProductsSection from "@/components/ProductsSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <Incentives />
      <CategoryMenu />
      <ProductsSection />
      <IntroducingSection />
      <Newsletter />
    </>
  );
}
