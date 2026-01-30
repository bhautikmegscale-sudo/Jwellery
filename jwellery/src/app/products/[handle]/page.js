
import { notFound } from "next/navigation";
import { getProductByHandle } from "../../api/product/route";
import ProductClient from "./ProductClient";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) return {};

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.featuredImage?.url],
    },
  };
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  return <ProductClient product={product} />;
}
