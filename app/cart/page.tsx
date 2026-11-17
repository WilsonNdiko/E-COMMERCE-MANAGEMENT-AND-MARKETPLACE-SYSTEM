import SectionTitle from "@/components/SectionTitle";
import CartView from "@/components/CartView";
import { Loader } from "@/components/Loader";
import { Suspense } from "react";

const CartPage = () => {
  return (
    <div className="bg-canvas min-h-[75vh] pb-16">
      <SectionTitle title="Shopping Cart" path="Home | Cart" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <Suspense fallback={<Loader />}>
          <CartView />
        </Suspense>
      </div>
    </div>
  );
};

export default CartPage;
