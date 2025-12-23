import { notFound } from "next/navigation";
import { products } from "@/lib/data";
import ProductDetails from "@/components/product-details";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === parseInt(id));
  
  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}