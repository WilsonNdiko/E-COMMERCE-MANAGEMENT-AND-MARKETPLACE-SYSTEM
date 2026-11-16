import {
  CategoryMenu,
  Hero,
  Incentives,
  IntroducingSection,
  Newsletter,
  ProductsSection,
} from "@/components";

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
