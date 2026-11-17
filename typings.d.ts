interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  rating: number;
  description: string;
  mainImage: string;
  manufacturer: string;
  categoryId: string;
  merchantId?: string;
  category?: { id?: string; name: string };
  merchant?: { id: string; name: string; status?: string };
  _count?: { reviews?: number };
  inStock: number;
}

interface Review {
  id: string;
  productId: string;
  author: string;
  email?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean;
  createdAt: string;
}

interface Merchant {
  id: string;
  name: string;
  email: string;
  description: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

interface SingleProductPageProps {
  params: {
    id: string;
    productSlug: string;
  };
}

type ProductInWishlist = {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number;
};

interface OtherImages {
  imageID: string;
  productID: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

interface User {
  id: string;
  email: string;
  password?: string | null;
  role: string;
}

interface OrderProductLine {
  id: string;
  customerOrderId: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    title: string;
    slug: string;
    mainImage: string;
    price: number;
  };
}

interface Order {
  id: string;
  adress: string;
  apartment: string;
  company: string;
  dateTime: string;
  email: string;
  lastname: string;
  name: string;
  phone: string;
  postalCode: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "canceled";
  city: string;
  country: string;
  orderNotice?: string | null;
  total: number;
  products?: OrderProductLine[];
}

interface SingleProductBtnProps {
  product: Product;
  quantityCount: number;
}

interface WishListItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
}

