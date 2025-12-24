import { notFound } from "next/navigation";
import { ProductService } from "@/lib/firebase-services";
import ProductDetails from "@/components/product-details";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await ProductService.getProductById(parseInt(id));
  
  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}